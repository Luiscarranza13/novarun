"use client";

import styles from "./Victory.module.css";

interface Props {
  score:        number;
  level:        number;
  hasNextLevel: boolean;
  onNext:       () => void;
  onMenu:       () => void;
}

export default function Victory({ score, level, hasNextLevel, onNext, onMenu }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>🏆</div>
        <div className={styles.burst}>🎉 ✨ 🌟 ✨ 🎉</div>

        <h2 className={styles.title}>¡Victoria!</h2>
        <p className={styles.subtitle}>¡Nivel {level} completado!</p>

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
