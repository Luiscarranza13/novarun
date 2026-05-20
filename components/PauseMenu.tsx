"use client";

import styles from "./PauseMenu.module.css";

interface Props {
  onResume:       () => void;
  onRetry:        () => void;
  onMenu:         () => void;
  sfxVolume:      number;
  musicVolume:    number;
  onSfxVolume:    (v: number) => void;
  onMusicVolume:  (v: number) => void;
}

export default function PauseMenu({
  onResume, onRetry, onMenu,
  sfxVolume, musicVolume, onSfxVolume, onMusicVolume,
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>⏸ Pausado</h2>

        <div className={styles.volumeSection}>
          <label className={styles.volLabel}>
            <span>🔊 Efectos</span>
            <input
              type="range" min={0} max={1} step={0.05}
              value={sfxVolume}
              onChange={(e) => onSfxVolume(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.volVal}>{Math.round(sfxVolume * 100)}%</span>
          </label>
          <label className={styles.volLabel}>
            <span>🎵 Musica</span>
            <input
              type="range" min={0} max={1} step={0.05}
              value={musicVolume}
              onChange={(e) => onMusicVolume(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.volVal}>{Math.round(musicVolume * 100)}%</span>
          </label>
        </div>

        <div className={styles.hint}>Presiona Esc para reanudar</div>

        <div className={styles.buttons}>
          <button type="button" onClick={onResume} className={`${styles.btn} ${styles.btnGreen}`}>
            ▶ Reanudar
          </button>
          <button type="button" onClick={onRetry} className={`${styles.btn} ${styles.btnBlue}`}>
            🔄 Reintentar
          </button>
          <button type="button" onClick={onMenu} className={`${styles.btn} ${styles.btnGhost}`}>
            🏠 Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}
