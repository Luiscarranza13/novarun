"use client";

import styles from "./GameOver.module.css";

interface Props {
  score:   number;
  level:   number;
  onRetry: () => void;
  onMenu:  () => void;
}

export default function GameOver({ score, level, onRetry, onMenu }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>💀</div>

        <h2 className={styles.title}>¡Derrota!</h2>
        <p className={styles.subtitle}>Las criaturas del mal te han vencido…</p>

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
          <button type="button" onClick={onRetry} className={`${styles.btn} ${styles.btnRed}`}>
            🔄 Reintentar
          </button>
          <button type="button" onClick={onMenu} className={`${styles.btn} ${styles.btnGhost}`}>
            🏠 Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
