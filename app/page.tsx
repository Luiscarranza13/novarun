import GameCanvas from "@/components/GameCanvas";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Sophisticated background glow */}
      <div className={styles.glow} />

      {/* Game frame with minimalist border */}
      <div className={styles.frame}>
        <div className={styles.inner}>
          <GameCanvas />
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.gameTitle}>NovaRun</span>
          <span className={styles.separator}>|</span>
          <span className={styles.disclaimer}>Fan Game - No afiliado con Nintendo ni Game Freak</span>
        </div>
      </footer>
    </main>
  );
}
