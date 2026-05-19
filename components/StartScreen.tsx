"use client";

import { useEffect, useRef, useState } from "react";
import { drawPikachu, drawCharizard, drawBulbasaur, drawSquirtle, drawMewtwo, drawGengar, drawEevee } from "@/game/rendering/sprites";

const SHOWCASE = [
  { id: "pikachu",   color: "#FFD700", name: "Pikachu",   type: "Eléctrico" },
  { id: "charizard", color: "#FF8C42", name: "Charizard", type: "Fuego/Vuelo" },
  { id: "bulbasaur", color: "#78C850", name: "Bulbasaur", type: "Planta/Veneno" },
  { id: "squirtle",  color: "#7BBBD4", name: "Squirtle",  type: "Agua" },
  { id: "mewtwo",    color: "#9B59B6", name: "Mewtwo",    type: "Psíquico" },
  { id: "gengar",    color: "#7B68EE", name: "Gengar",    type: "Fantasma" },
  { id: "eevee",     color: "#C8956C", name: "Eevee",     type: "Normal" },
];

const DRAW_FNS = { pikachu: drawPikachu, charizard: drawCharizard, bulbasaur: drawBulbasaur, squirtle: drawSquirtle, mewtwo: drawMewtwo, gengar: drawGengar, eevee: drawEevee };

interface Props { onPlay: () => void; onAbout: () => void; }

export default function StartScreen({ onPlay, onAbout }: Props) {
  const [pulse, setPulse] = useState(false);
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden"
         style={{ background: "linear-gradient(160deg, #0d0026 0%, #1a0533 40%, #0d1b2a 100%)" }}>
      {/* Floating background Pokéballs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width:  `${60 + i * 40}px`, height: `${60 + i * 40}px`,
              left:   `${(i * 137 + 30) % 90}%`, top: `${(i * 79 + 10) % 80}%`,
              border: `4px solid ${SHOWCASE[i % SHOWCASE.length].color}`,
              transform: `rotate(${i * 30}deg)`,
              animation: `spin ${8 + i * 3}s linear infinite`,
            }} />
        ))}
      </div>

      {/* Title */}
      <div className="relative mb-6 text-center select-none">
        <div className="text-xs tracking-[0.5em] uppercase mb-1" style={{ color: "#888" }}>
          ⬛ Fan Game • No oficial
        </div>
        <h1 className="font-black tracking-tight leading-none"
          style={{
            fontSize: "clamp(52px, 8vw, 80px)",
            background: "linear-gradient(135deg, #FFD700 0%, #FF8C42 30%, #FF2266 55%, #7B68EE 80%, #7BBBD4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 30px rgba(255,215,0,0.4))",
          }}>
          NovaRun
        </h1>
        <p className="text-sm tracking-[0.3em] mt-2 uppercase font-semibold"
           style={{ color: "#A9A9FF" }}>
          Pokémon Platform Adventure
        </p>
      </div>

      {/* Pokémon showcase — animated canvas icons */}
      <div className="flex gap-3 mb-8 flex-wrap justify-center px-4">
        {SHOWCASE.map((pk, i) => (
          <PokemonIcon key={pk.id} {...pk} drawFn={DRAW_FNS[pk.id as keyof typeof DRAW_FNS]}
            hovered={hovIdx === i}
            onHover={() => setHovIdx(i)}
            onLeave={() => setHovIdx(null)} />
        ))}
      </div>

      {/* CTA */}
      <button onClick={onPlay}
        className="px-14 py-4 rounded-2xl text-xl font-black uppercase tracking-widest
                   transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          background:   "linear-gradient(135deg, #7c3aed, #c026d3, #e11d48)",
          color:        "#fff",
          boxShadow:    `0 0 40px rgba(192,38,211,${pulse ? 0.7 : 0.3}), 0 4px 20px rgba(0,0,0,0.4)`,
          letterSpacing: "0.2em",
          transition:   "box-shadow 0.7s ease",
        }}>
        ▶ JUGAR
      </button>

      <button onClick={onAbout}
        className="mt-3 text-xs uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity"
        style={{ color: "#ccc" }}>
        Cómo jugar
      </button>

      {/* Controls hint */}
      <div className="absolute bottom-4 flex gap-6 text-xs opacity-30" style={{ color: "#ccc" }}>
        <span>←→ / AD  Mover</span>
        <span>↑/Z  Saltar</span>
        <span>J  Atacar</span>
        <span>K  Habilidad</span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Animated Pokémon icon ────────────────────────────────────────────────────

function PokemonIcon({
  id, color, name, type, drawFn, hovered, onHover, onLeave,
}: {
  id: string; color: string; name: string; type: string;
  drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fr: boolean, af: number, state: string, hurt: boolean) => void;
  hovered: boolean; onHover: () => void; onLeave: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, 56, 64);
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx, 2, 4, 52, 56, true, 0, "idle", false);
  }, [drawFn]);

  return (
    <div
      onMouseEnter={onHover} onMouseLeave={onLeave}
      className="flex flex-col items-center gap-1 cursor-default"
      style={{ transition: "transform 0.2s", transform: hovered ? "translateY(-8px) scale(1.08)" : "scale(1)" }}>
      <div className="rounded-xl p-1.5 transition-all duration-200"
        style={{
          background: `${color}22`,
          border: `2px solid ${hovered ? color : color + "55"}`,
          boxShadow: hovered ? `0 0 18px ${color}88` : `0 0 6px ${color}22`,
        }}>
        <canvas ref={ref} width={56} height={64} style={{ display: "block" }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{name}</span>
      {hovered && (
        <span className="text-xs opacity-60 text-white">{type}</span>
      )}
    </div>
  );
}
