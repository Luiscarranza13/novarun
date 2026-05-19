import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { request } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outDir = path.join(root, "exports", "teachable-machine", "characters");
const tmpDir = path.join(root, "exports", "teachable-machine", "tmp");
const htmlPath = path.join(root, "tools", "export-character-images.html");
const chromePath = path.join(
  process.env.LOCALAPPDATA ?? "",
  "ms-playwright",
  "chromium-1217",
  "chrome-win64",
  "chrome.exe"
);
const port = 9333;

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

function getJson(url) {
  return new Promise((resolve, reject) => {
    request(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch (error) { reject(error); }
      });
    }).on("error", reject).end();
  });
}

async function waitForDebuggerUrl() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
      const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error("Chromium did not expose a debugging endpoint.");
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.id) return;
    const callbacks = pending.get(msg.id);
    if (!callbacks) return;
    pending.delete(msg.id);
    msg.error ? callbacks.reject(new Error(msg.error.message)) : callbacks.resolve(msg.result);
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  return {
    async send(method, params = {}) {
      await opened;
      const messageId = ++id;
      const result = new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return result;
    },
    close() {
      ws.close();
    },
  };
}

const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  "--disable-gpu",
  "--allow-file-access-from-files",
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore" });

try {
  const cdp = connectCdp(await waitForDebuggerUrl());
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.navigate", { url: pathToFileURL(htmlPath).href });

  const deadline = Date.now() + 15000;
  let exportData;
  while (Date.now() < deadline) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: "window.__spriteExport || null",
      returnByValue: true,
      awaitPromise: true,
    });
    exportData = result.result.value;
    if (Array.isArray(exportData) && exportData.length > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  if (!Array.isArray(exportData) || exportData.length === 0) {
    throw new Error("No sprite data was exported from the browser.");
  }

  for (const image of exportData) {
    const characterDir = path.join(outDir, image.character);
    await mkdir(characterDir, { recursive: true });
    const base64 = image.dataUrl.replace(/^data:image\/png;base64,/, "");
    await writeFile(path.join(characterDir, image.fileName), Buffer.from(base64, "base64"));
  }

  await writeFile(
    path.join(root, "exports", "teachable-machine", "README.txt"),
    [
      "Dataset para Teachable Machine.",
      "",
      "Cada carpeta es una clase/personaje.",
      "Cada PNG mide 224x224 con fondo transparente.",
      `Total de imagenes: ${exportData.length}`,
      `Imagenes por personaje: ${exportData.length / new Set(exportData.map((item) => item.character)).size}`,
      "",
    ].join("\r\n")
  );

  cdp.close();
} finally {
  chrome.kill();
}
