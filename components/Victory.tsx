"use client";

import { LevelStats } from "@/types/game";
import styles from "./Victory.module.css";

interface Props {
  score:        number;
  level:        number;
  hasNextLevel: boolean;
  stats:        LevelStats | null;
  onNext:       () => void;
  onMenu:       () => void;
}

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Victory({ score, level, hasNextLevel, stats, onNext, onMenu }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>🏆</div>
        <div className={styles.burst}>🎉 ✨ 🌟 ✨ 🎉</div>

        <h2 className={styles.title}>¡Victoria!</h2>
        <p className={styles.subtitle}>¡Nivel {level} completado!</p>

        {stats?.isHighScore && (
          <div className={styles.highScore}>🏅 ¡Nuevo Récord!</div>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Nivel</span>
            <span className={styles.statVal}>{level}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statLabel}>Puntos</span>
            <span className={`${styles.statVal} ${styles.gold}`}>
              {score.toString().padStart(5, "0")}
            </span>
          </div>
        </div>

        {stats && (
          <div className={styles.detailStats}>
            <span>⏱ {fmtTime(stats.timeSeconds)}</span>
            <span>💀 {stats.enemiesKilled} enemigos</span>
            <span>🎯 {stats.coinsCollected} monedas</span>
          </div>
        )}

        <div className={styles.buttons}>
          {hasNextLevel ? (
            <button type="button" onClick={onNext} className={`${styles.btn} ${styles.btnGreen}`}>
              ▶ Siguiente Nivel
            </button>
          ) : (
            <div className={styles.complete}>
              🌟 ¡Juego completado! ¡Eres increíble!
            </div>
          )}
          <button type="button" onClick={onMenu} className={`${styles.btn} ${styles.btnGhost}`}>
            🏠 Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
