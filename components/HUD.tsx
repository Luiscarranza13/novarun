"use client";

import { HUDState } from "@/types/game";
import styles from "./HUD.module.css";

interface Props { hud: HUDState; visible: boolean; }

const ELEMENT_ICON: Record<string, string> = {
  fire: "🔥", water: "💧", electric: "⚡",
  plant: "🌿", rock: "🪨", shadow: "👻",
};

export default function HUD({ hud, visible }: Props) {
  if (!visible) return null;

  const hpPct     = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const enerPct   = Math.max(0, Math.min(100, (hud.energy / hud.maxEnergy) * 100));
  const hpLow     = hpPct < 25;

  return (
    <>
      {/* ── Top-left: HP + Energy ──────────────────────────────────── */}
      <div className={styles.panel} style={{ top: 10, left: 10 }}>
        {/* Pokémon name + type */}
        <div className={styles.nameRow}>
          <span className={styles.typeIcon}>{ELEMENT_ICON[hud.element]}</span>
          <span className={styles.pkName} style={{ color: hud.colors.primary }}>
            {hud.creatureName}
          </span>
        </div>

        {/* HP bar */}
        <div className={styles.barRow}>
          <span className={styles.barLabel}>HP</span>
          <div className={styles.barTrack}>
            <div
              className={`${styles.barFill} ${hpLow ? styles.barLow : ""}`}
              style={{
                width: `${hpPct}%`,
                background: hpLow
                  ? "linear-gradient(90deg,#ff2020,#ff6060)"
                  : `linear-gradient(90deg,${hud.colors.secondary}cc,${hud.colors.primary})`,
                boxShadow: `0 0 7px ${hpLow ? "#ff2020" : hud.colors.primary}88`,
              }}
            />
            {/* Tick marks */}
            {[25, 50, 75].map((t) => (
              <div key={t} className={styles.tick} style={{ left: `${t}%` }} />
            ))}
          </div>
          <span className={`${styles.barVal} ${hpLow ? styles.barValLow : ""}`}>
            {Math.ceil(hud.hp)}/{hud.maxHp}
          </span>
        </div>

        {/* Energy bar */}
        <div className={styles.barRow}>
          <span className={styles.barLabel}>EN</span>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{
                width: `${enerPct}%`,
                background: "linear-gradient(90deg,#2266cc,#44aaff)",
                boxShadow: "0 0 7px #44aaff88",
              }}
            />
            {/* Energy ready indicator at 30 */}
            <div className={styles.tick} style={{ left: "30%" }} />
          </div>
          <span className={styles.barVal}>{Math.ceil(hud.energy)}</span>
        </div>

        {/* Special ready badge */}
        {enerPct >= 30 && (
          <div className={styles.specialReady}>✨ Habilidad lista (K)</div>
        )}
      </div>

      {/* ── Top-right: score + level ───────────────────────────────── */}
      <div className={styles.panel} style={{ top: 10, right: 10, alignItems: "flex-end" }}>
        <div className={styles.levelRow}>
          <span className={styles.levelLabel}>NIVEL</span>
          <span className={styles.levelVal}>{hud.level}</span>
        </div>
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>PUNTOS</span>
          <span className={styles.scoreVal}>
            {hud.score.toString().padStart(5, "0")}
          </span>
        </div>
      </div>

      {/* ── Bottom controls hint ───────────────────────────────────── */}
      <div className={styles.controls}>
        <span>←→/AD Mover</span>
        <span>↑/Z Saltar</span>
        <span>J Atacar</span>
        <span>K Habilidad</span>
      </div>
    </>
  );
}
