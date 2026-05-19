/**
 * Pokémon sprite drawing functions.
 * All sprites are drawn procedurally with Canvas 2D — no external images needed.
 * Each function uses proportional coordinates (0–1 mapped to w/h) for scalability.
 */

type Ctx = CanvasRenderingContext2D;

// ─── Utilities ────────────────────────────────────────────────────────────────

function circ(ctx: Ctx, cx: number, cy: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellips(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, fill: string, rot = 0) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function eye(ctx: Ctx, cx: number, cy: number, r: number, pupilColor = "#1a1a1a") {
  circ(ctx, cx, cy, r,       "#FFFFFF");
  circ(ctx, cx + r * 0.3, cy, r * 0.65, pupilColor);
  circ(ctx, cx + r * 0.55, cy - r * 0.3, r * 0.22, "#FFFFFF");
}

function xEye(ctx: Ctx, cx: number, cy: number, size: number) {
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = Math.max(1.5, size * 0.4);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size, cy - size); ctx.lineTo(cx + size, cy + size);
  ctx.moveTo(cx + size, cy - size); ctx.lineTo(cx - size, cy + size);
  ctx.stroke();
}

// ─── Pikachu ──────────────────────────────────────────────────────────────────

export function drawPikachu(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(10) sepia(1) hue-rotate(0deg) saturate(5)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.25) * 3 : 0;

  // Lightning tail
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(w * 0.76, h * 0.68 + bob); ctx.lineTo(w * 0.96, h * 0.54 + bob);
  ctx.lineTo(w * 0.84, h * 0.49 + bob); ctx.lineTo(w * 1.0,  h * 0.33 + bob);
  ctx.lineTo(w * 0.84, h * 0.39 + bob); ctx.lineTo(w * 0.77, h * 0.27 + bob);
  ctx.lineTo(w * 0.68, h * 0.56 + bob); ctx.closePath(); ctx.fill();
  // Brown tail root
  ellips(ctx, w * 0.73, h * 0.70 + bob, w * 0.07, h * 0.05, "#8B4513", -0.4);

  // Body
  ellips(ctx, w * 0.46, h * 0.70 + bob, w * 0.35, h * 0.26, "#FFD700");
  // Head
  circ(ctx,   w * 0.43, h * 0.37 + bob, w * 0.32, "#FFD700");

  // Brown back stripes
  ctx.strokeStyle = "#A0522D"; ctx.lineWidth = w * 0.07; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.56 + bob); ctx.lineTo(w * 0.64, h * 0.53 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.53, h * 0.65 + bob); ctx.lineTo(w * 0.65, h * 0.62 + bob); ctx.stroke();

  // Ears
  function ear(tipX: number, tipY: number, base1X: number, base1Y: number, base2X: number, base2Y: number) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath(); ctx.moveTo(base1X, base1Y + bob); ctx.lineTo(tipX, tipY + bob); ctx.lineTo(base2X, base2Y + bob); ctx.closePath(); ctx.fill();
    // Black tip (top 35%)
    ctx.fillStyle = "#1a1a1a";
    const mx = (tipX + (base1X + base2X) / 2) / 2; const my = (tipY + (base1Y + base2Y) / 2) / 2;
    ctx.beginPath(); ctx.moveTo(base1X + (tipX - base1X) * 0.6, base1Y + (tipY - base1Y) * 0.6 + bob);
    ctx.lineTo(tipX, tipY + bob);
    ctx.lineTo(base2X + (tipX - base2X) * 0.6, base2Y + (tipY - base2Y) * 0.6 + bob);
    ctx.closePath(); ctx.fill();
    void mx; void my;
  }
  ear(w * 0.15, h * 0.01, w * 0.08, h * 0.14, w * 0.26, h * 0.12);
  ear(w * 0.70, h * 0.01, w * 0.62, h * 0.12, w * 0.78, h * 0.14);

  // Red cheeks
  ellips(ctx, w * 0.23, h * 0.46 + bob, w * 0.09, h * 0.065, "#FF6666");
  ellips(ctx, w * 0.64, h * 0.46 + bob, w * 0.09, h * 0.065, "#FF6666");

  // Eyes
  if (hurt) {
    xEye(ctx, w * 0.33, h * 0.34 + bob, w * 0.07);
    xEye(ctx, w * 0.55, h * 0.34 + bob, w * 0.07);
  } else {
    eye(ctx, w * 0.33, h * 0.34 + bob, w * 0.075);
    eye(ctx, w * 0.55, h * 0.34 + bob, w * 0.075);
  }
  // Nose + mouth
  circ(ctx, w * 0.44, h * 0.41 + bob, w * 0.022, "#8B5E3C");
  ctx.strokeStyle = "#8B5E3C"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(w * 0.44, h * 0.43 + bob, w * 0.06, 0.1, Math.PI - 0.1); ctx.stroke();

  // Legs
  const lc = "#FFB800";
  state === "jumping"
    ? (ellips(ctx, w * 0.27, h * 0.90, w * 0.11, h * 0.065, lc),
       ellips(ctx, w * 0.60, h * 0.90, w * 0.11, h * 0.065, lc))
    : (ellips(ctx, w * 0.27, h * 0.93 + leg, w * 0.11, h * 0.07, lc),
       ellips(ctx, w * 0.60, h * 0.93 - leg, w * 0.11, h * 0.07, lc));

  // Attack arm
  if (state === "attacking") {
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(w * 0.7, h * 0.55 + bob, w * 0.28, h * 0.10);
    circ(ctx, w * 0.98, h * 0.60 + bob, w * 0.09, "#FFB800");
  }

  ctx.restore();
}

// ─── Charizard ────────────────────────────────────────────────────────────────

export function drawCharizard(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.25) * 3 : 0;
  const wingFlap = Math.sin(animFrame * 0.15) * 6;

  // Tail with flame
  ctx.fillStyle = "#FF8C42";
  ctx.beginPath();
  ctx.moveTo(w * 0.72, h * 0.7 + bob); ctx.quadraticCurveTo(w * 1.1, h * 0.9 + bob, w * 1.0, h * 1.0 + bob);
  ctx.quadraticCurveTo(w * 0.9, h * 1.05 + bob, w * 0.68, h * 0.80 + bob); ctx.closePath(); ctx.fill();
  // Flame tip
  const flicker = Math.sin(animFrame * 0.3) * 2;
  ctx.fillStyle = "#FF4500";
  ctx.beginPath();
  ctx.moveTo(w * 0.98, h * 1.0 + bob); ctx.quadraticCurveTo(w * 1.05 + flicker * 0.02, h * 0.78 + bob - flicker, w * 0.92, h * 0.92 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(w * 0.99, h * 1.0 + bob); ctx.quadraticCurveTo(w * 1.03 + flicker * 0.01, h * 0.84 + bob - flicker * 0.5, w * 0.93, h * 0.94 + bob); ctx.closePath(); ctx.fill();

  // Wings (behind body)
  ctx.fillStyle = "#FF7043";
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.30 + bob);
  ctx.quadraticCurveTo(w * 0.95, h * 0.10 - wingFlap + bob, w * 0.85, h * 0.55 + bob);
  ctx.quadraticCurveTo(w * 0.75, h * 0.50 + bob, w * 0.55, h * 0.55 + bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0D47A1";
  ctx.beginPath();
  ctx.moveTo(w * 0.56, h * 0.32 + bob);
  ctx.quadraticCurveTo(w * 0.92, h * 0.14 - wingFlap + bob, w * 0.82, h * 0.53 + bob);
  ctx.quadraticCurveTo(w * 0.72, h * 0.49 + bob, w * 0.56, h * 0.53 + bob); ctx.closePath(); ctx.fill();

  // Body
  ellips(ctx, w * 0.44, h * 0.70 + bob, w * 0.36, h * 0.28, "#FF8C42");
  // Cream belly
  ellips(ctx, w * 0.42, h * 0.72 + bob, w * 0.22, h * 0.22, "#FFDDC1");

  // Head
  circ(ctx, w * 0.40, h * 0.35 + bob, w * 0.30, "#FF8C42");
  // Horns
  ctx.fillStyle = "#D2691E";
  for (const dx of [w * 0.25, w * 0.55]) {
    ctx.beginPath();
    ctx.moveTo(dx - w * 0.04, h * 0.12 + bob); ctx.lineTo(dx, h * 0.0 + bob); ctx.lineTo(dx + w * 0.04, h * 0.12 + bob); ctx.closePath(); ctx.fill();
  }

  // Eyes
  if (hurt) { xEye(ctx, w * 0.30, h * 0.32 + bob, w * 0.07); xEye(ctx, w * 0.50, h * 0.32 + bob, w * 0.07); }
  else       { eye(ctx, w * 0.30, h * 0.32 + bob, w * 0.075); eye(ctx, w * 0.50, h * 0.32 + bob, w * 0.075); }

  // Nostrils
  circ(ctx, w * 0.37, h * 0.40 + bob, w * 0.022, "#C85000");
  circ(ctx, w * 0.44, h * 0.40 + bob, w * 0.022, "#C85000");

  // Legs
  const lc = "#D2571E";
  ellips(ctx, w * 0.25, h * 0.91 + leg, w * 0.12, h * 0.08, lc);
  ellips(ctx, w * 0.58, h * 0.91 - leg, w * 0.12, h * 0.08, lc);
  // Claws
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#FFF"; ctx.beginPath();
    ctx.moveTo(w * (0.16 + i * 0.06), h * 0.97 + leg); ctx.lineTo(w * (0.19 + i * 0.06), h * 1.01 + leg); ctx.lineTo(w * (0.22 + i * 0.06), h * 0.97 + leg); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * (0.50 + i * 0.06), h * 0.97 - leg); ctx.lineTo(w * (0.53 + i * 0.06), h * 1.01 - leg); ctx.lineTo(w * (0.56 + i * 0.06), h * 0.97 - leg); ctx.closePath(); ctx.fill();
  }

  ctx.restore();
}

// ─── Bulbasaur ────────────────────────────────────────────────────────────────

export function drawBulbasaur(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.25) * 2.5 : 0;

  // Bulb on back
  const bulbBob = Math.sin(animFrame * 0.05) * 1;
  ellips(ctx, w * 0.62, h * 0.30 + bob + bulbBob, w * 0.28, h * 0.34, "#4CAF50");
  // Bulb petals / leaves
  ctx.fillStyle = "#388E3C";
  ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.16 + bob + bulbBob, w * 0.12, h * 0.09, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.72, h * 0.14 + bob + bulbBob, w * 0.12, h * 0.09, 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.84, h * 0.26 + bob + bulbBob, w * 0.09, h * 0.12, 0.3, 0, Math.PI * 2); ctx.fill();
  // Bulb center darker
  circ(ctx, w * 0.62, h * 0.30 + bob + bulbBob, w * 0.15, "#388E3C");

  // Body (teal-green, rounded quad)
  ellips(ctx, w * 0.44, h * 0.72 + bob, w * 0.40, h * 0.30, "#78C850");
  // Dark spots on body
  for (const [sx, sy] of [[0.28, 0.60], [0.55, 0.58], [0.32, 0.78], [0.56, 0.82]] as [number,number][]) {
    circ(ctx, w * sx, h * sy + bob, w * 0.055, "#4A9030");
  }

  // Head
  circ(ctx, w * 0.38, h * 0.38 + bob, w * 0.30, "#78C850");
  // Head ridges (2 bumps on top)
  circ(ctx, w * 0.32, h * 0.12 + bob, w * 0.09, "#68B840");
  circ(ctx, w * 0.46, h * 0.10 + bob, w * 0.09, "#68B840");

  // Eyes
  if (hurt) { xEye(ctx, w * 0.28, h * 0.34 + bob, w * 0.07); xEye(ctx, w * 0.50, h * 0.34 + bob, w * 0.07); }
  else {
    circ(ctx, w * 0.28, h * 0.34 + bob, w * 0.09, "#FFFFFF");
    circ(ctx, w * 0.31, h * 0.33 + bob, w * 0.07, "#FF4444"); // red iris
    circ(ctx, w * 0.33, h * 0.32 + bob, w * 0.03, "#1a1a1a");
    circ(ctx, w * 0.50, h * 0.34 + bob, w * 0.09, "#FFFFFF");
    circ(ctx, w * 0.53, h * 0.33 + bob, w * 0.07, "#FF4444");
    circ(ctx, w * 0.55, h * 0.32 + bob, w * 0.03, "#1a1a1a");
  }

  // Mouth
  ctx.strokeStyle = "#336622"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(w * 0.39, h * 0.46 + bob, w * 0.07, 0, Math.PI); ctx.stroke();

  // Legs
  const lc = "#5AAA38";
  ellips(ctx, w * 0.20, h * 0.90 + leg, w * 0.12, h * 0.09, lc);
  ellips(ctx, w * 0.55, h * 0.90 - leg, w * 0.12, h * 0.09, lc);
  ellips(ctx, w * 0.36, h * 0.93 - leg * 0.3, w * 0.10, h * 0.08, lc);
  ellips(ctx, w * 0.68, h * 0.93 + leg * 0.3, w * 0.10, h * 0.08, lc);

  ctx.restore();
}

// ─── Squirtle ─────────────────────────────────────────────────────────────────

export function drawSquirtle(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.25) * 2.5 : 0;

  // Shell
  ellips(ctx, w * 0.50, h * 0.60 + bob, w * 0.38, h * 0.32, "#8D6E44");
  // Shell hex lines
  ctx.strokeStyle = "#6D4E24"; ctx.lineWidth = 1.5;
  for (const [lx1, ly1, lx2, ly2] of [[0.38, 0.40, 0.50, 0.32],[0.50, 0.32, 0.62, 0.40],[0.62, 0.40, 0.62, 0.60],[0.62, 0.60, 0.50, 0.70],[0.50, 0.70, 0.38, 0.60],[0.38, 0.60, 0.38, 0.40]] as number[][]) {
    ctx.beginPath(); ctx.moveTo(w * lx1, h * ly1 + bob); ctx.lineTo(w * lx2, h * ly2 + bob); ctx.stroke();
  }
  // Shell center
  ellips(ctx, w * 0.50, h * 0.54 + bob, w * 0.18, h * 0.14, "#A0804C");

  // Body
  ellips(ctx, w * 0.44, h * 0.65 + bob, w * 0.36, h * 0.28, "#7BBBD4");
  // Belly (cream)
  ellips(ctx, w * 0.44, h * 0.70 + bob, w * 0.24, h * 0.20, "#E8D5B0");

  // Head
  circ(ctx, w * 0.42, h * 0.33 + bob, w * 0.30, "#7BBBD4");
  // Ear nubs
  circ(ctx, w * 0.26, h * 0.20 + bob, w * 0.06, "#7BBBD4");
  circ(ctx, w * 0.58, h * 0.20 + bob, w * 0.06, "#7BBBD4");

  // Eyes (big)
  if (hurt) { xEye(ctx, w * 0.30, h * 0.30 + bob, w * 0.08); xEye(ctx, w * 0.54, h * 0.30 + bob, w * 0.08); }
  else {
    eye(ctx, w * 0.30, h * 0.30 + bob, w * 0.10);
    eye(ctx, w * 0.54, h * 0.30 + bob, w * 0.10);
  }

  // Beak/mouth
  ctx.fillStyle = "#5599AA";
  ctx.beginPath();
  ctx.arc(w * 0.42, h * 0.44 + bob, w * 0.09, 0, Math.PI); ctx.fill();
  ctx.fillStyle = "#E8D5B0";
  ctx.beginPath();
  ctx.arc(w * 0.42, h * 0.44 + bob, w * 0.07, 0, Math.PI); ctx.fill();

  // Curly tail
  ctx.strokeStyle = "#5599AA"; ctx.lineWidth = w * 0.07; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.76, h * 0.65 + bob);
  ctx.bezierCurveTo(w * 1.05, h * 0.60 + bob, w * 1.05, h * 0.30 + bob, w * 0.88, h * 0.30 + bob);
  ctx.stroke();

  // Legs
  const lc = "#5599AA";
  ellips(ctx, w * 0.20, h * 0.90 + leg, w * 0.12, h * 0.08, lc);
  ellips(ctx, w * 0.56, h * 0.90 - leg, w * 0.12, h * 0.08, lc);

  ctx.restore();
}

// ─── Mewtwo ───────────────────────────────────────────────────────────────────

export function drawMewtwo(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.22) * 3 : 0;

  // Psychic aura glow
  if (!hurt) {
    const aura = ctx.createRadialGradient(w * 0.45, h * 0.5 + bob, w * 0.1, w * 0.45, h * 0.5 + bob, w * 0.6);
    aura.addColorStop(0, "rgba(147,112,219,0.0)");
    aura.addColorStop(0.7, "rgba(147,112,219,0.15)");
    aura.addColorStop(1, "rgba(147,112,219,0)");
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.ellipse(w * 0.45, h * 0.5 + bob, w * 0.6, h * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Long purple tail
  ctx.strokeStyle = "#9370DB"; ctx.lineWidth = w * 0.10; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.70, h * 0.75 + bob);
  ctx.bezierCurveTo(w * 1.15, h * 0.80 + bob, w * 1.20, h * 0.40 + bob, w * 0.90, h * 0.30 + bob);
  ctx.stroke();
  // Tail tip
  circ(ctx, w * 0.90, h * 0.30 + bob, w * 0.08, "#C580FF");

  // Body
  ellips(ctx, w * 0.44, h * 0.68 + bob, w * 0.34, h * 0.28, "#B0A0C8");
  // Belly (lighter)
  ellips(ctx, w * 0.44, h * 0.72 + bob, w * 0.22, h * 0.20, "#D8D0E8");
  // Chest groove tube
  ctx.strokeStyle = "#A090BC"; ctx.lineWidth = w * 0.04;
  ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.55 + bob); ctx.lineTo(w * 0.44, h * 0.78 + bob); ctx.stroke();

  // Head (large and round)
  circ(ctx, w * 0.42, h * 0.30 + bob, w * 0.34, "#B0A0C8");
  // Head tube on back
  ctx.strokeStyle = "#9080B8"; ctx.lineWidth = w * 0.05;
  ctx.beginPath();
  ctx.moveTo(w * 0.64, h * 0.24 + bob);
  ctx.bezierCurveTo(w * 0.78, h * 0.16 + bob, w * 0.76, h * 0.04 + bob, w * 0.60, h * 0.08 + bob);
  ctx.stroke();

  // Eyes (narrow, stern)
  if (hurt) { xEye(ctx, w * 0.30, h * 0.27 + bob, w * 0.08); xEye(ctx, w * 0.54, h * 0.27 + bob, w * 0.08); }
  else {
    // Left eye — purple slit
    ctx.fillStyle = "#9B59B6";
    ctx.beginPath(); ctx.ellipse(w * 0.30, h * 0.28 + bob, w * 0.07, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6A0DAD";
    ctx.beginPath(); ctx.ellipse(w * 0.30, h * 0.28 + bob, w * 0.03, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    // Right eye
    ctx.fillStyle = "#9B59B6";
    ctx.beginPath(); ctx.ellipse(w * 0.54, h * 0.28 + bob, w * 0.07, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6A0DAD";
    ctx.beginPath(); ctx.ellipse(w * 0.54, h * 0.28 + bob, w * 0.03, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Nostrils
  circ(ctx, w * 0.38, h * 0.38 + bob, w * 0.018, "#9080B8");
  circ(ctx, w * 0.46, h * 0.38 + bob, w * 0.018, "#9080B8");

  // Arms
  ctx.fillStyle = "#9080B8";
  ellips(ctx, w * 0.15, h * 0.60 + bob - leg * 0.3, w * 0.08, h * 0.14, "#9080B8", 0.3);
  ellips(ctx, w * 0.72, h * 0.60 + bob + leg * 0.3, w * 0.08, h * 0.14, "#9080B8", -0.3);
  if (state === "attacking") {
    ctx.fillStyle = "#C580FF";
    circ(ctx, w * 0.86, h * 0.60 + bob, w * 0.12, "rgba(197,128,255,0.5)");
    circ(ctx, w * 0.86, h * 0.60 + bob, w * 0.07, "#C580FF");
  }

  // Legs
  ellips(ctx, w * 0.26, h * 0.91 + leg, w * 0.10, h * 0.07, "#9080B8");
  ellips(ctx, w * 0.58, h * 0.91 - leg, w * 0.10, h * 0.07, "#9080B8");
  // Feet
  ellips(ctx, w * 0.26, h * 0.98 + leg, w * 0.12, h * 0.05, "#7060A8");
  ellips(ctx, w * 0.58, h * 0.98 - leg, w * 0.12, h * 0.05, "#7060A8");

  ctx.restore();
}

// ─── Gengar ───────────────────────────────────────────────────────────────────

export function drawGengar(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const float = state === "idle" ? 0 : Math.sin(animFrame * 0.05);

  // Ghost shadow glow
  const glow = ctx.createRadialGradient(w * 0.45, h * 0.55 + bob, 0, w * 0.45, h * 0.55 + bob, w * 0.55);
  glow.addColorStop(0, "rgba(97,50,168,0.4)");
  glow.addColorStop(1, "rgba(97,50,168,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(w * 0.45, h * 0.55 + bob, w * 0.55, 0, Math.PI * 2); ctx.fill();

  // Body (rounded with spiky edges)
  ctx.fillStyle = "#7B68EE";
  ctx.beginPath();
  ctx.arc(w * 0.45, h * 0.58 + bob + float, w * 0.38, 0, Math.PI * 2); ctx.fill();
  // Head (merges with body)
  circ(ctx, w * 0.44, h * 0.38 + bob + float, w * 0.33, "#7B68EE");

  // Spiky edges around body
  ctx.fillStyle = "#6A55D0";
  const spikes = [[0.06, 0.85], [0.25, 0.96], [0.50, 0.98], [0.74, 0.92], [0.88, 0.78]];
  for (const [sx, sy] of spikes) {
    ctx.beginPath();
    ctx.moveTo(w * (sx - 0.07), h * (sy - 0.04) + bob + float);
    ctx.lineTo(w * sx, h * (sy + 0.08) + bob + float);
    ctx.lineTo(w * (sx + 0.07), h * (sy - 0.04) + bob + float);
    ctx.closePath(); ctx.fill();
  }
  // Top ear-spikes
  ctx.fillStyle = "#5A44C0";
  ctx.beginPath(); ctx.moveTo(w * 0.20, h * 0.12 + bob + float); ctx.lineTo(w * 0.10, h * 0.0 + bob + float); ctx.lineTo(w * 0.32, h * 0.10 + bob + float); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.60, h * 0.12 + bob + float); ctx.lineTo(w * 0.72, h * 0.0 + bob + float); ctx.lineTo(w * 0.72, h * 0.14 + bob + float); ctx.closePath(); ctx.fill();

  // Eyes (glowing red)
  circ(ctx, w * 0.32, h * 0.32 + bob + float, w * 0.09, "#FFFFFF");
  circ(ctx, w * 0.34, h * 0.31 + bob + float, w * 0.065, "#FF2200");
  circ(ctx, w * 0.56, h * 0.32 + bob + float, w * 0.09, "#FFFFFF");
  circ(ctx, w * 0.58, h * 0.31 + bob + float, w * 0.065, "#FF2200");
  if (!hurt) {
    circ(ctx, w * 0.36, h * 0.29 + bob + float, w * 0.022, "#FFFFFF");
    circ(ctx, w * 0.60, h * 0.29 + bob + float, w * 0.022, "#FFFFFF");
  }

  // Signature wide grin
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(w * 0.44, h * 0.48 + bob + float, w * 0.22, 0.1, Math.PI - 0.1); ctx.fill();
  // Teeth
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 5; i++) {
    const tx = w * (0.26 + i * 0.092);
    ctx.beginPath();
    ctx.moveTo(tx - w * 0.03, h * 0.51 + bob + float);
    ctx.lineTo(tx, h * 0.56 + bob + float);
    ctx.lineTo(tx + w * 0.03, h * 0.51 + bob + float);
    ctx.closePath(); ctx.fill();
  }

  // Stubby arms
  ctx.fillStyle = "#6A55D0";
  ellips(ctx, w * 0.10, h * 0.60 + bob + float, w * 0.09, h * 0.13, "#6A55D0", 0.5);
  ellips(ctx, w * 0.80, h * 0.60 + bob + float, w * 0.09, h * 0.13, "#6A55D0", -0.5);
  // Claws
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#5A44B8";
      ctx.beginPath();
      ctx.moveTo(w * (0.01 + i * 0.06), h * (0.70 + j * 0.01) + bob + float);
      ctx.lineTo(w * (0.03 + i * 0.06), h * (0.76 + j * 0.01) + bob + float);
      ctx.lineTo(w * (0.06 + i * 0.06), h * (0.70 + j * 0.01) + bob + float);
      ctx.closePath(); ctx.fill();
    }
  }

  ctx.restore();
}

// ─── Eevee ────────────────────────────────────────────────────────────────────

export function drawEevee(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, state: string, hurt: boolean
) {
  ctx.save();
  if (!facingRight) { ctx.translate(x + w, y); ctx.scale(-1, 1); x = 0; y = 0; }
  else              { ctx.translate(x, y);                        x = 0; y = 0; }
  if (hurt) ctx.filter = "brightness(8)";

  const bob = 0;
  const leg  = state === "walking" ? Math.sin(animFrame * 0.25) * 3 : 0;

  // Fluffy tail (bushy)
  ctx.fillStyle = "#C8956C";
  ctx.beginPath();
  ctx.moveTo(w * 0.70, h * 0.70 + bob);
  ctx.bezierCurveTo(w * 1.05, h * 0.55 + bob, w * 1.10, h * 0.30 + bob, w * 0.88, h * 0.22 + bob);
  ctx.bezierCurveTo(w * 0.95, h * 0.30 + bob, w * 0.92, h * 0.55 + bob, w * 0.80, h * 0.72 + bob);
  ctx.closePath(); ctx.fill();
  // Tail tip lighter
  ctx.fillStyle = "#EAC8A0";
  ctx.beginPath();
  ctx.arc(w * 0.90, h * 0.25 + bob, w * 0.12, 0, Math.PI * 2); ctx.fill();

  // Body
  ellips(ctx, w * 0.44, h * 0.71 + bob, w * 0.34, h * 0.25, "#C8956C");
  // Fluffy neck ruff (cream)
  ellips(ctx, w * 0.42, h * 0.52 + bob, w * 0.28, h * 0.16, "#F5DEB3");

  // Head
  circ(ctx, w * 0.42, h * 0.34 + bob, w * 0.30, "#C8956C");
  // Large fluffy ears
  ctx.fillStyle = "#C8956C";
  ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.14 + bob); ctx.lineTo(w * 0.10, h * 0.0 + bob); ctx.lineTo(w * 0.30, h * 0.12 + bob); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.64, h * 0.14 + bob); ctx.lineTo(w * 0.74, h * 0.0 + bob); ctx.lineTo(w * 0.76, h * 0.14 + bob); ctx.closePath(); ctx.fill();
  // Inner ear pink
  ctx.fillStyle = "#FFB6C1";
  ctx.beginPath(); ctx.moveTo(w * 0.19, h * 0.13 + bob); ctx.lineTo(w * 0.14, h * 0.04 + bob); ctx.lineTo(w * 0.28, h * 0.13 + bob); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.64, h * 0.13 + bob); ctx.lineTo(w * 0.72, h * 0.04 + bob); ctx.lineTo(w * 0.74, h * 0.13 + bob); ctx.closePath(); ctx.fill();

  // Eyes
  if (hurt) { xEye(ctx, w * 0.30, h * 0.30 + bob, w * 0.08); xEye(ctx, w * 0.54, h * 0.30 + bob, w * 0.08); }
  else {
    eye(ctx, w * 0.30, h * 0.30 + bob, w * 0.085, "#3D2B1F");
    eye(ctx, w * 0.54, h * 0.30 + bob, w * 0.085, "#3D2B1F");
  }
  // Cute nose
  ctx.fillStyle = "#CC8866"; ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.41 + bob, w * 0.04, h * 0.025, 0, 0, Math.PI * 2); ctx.fill();
  // Mouth
  ctx.strokeStyle = "#AA6644"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(w * 0.42, h * 0.44 + bob, w * 0.055, 0.2, Math.PI - 0.2); ctx.stroke();

  // Legs
  const lc = "#A87050";
  ellips(ctx, w * 0.22, h * 0.92 + leg, w * 0.10, h * 0.07, lc);
  ellips(ctx, w * 0.56, h * 0.92 - leg, w * 0.10, h * 0.07, lc);
  ellips(ctx, w * 0.36, h * 0.95 - leg * 0.3, w * 0.09, h * 0.06, lc);
  ellips(ctx, w * 0.68, h * 0.95 + leg * 0.3, w * 0.09, h * 0.06, lc);

  ctx.restore();
}

// ─── Enemy: Zubat ─────────────────────────────────────────────────────────────

export function drawZubat(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  facingRight: boolean, animFrame: number, hurt: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  if (hurt) ctx.filter = "brightness(10)";

  const wing = Math.sin(animFrame * 0.20) * 8;

  // Wings
  ctx.fillStyle = "#4A3080";
  ctx.beginPath();
  ctx.moveTo(w * 0.45, h * 0.45);
  ctx.bezierCurveTo(w * 0.20, h * 0.20, w * 0.05 - wing, h * 0.0, w * 0.0, h * 0.40);
  ctx.bezierCurveTo(w * 0.10, h * 0.55, w * 0.30, h * 0.55, w * 0.45, h * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w * 0.55, h * 0.45);
  ctx.bezierCurveTo(w * 0.80, h * 0.20, w * 0.95 + wing, h * 0.0, w * 1.0, h * 0.40);
  ctx.bezierCurveTo(w * 0.90, h * 0.55, w * 0.70, h * 0.55, w * 0.55, h * 0.55);
  ctx.closePath(); ctx.fill();
  // Wing membrane lines
  ctx.strokeStyle = "#6A50A0"; ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.48);
    ctx.lineTo(w * (0.10 - i * 0.03) - wing * 0.08, h * (0.25 + i * 0.05));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.56, h * 0.48);
    ctx.lineTo(w * (0.90 + i * 0.03) + wing * 0.08, h * (0.25 + i * 0.05));
    ctx.stroke();
  }

  // Body
  ellips(ctx, w * 0.50, h * 0.50, w * 0.22, h * 0.28, "#5B3D9E");
  // Open fanged mouth
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.arc(w * 0.50, h * 0.68, w * 0.14, 0, Math.PI); ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath(); ctx.moveTo(w * 0.40, h * 0.68); ctx.lineTo(w * 0.43, h * 0.76); ctx.lineTo(w * 0.46, h * 0.68); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.54, h * 0.68); ctx.lineTo(w * 0.57, h * 0.76); ctx.lineTo(w * 0.60, h * 0.68); ctx.fill();
  // No eyes (Zubat has no eyes)
  // Ear nubs
  ctx.fillStyle = "#7B5DB8";
  ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.26); ctx.lineTo(w * 0.34, h * 0.10); ctx.lineTo(w * 0.44, h * 0.26); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.26); ctx.lineTo(w * 0.62, h * 0.10); ctx.lineTo(w * 0.66, h * 0.26); ctx.closePath(); ctx.fill();

  ctx.restore();
}

// ─── Enemy: Geodude ──────────────────────────────────────────────────────────

export function drawGeodude(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  animFrame: number, hurt: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  if (hurt) ctx.filter = "brightness(10)";

  const bob = Math.sin(animFrame * 0.12) * 2;
  const arm  = Math.sin(animFrame * 0.12) * 6;

  // Rocky body (gray sphere with cracks)
  circ(ctx, w * 0.50, h * 0.52 + bob, w * 0.42, "#8C8C8C");
  // Rock texture patches
  for (const [px, py, pr] of [[0.30, 0.40, 0.08],[0.62, 0.35, 0.07],[0.70, 0.62, 0.08],[0.32, 0.66, 0.07],[0.50, 0.75, 0.06]] as number[][]) {
    circ(ctx, w * px, h * py + bob, w * pr, "#6E6E6E");
  }
  // Crack lines
  ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.30 + bob); ctx.lineTo(w * 0.44, h * 0.50 + bob); ctx.lineTo(w * 0.36, h * 0.60 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.32 + bob); ctx.lineTo(w * 0.58, h * 0.55 + bob); ctx.stroke();
  // Highlight
  circ(ctx, w * 0.36, h * 0.38 + bob, w * 0.10, "rgba(255,255,255,0.12)");

  // Rocky arms
  ellips(ctx, w * 0.08, h * 0.55 + bob - arm, w * 0.14, h * 0.18, "#8C8C8C", 0.4);
  ellips(ctx, w * 0.92, h * 0.55 + bob + arm, w * 0.14, h * 0.18, "#8C8C8C", -0.4);
  // Fists
  circ(ctx, w * 0.02, h * 0.68 + bob - arm * 1.5, w * 0.12, "#7A7A7A");
  circ(ctx, w * 0.98, h * 0.68 + bob + arm * 1.5, w * 0.12, "#7A7A7A");

  // Eyes (white dot eyes)
  circ(ctx, w * 0.38, h * 0.42 + bob, w * 0.09, "#FFFFFF");
  circ(ctx, w * 0.60, h * 0.42 + bob, w * 0.09, "#FFFFFF");
  circ(ctx, w * 0.40, h * 0.44 + bob, w * 0.05, "#1a1a1a");
  circ(ctx, w * 0.62, h * 0.44 + bob, w * 0.05, "#1a1a1a");
  if (!hurt) {
    circ(ctx, w * 0.41, h * 0.43 + bob, w * 0.018, "#fff");
    circ(ctx, w * 0.63, h * 0.43 + bob, w * 0.018, "#fff");
  }

  // Angry eyebrows
  ctx.strokeStyle = "#444"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w * 0.30, h * 0.36 + bob); ctx.lineTo(w * 0.44, h * 0.38 + bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.70, h * 0.36 + bob); ctx.lineTo(w * 0.56, h * 0.38 + bob); ctx.stroke();

  ctx.restore();
}

// ─── Enemy: Koffing ──────────────────────────────────────────────────────────

export function drawKoffing(
  ctx: Ctx, x: number, y: number, w: number, h: number,
  animFrame: number, hurt: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  if (hurt) ctx.filter = "brightness(10)";

  const bob = Math.sin(animFrame * 0.08) * 3;
  const puff = 0.42 + Math.sin(animFrame * 0.08) * 0.03; // breathing

  // Poison gas clouds (bumps)
  ctx.fillStyle = "#7B52AB";
  for (const [px, py] of [[0.15,0.45],[0.85,0.45],[0.25,0.25],[0.75,0.25],[0.50,0.15]] as number[][]) {
    circ(ctx, w * px, h * py + bob, w * 0.14, "#7B52AB");
  }

  // Main body
  circ(ctx, w * 0.50, h * 0.55 + bob, w * puff, "#9B62CB");

  // Skull-and-crossbones pattern
  ctx.fillStyle = "#C8A0E8";
  circ(ctx, w * 0.50, h * 0.44 + bob, w * 0.10, "#C8A0E8");
  ctx.fillRect(w * 0.44, h * 0.52 + bob, w * 0.12, h * 0.04);
  // Crossbones
  ctx.save(); ctx.translate(w * 0.50, h * 0.56 + bob); ctx.rotate(0.5);
  ctx.fillStyle = "#C8A0E8"; ctx.fillRect(-w * 0.08, -h * 0.02, w * 0.16, h * 0.04); ctx.restore();
  ctx.save(); ctx.translate(w * 0.50, h * 0.56 + bob); ctx.rotate(-0.5);
  ctx.fillStyle = "#C8A0E8"; ctx.fillRect(-w * 0.08, -h * 0.02, w * 0.16, h * 0.04); ctx.restore();

  // Face
  circ(ctx, w * 0.37, h * 0.58 + bob, w * 0.085, "#FFFFFF");
  circ(ctx, w * 0.37, h * 0.60 + bob, w * 0.06, "#1a1a1a");
  circ(ctx, w * 0.63, h * 0.58 + bob, w * 0.085, "#FFFFFF");
  circ(ctx, w * 0.63, h * 0.60 + bob, w * 0.06, "#1a1a1a");
  // Creepy smile
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w * 0.50, h * 0.70 + bob, w * 0.10, 0, Math.PI); ctx.stroke();

  // Gas puffs coming off
  if (!hurt) {
    for (let i = 0; i < 3; i++) {
      const gx = w * (0.3 + i * 0.2) + Math.sin(animFrame * 0.1 + i) * 3;
      const gy = h * 0.10 + bob - i * 5 - Math.sin(animFrame * 0.05) * 4;
      const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.07);
      gr.addColorStop(0, "rgba(155,98,203,0.5)"); gr.addColorStop(1, "rgba(155,98,203,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(gx, gy, w * 0.07, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore();
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export type PokemonId = "pikachu" | "charizard" | "bulbasaur" | "squirtle" | "mewtwo" | "gengar" | "eevee";

export const SPRITE_MAP: Record<
  PokemonId,
  (ctx: Ctx, x: number, y: number, w: number, h: number, facingRight: boolean, animFrame: number, state: string, hurt: boolean) => void
> = {
  pikachu:   drawPikachu,
  charizard: drawCharizard,
  bulbasaur: drawBulbasaur,
  squirtle:  drawSquirtle,
  mewtwo:    drawMewtwo,
  gengar:    drawGengar,
  eevee:     drawEevee,
};
