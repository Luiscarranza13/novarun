"use client";

import styles from "./CreditsScreen.module.css";

interface Props { onClose: () => void; }

export default function CreditsScreen({ onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Créditos</h2>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Desarrollo</h3>
          <p className={styles.entry}>Luis Carranza — Game Design &amp; Programación</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Tecnologías</h3>
          <ul className={styles.list}>
            <li>Next.js 14 · TypeScript · Canvas 2D</li>
            <li>Web Audio API · Web Speech API</li>
            <li>Vercel · Tailwind CSS</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Personajes</h3>
          <p className={styles.entry}>
            Pokémon es marca registrada de Nintendo / Game Freak / Creatures Inc.
            Este es un proyecto de fan sin fines de lucro.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Música</h3>
          <p className={styles.entry}>Pokémon Red &amp; Blue OST — Nintendo / Game Freak</p>
        </section>

        <div className={styles.version}>NovaRun v2.0 — 2025</div>

        <button className={styles.closeBtn} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
