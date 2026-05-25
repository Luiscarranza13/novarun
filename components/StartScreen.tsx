"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawBulbasaur, drawCharizard, drawEevee, drawGengar, drawHoOh, drawLugia, drawMewtwo, drawPikachu, drawRayquaza, drawSquirtle } from "@/game/rendering/sprites";
import { getAllHighScores } from "@/game/saveSystem";
import { Difficulty } from "@/types/game";

const LEVEL_NAMES = ["Ruta 1", "Monte Luna", "Islas Espuma", "Acantilado", "Templo", "Volcan"];

const SHOWCASE = [
  { id: "pikachu",   color: "#FFD700", name: "Pikachu",   type: "Electrico" },
  { id: "charizard", color: "#FF8C42", name: "Charizard", type: "Fuego/Vuelo" },
  { id: "lugia",     color: "#88AAFF", name: "Lugia",     type: "Agua/Psiquico" },
  { id: "mewtwo",    color: "#9B59B6", name: "Mewtwo",    type: "Psiquico" },
  { id: "hooh",      color: "#FF6600", name: "Ho-Oh",     type: "Fuego/Vuelo" },
  { id: "rayquaza",  color: "#228B22", name: "Rayquaza",  type: "Dragon/Vuelo" },
  { id: "gengar",    color: "#7B68EE", name: "Gengar",    type: "Fantasma" },
];

const DRAW_FNS = {
  pikachu:   drawPikachu,
  charizard: drawCharizard,
  bulbasaur: drawBulbasaur,
  squirtle:  drawSquirtle,
  mewtwo:    drawMewtwo,
  gengar:    drawGengar,
  eevee:     drawEevee,
  lugia:     drawLugia,
  hooh:      drawHoOh,
  rayquaza:  drawRayquaza,
};

const DIFF_LABELS: Record<Difficulty, string> = { easy: "Facil", normal: "Normal", hard: "Dificil" };
const DIFF_COLORS: Record<Difficulty, string> = { easy: "#4ade80", normal: "#facc15", hard: "#f87171" };

interface Props {
  onPlay: () => void;
  onAbout: () => void;
  onCredits: () => void;
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
}

export default function StartScreen({ onPlay, onAbout, onCredits, difficulty, onDifficulty }: Props) {
  const [pulse, setPulse] = useState(false);
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const [hiScores, setHiScores] = useState<number[]>(Array(6).fill(0));

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 700);
    setHiScores(getAllHighScores());
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden px-4 py-8"
      style={{ background: "linear-gradient(160deg, #0d0026 0%, #1a0533 40%, #0d1b2a 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${60 + i * 40}px`,
              height: `${60 + i * 40}px`,
              left: `${(i * 137 + 30) % 90}%`,
              top: `${(i * 79 + 10) % 80}%`,
              border: `4px solid ${SHOWCASE[i % SHOWCASE.length].color}`,
              transform: `rotate(${i * 30}deg)`,
              animation: `spin ${8 + i * 3}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mb-5 text-center select-none">
        <div className="text-xs tracking-[0.5em] uppercase mb-1" style={{ color: "#888" }}>
          Fan Game - No oficial
        </div>
        <h1
          className="font-black tracking-tight leading-none"
          style={{
            fontSize: "clamp(52px, 8vw, 80px)",
            background: "linear-gradient(135deg, #FFD700 0%, #FF8C42 30%, #FF2266 55%, #7B68EE 80%, #7BBBD4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(255,215,0,0.4))",
          }}
        >
          NovaRun
        </h1>
        <p className="text-sm tracking-[0.3em] mt-2 uppercase font-semibold" style={{ color: "#A9A9FF" }}>
          Pokemon Platform Adventure
        </p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap justify-center px-4">
        {SHOWCASE.map((pk, i) => (
          <PokemonIcon
            key={pk.id}
            {...pk}
            drawFn={DRAW_FNS[pk.id as keyof typeof DRAW_FNS]}
            hovered={hovIdx === i}
            onHover={() => setHovIdx(i)}
            onLeave={() => setHovIdx(null)}
          />
        ))}
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <span className="text-xs uppercase tracking-widest opacity-40 mr-1" style={{ color: "#ccc" }}>
          Dificultad:
        </span>
        {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficulty(d)}
            className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150"
            style={{
              background: difficulty === d ? `${DIFF_COLORS[d]}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${difficulty === d ? DIFF_COLORS[d] : "rgba(255,255,255,0.10)"}`,
              color: difficulty === d ? DIFF_COLORS[d] : "rgba(255,255,255,0.35)",
              boxShadow: difficulty === d ? `0 0 12px ${DIFF_COLORS[d]}44` : "none",
            }}
          >
            {DIFF_LABELS[d]}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onPlay}
        className="px-14 py-4 rounded-2xl text-xl font-black uppercase tracking-widest transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #c026d3, #e11d48)",
          color: "#fff",
          boxShadow: `0 0 40px rgba(192,38,211,${pulse ? 0.7 : 0.3}), 0 4px 20px rgba(0,0,0,0.4)`,
          letterSpacing: "0.2em",
          transition: "box-shadow 0.7s ease",
        }}
      >
        &gt; JUGAR
      </button>

      <div className="flex gap-4 mt-3">
        <button
          type="button"
          onClick={onAbout}
          className="text-xs uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: "#ccc" }}
        >
          Como jugar
        </button>
        <span className="opacity-20 text-white text-xs">-</span>
        <button
          type="button"
          onClick={onCredits}
          className="text-xs uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: "#ccc" }}
        >
          Creditos
        </button>
      </div>

      {hiScores.some((s) => s > 0) && (
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs text-white/45 px-4">
          {hiScores.map((s, i) =>
            s > 0 ? (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] tracking-widest text-yellow-400/55 uppercase">{LEVEL_NAMES[i]}</span>
                <span className="font-black text-yellow-400">{s.toString().padStart(5, "0")}</span>
              </div>
            ) : null
          )}
        </div>
      )}

      <div className="absolute bottom-4 flex gap-6 text-xs opacity-30" style={{ color: "#ccc" }}>
        <span>{"<->"} / AD Mover</span>
        <span>Arriba/Z Saltar</span>
        <span>J Atacar</span>
        <span>K Habilidad</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PokemonIcon({
  id,
  color,
  name,
  type,
  drawFn,
  hovered,
  onHover,
  onLeave,
}: {
  id: string;
  color: string;
  name: string;
  type: string;
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fr: boolean, af: number, state: string, hurt: boolean) => void;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const paintSprite = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 56, 64);
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, 2, 4, 52, 56, true, 0, "idle", false);
  }, [drawFn]);

  useEffect(() => {
    paintSprite();
    const frame = window.requestAnimationFrame(paintSprite);
    return () => window.cancelAnimationFrame(frame);
  }, [paintSprite]);

  const setCanvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      ref.current = canvas;
      if (canvas) window.requestAnimationFrame(paintSprite);
    },
    [paintSprite]
  );

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="flex flex-col items-center gap-1 cursor-default"
      style={{ transition: "transform 0.2s", transform: hovered ? "translateY(-8px) scale(1.08)" : "scale(1)" }}
    >
      <div
        className="rounded-xl p-1.5 transition-all duration-200"
        style={{
          background: `${color}22`,
          border: `2px solid ${hovered ? color : color + "55"}`,
          boxShadow: hovered ? `0 0 18px ${color}88` : `0 0 6px ${color}22`,
        }}
      >
        <canvas
          ref={setCanvasRef}
          width={56}
          height={64}
          aria-label={id}
          style={{ display: "block", width: 56, height: 64 }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>
        {name}
      </span>
      {hovered && <span className="text-xs opacity-60 text-white">{type}</span>}
    </div>
  );
}
