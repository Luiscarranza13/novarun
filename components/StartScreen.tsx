"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawBulbasaur, drawCharizard, drawEevee, drawGengar, drawHoOh, drawLugia, drawMewtwo, drawPikachu, drawRayquaza, drawSquirtle } from "@/game/rendering/sprites";
import { getAllHighScores } from "@/game/saveSystem";
import { Difficulty } from "@/types/game";
import styles from "./StartScreen.module.css";

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

interface Props {
  onPlay: () => void;
  onDemo: () => void;
  onAbout: () => void;
  onCredits: () => void;
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
}

export default function StartScreen({ onPlay, onDemo, onAbout, onCredits, difficulty, onDifficulty }: Props) {
  const [pulse, setPulse] = useState(false);
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const [hiScores, setHiScores] = useState<number[]>(Array(6).fill(0));

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 700);
    setHiScores(getAllHighScores());
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden px-4 py-8 ${styles.screen}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-5 ${styles.orb} ${styles[`orb${i}`]}`}
          />
        ))}
      </div>

      <div className="relative mb-5 text-center select-none">
        <div className={`text-xs tracking-[0.5em] uppercase mb-1 ${styles.kicker}`}>
          Fan Game - No oficial
        </div>
        <h1 className={`font-black tracking-tight leading-none ${styles.logoTitle}`}>
          NovaRun
        </h1>
        <p className={`text-sm tracking-[0.3em] mt-2 uppercase font-semibold ${styles.subtitle}`}>
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
        <span className={`text-xs uppercase tracking-widest opacity-40 mr-1 ${styles.mutedText}`}>
          Dificultad:
        </span>
        {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficulty(d)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 ${styles.diffButton}`}
            data-difficulty={d}
            data-active={difficulty === d}
          >
            {DIFF_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          type="button"
          onClick={onPlay}
          className={`px-14 py-4 rounded-2xl text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 ${styles.playButton}`}
          data-pulse={pulse}
        >
          &gt; JUGAR
        </button>
        <button
          type="button"
          onClick={onDemo}
          className={`px-10 py-4 rounded-2xl text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 ${styles.demoButton}`}
        >
          Demo
        </button>
      </div>

      <div className="flex gap-4 mt-3">
        <button
          type="button"
          onClick={onAbout}
          className={`text-xs uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity ${styles.mutedText}`}
        >
          Como jugar
        </button>
        <span className="opacity-20 text-white text-xs">-</span>
        <button
          type="button"
          onClick={onCredits}
          className={`text-xs uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity ${styles.mutedText}`}
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

      <div className={`absolute bottom-4 flex gap-6 text-xs opacity-30 ${styles.mutedText}`}>
        <span>{"<->"} / AD Mover</span>
        <span>Arriba/Z Saltar</span>
        <span>J Atacar</span>
        <span>K Habilidad</span>
      </div>
    </div>
  );
}

function PokemonIcon({
  id,
  name,
  type,
  drawFn,
  hovered,
  onHover,
  onLeave,
}: {
  id: string;
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
      className={`flex flex-col items-center gap-1 cursor-default ${styles.showcaseIcon}`}
      data-showcase={id}
      data-hovered={hovered}
    >
      <div
        className={`rounded-xl p-1.5 transition-all duration-200 ${styles.iconFrame}`}
      >
        <canvas
          ref={setCanvasRef}
          width={56}
          height={64}
          aria-label={id}
          className={styles.iconCanvas}
        />
      </div>
      <span className={`text-xs font-bold ${styles.iconName}`}>
        {name}
      </span>
      {hovered && <span className="text-xs opacity-60 text-white">{type}</span>}
    </div>
  );
}
