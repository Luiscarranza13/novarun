"use client";

import { useEffect, useState } from "react";
import { CREATURES } from "@/game/data/creatures";
import { LEVELS } from "@/game/data/levels";
import { getAllHighScores, isLevelUnlocked } from "@/game/saveSystem";
import { CreatureData } from "@/types/game";
import styles from "./LevelSelect.module.css";

interface Props {
  onSelect: (levelIndex: number) => void;
  onBack: () => void;
}

const LEVEL_META = [
  {
    icon: "🌿",
    subtitle: "Pallet Town",
    desc: "Gaps simples y plataformas de tutorial",
    bgA: "#0a2a06", bgB: "#163a0e",
    accent: "#8BC34A",
    difficulty: 1,
    isBoss: false,
  },
  {
    icon: "🌑",
    subtitle: "Monte Luna",
    desc: "Cueva oscura · stalactitas y techo bajo",
    bgA: "#0e0e20", bgB: "#141428",
    accent: "#6A6A9A",
    difficulty: 2,
    isBoss: false,
  },
  {
    icon: "🌊",
    subtitle: "Archipiélago",
    desc: "Islas aéreas sobre el océano infinito",
    bgA: "#001428", bgB: "#001e3e",
    accent: "#90C8FF",
    difficulty: 2,
    isBoss: false,
  },
  {
    icon: "⚡",
    subtitle: "Eléctrico",
    desc: "Sin suelo · solo plataformas sobre el abismo",
    bgA: "#050b14", bgB: "#0a1420",
    accent: "#6680AA",
    difficulty: 3,
    isBoss: false,
  },
  {
    icon: "🏛️",
    subtitle: "Maldito",
    desc: "Corredores trampa y pilares del Templo Antiguo",
    bgA: "#1a0a00", bgB: "#2a1200",
    accent: "#B87830",
    difficulty: 3,
    isBoss: false,
  },
  {
    icon: "🌋",
    subtitle: "Boss Final",
    desc: "Travesía volcánica · Arena de El Maestro",
    bgA: "#200000", bgB: "#360000",
    accent: "#D03030",
    difficulty: 3,
    isBoss: true,
  },
];

const RARITY_COLOR: Record<string, string> = {
  "comun":      "#9e9e9e",
  "poco-comun": "#4caf50",
  "raro":       "#2196f3",
  "legendario": "#ff9800",
};

function getUnlocksForLevel(levelIndex: number): CreatureData[] {
  return CREATURES.filter((c) => c.unlockLevel === levelIndex + 1);
}

export default function LevelSelect({ onSelect, onBack }: Props) {
  const [scores, setScores] = useState<number[]>(Array(6).fill(0));
  const [unlocked, setUnlocked] = useState<boolean[]>(Array(6).fill(false));

  useEffect(() => {
    const s = getAllHighScores();
    setScores(s);
    setUnlocked(Array.from({ length: 6 }, (_, i) => isLevelUnlocked(i)));
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Volver
        </button>
        <h2 className={styles.title}>Selecciona Nivel</h2>
        <div className={styles.subtitle}>
          {scores.filter((s) => s > 0).length} / 6 completados
        </div>
      </div>

      <div className={styles.grid}>
        {LEVELS.slice(0, LEVEL_META.length).map((level, i) => {
          const meta      = LEVEL_META[i];
          const isUnlocked = unlocked[i];
          const score     = scores[i];
          const completed = score > 0;
          const unlockCreatures = getUnlocksForLevel(i);

          return (
            <LevelCard
              key={level.id}
              levelIndex={i}
              name={level.name}
              meta={meta}
              isUnlocked={isUnlocked}
              score={score}
              completed={completed}
              unlockCreatures={unlockCreatures}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function LevelCard({
  levelIndex,
  name,
  meta,
  isUnlocked,
  score,
  completed,
  unlockCreatures,
  onSelect,
}: {
  levelIndex: number;
  name: string;
  meta: typeof LEVEL_META[0];
  isUnlocked: boolean;
  score: number;
  completed: boolean;
  unlockCreatures: CreatureData[];
  onSelect: (i: number) => void;
}) {
  const stars = meta.difficulty;

  return (
    <div
      className={`${styles.card} ${!isUnlocked ? styles.cardLocked : ""}`}
      style={{
        borderColor: isUnlocked ? `${meta.accent}55` : "rgba(255,255,255,0.08)",
        boxShadow: isUnlocked && completed
          ? `0 0 24px ${meta.accent}33`
          : isUnlocked
          ? `0 0 12px ${meta.accent}18`
          : "none",
      }}
      onClick={() => isUnlocked && onSelect(levelIndex)}
    >
      {/* Background gradient */}
      <div
        className={styles.cardBg}
        style={{ background: `linear-gradient(145deg, ${meta.bgA}, ${meta.bgB})` }}
      />

      <div className={styles.cardContent}>
        {/* Top row */}
        <div className={styles.cardTop}>
          <span className={styles.cardIcon}>{meta.icon}</span>
          <div className={styles.cardBadges}>
            {meta.isBoss && <span className={styles.bossBadge}>Boss</span>}
            {completed && <span className={styles.completedBadge}>Completado</span>}
            {!isUnlocked && <span className={styles.lockBadge}>🔒</span>}
          </div>
        </div>

        {/* Level info */}
        <div className={styles.cardNum}>Nivel {levelIndex + 1}</div>
        <div className={styles.cardName} style={{ color: isUnlocked ? meta.accent : "rgba(255,255,255,0.35)" }}>
          {name.split(" — ")[0]}
        </div>
        <div className={styles.cardSub}>{meta.subtitle}</div>
        <div className={styles.cardDesc}>{meta.desc}</div>

        {/* Bottom row */}
        <div className={styles.cardBottom}>
          {/* Stars difficulty */}
          <div className={styles.stars}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`${styles.star} ${s <= stars ? styles.starOn : ""}`}>
                ★
              </span>
            ))}
          </div>
          {/* Best score */}
          {completed && (
            <div className={styles.bestScore}>{score.toString().padStart(5, "0")}</div>
          )}
        </div>

        {/* Pokémon that unlock here */}
        {unlockCreatures.length > 0 && (
          <div className={styles.unlocks}>
            <span>Desbloquea:</span>
            {unlockCreatures.map((c) => (
              <span key={c.id} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span className={styles.unlockDot} style={{ background: RARITY_COLOR[c.rarity] }} />
                <span style={{ color: completed ? RARITY_COLOR[c.rarity] : "rgba(255,255,255,0.35)" }}>
                  {c.name}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Play button */}
        {isUnlocked && (
          <button
            type="button"
            className={styles.playBtn}
            style={{ background: `linear-gradient(135deg, ${meta.bgB}, ${meta.accent}88)`, border: `1px solid ${meta.accent}55` }}
            onClick={(e) => { e.stopPropagation(); onSelect(levelIndex); }}
          >
            {completed ? "Rejugar" : "Jugar"}
          </button>
        )}

        {!isUnlocked && (
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>
            Completa el nivel {levelIndex} para desbloquear
          </div>
        )}
      </div>
    </div>
  );
}
