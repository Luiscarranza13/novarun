"use client";

import styles from "./HowToPlay.module.css";

interface Props { onClose: () => void; }

export default function HowToPlay({ onClose }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>Cómo Jugar</h2>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🎮 Controles</h3>
          <div className={styles.keyTable}>
            <KeyRow k="← → / A D"           v="Mover izquierda / derecha" />
            <KeyRow k="↑ / Z / Espacio"     v="Saltar (doble salto disponible en Pikachu, Charizard y Eevee)" />
            <KeyRow k="J / V"               v="Ataque básico cuerpo a cuerpo" />
            <KeyRow k="K / B"               v="Habilidad especial (cuesta 30 energía)" />
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>⚔️ Combate</h3>
          <p className={styles.text}>
            Salta encima de los enemigos para derrotarlos o usa tu ataque (J).
            Cuando la barra de energía supere el 30%, la habilidad especial (K) estará disponible.
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>🏆 Objetivo</h3>
          <p className={styles.text}>
            Llega a la bandera al final de cada nivel.
            Recoge <strong>Pokéballs</strong> (+10 pts) y <strong>Pociones</strong> (+25 HP).
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>✨ Habilidades Especiales</h3>
          <div className={styles.abilityList}>
            {[
              ["⚡ Pikachu",   "Impactrueno — Rayo eléctrico que paraliza"],
              ["🔥 Charizard", "Lanzallamas — Bola de fuego devastadora + doble salto"],
              ["🌿 Bulbasaur", "Látigo Cepa — Enredadera + cura parcial"],
              ["💧 Squirtle",  "Pistola Agua — Proyectil + escudo de agua (K)"],
              ["🔮 Mewtwo",    "Psíquico — Teleport dash con onda de choque"],
              ["👻 Gengar",    "Bola Sombra — Esfera oscura que atraviesa"],
              ["✦ Eevee",      "Venganza — Dash veloz + doble salto"],
            ].map(([name, desc]) => (
              <div key={name} className={styles.ability}>
                <span className={styles.abilityName}>{name}:</span>
                <span className={styles.abilityDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <button type="button" onClick={onClose} className={styles.closeBtn}>
          ¡Entendido! ▶ Jugar
        </button>
      </div>
    </div>
  );
}

function KeyRow({ k, v }: { k: string; v: string }) {
  return (
    <div className={styles.keyRow}>
      <span className={styles.key}>{k}</span>
      <span className={styles.keyDesc}>{v}</span>
    </div>
  );
}
