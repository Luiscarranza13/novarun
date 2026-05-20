"use client";

import { HUDState } from "@/types/game";
import styles from "./HUD.module.css";

interface Props {
  hud: HUDState;
  visible: boolean;
}

const ELEMENT_ICON: Record<string, string> = {
  fire: "F",
  water: "A",
  electric: "E",
  plant: "P",
  rock: "R",
  shadow: "S",
};

export default function HUD({ hud, visible }: Props) {
  if (!visible) return null;

  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const enerPct = Math.max(0, Math.min(100, (hud.energy / hud.maxEnergy) * 100));
  const hpLow = hpPct < 25;

  return (
    <>
      <div className={styles.panel} style={{ top: 10, left: 10 }}>
        <div className={styles.nameRow}>
          <span className={styles.typeIcon}>{ELEMENT_ICON[hud.element]}</span>
          <span className={styles.pkName} style={{ color: hud.colors.primary }}>
            {hud.creatureName}
          </span>
        </div>

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
            {[25, 50, 75].map((t) => (
              <div key={t} className={styles.tick} style={{ left: `${t}%` }} />
            ))}
          </div>
          <span className={`${styles.barVal} ${hpLow ? styles.barValLow : ""}`}>
            {Math.ceil(hud.hp)}/{hud.maxHp}
          </span>
        </div>

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
            <div className={styles.tick} style={{ left: "30%" }} />
          </div>
          <span className={styles.barVal}>{Math.ceil(hud.energy)}</span>
        </div>

        {enerPct >= 30 && <div className={styles.specialReady}>Habilidad lista (K)</div>}
      </div>

      <div className={styles.panel} style={{ top: 10, right: 10, alignItems: "flex-end" }}>
        <div className={styles.levelRow}>
          <span className={styles.levelLabel}>NIVEL</span>
          <span className={styles.levelVal}>{hud.level}</span>
        </div>
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>PUNTOS</span>
          <span className={styles.scoreVal}>{hud.score.toString().padStart(5, "0")}</span>
        </div>
      </div>

      {hud.boss && hud.boss.hp > 0 && (
        <div className={styles.bossBar}>
          <div className={styles.bossName}>EL MAESTRO</div>
          <div className={styles.bossTrack}>
            <div
              className={styles.bossFill}
              style={{
                width: `${(hud.boss.hp / hud.boss.maxHp) * 100}%`,
                background:
                  hud.boss.phase === 1
                    ? "linear-gradient(90deg,#3355FF,#5588FF)"
                    : hud.boss.phase === 2
                    ? "linear-gradient(90deg,#CC5500,#FF8822)"
                    : "linear-gradient(90deg,#CC0000,#FF3333)",
                boxShadow:
                  hud.boss.phase === 1
                    ? "0 0 10px #3355FF88"
                    : hud.boss.phase === 2
                    ? "0 0 10px #FF882288"
                    : "0 0 10px #FF333388",
              }}
            />
            <div className={styles.bossTick} style={{ left: "67%" }} />
            <div className={styles.bossTick} style={{ left: "33%" }} />
          </div>
          <div className={styles.bossPhaseLabel}>Fase {hud.boss.phase}</div>
        </div>
      )}

      <div className={styles.controls}>
        <span>{"<->"}/AD Mover</span>
        <span>Arriba/Z Saltar</span>
        <span>J Atacar</span>
        <span>K Habilidad</span>
      </div>
    </>
  );
}
