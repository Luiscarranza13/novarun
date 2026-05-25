"use client";

import { useEffect, useRef, useState } from "react";
import { CREATURES } from "@/game/data/creatures";
import { CreatureData, RarityType } from "@/types/game";
import { PokemonId, SPRITE_MAP } from "@/game/rendering/sprites";
import { isLevelCompleted } from "@/game/saveSystem";
import styles from "./CharacterSelect.module.css";

interface Props {
  onSelect: (c: CreatureData) => void;
  onBack: () => void;
}

const ELEMENT_LABEL: Record<string, string> = {
  fire: "Fuego", water: "Agua", electric: "Electrico",
  plant: "Planta", rock: "Roca", shadow: "Fantasma",
};
const ELEMENT_ICON: Record<string, string> = {
  fire: "F", water: "A", electric: "E", plant: "P", rock: "R", shadow: "S",
};

const RARITY_LABEL: Record<RarityType, string> = {
  "comun": "Común", "poco-comun": "Poco Común", "raro": "Raro", "legendario": "Legendario",
};
const RARITY_CSS: Record<RarityType, string> = {
  "comun": styles.rarityComun, "poco-comun": styles.rarityPocoCom,
  "raro": styles.rarityRaro, "legendario": styles.rarityLegendario,
};
const RARITY_DOT: Record<RarityType, string> = {
  "comun": "#9e9e9e", "poco-comun": "#4caf50", "raro": "#2196f3", "legendario": "#ff9800",
};

const PASSIVE_DESC: Record<string, { name: string; desc: string }> = {
  pikachu:  { name: "Descarga estática", desc: "El doble salto libera una descarga eléctrica que daña a los enemigos cercanos." },
  charizard:{ name: "Planeo",            desc: "Mantén salto mientras caes para planear a baja velocidad." },
  bulbasaur:{ name: "Regeneración",      desc: "Se cura lentamente de forma continua gracias a su energía vital." },
  squirtle: { name: "Escudo acuático",   desc: "Su escudo especial lo hace inmune al daño durante varios segundos." },
  mewtwo:   { name: "Levitar",           desc: "Mantén salto en el aire para reducir la gravedad y flotar más tiempo." },
  gengar:   { name: "Vuelo fantasma",    desc: "En el aire se mueve más rápido y cae más lento que los demás." },
  eevee:    { name: "Adaptación",        desc: "Su barrida especial lo propulsa a gran velocidad, ignorando la fricción." },
};

const STAT_ROWS = [
  { key: "maxHp",    label: "HP",        max: 130, color: "#FF4444" },
  { key: "speed",    label: "Velocidad", max: 10,  color: "#44AAFF" },
  { key: "jumpForce",label: "Salto",     max: 15,  color: "#44FF88" },
  { key: "attack",   label: "Ataque",    max: 12,  color: "#FF8C00" },
  { key: "maxEnergy",label: "Energía",   max: 100, color: "#AA44FF" },
] as const;

function isUnlocked(c: CreatureData): boolean {
  return c.unlockLevel === 0 || isLevelCompleted(c.unlockLevel);
}

function drawStableSprite(canvas: HTMLCanvasElement, id: string, x: number, y: number, w: number, h: number) {
  const ctx = canvas.getContext("2d");
  const drawFn = SPRITE_MAP[id as PokemonId];
  if (!ctx || !drawFn) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, x, y, w, h, true, 0, "idle", false);
}

export default function CharacterSelect({ onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<CreatureData>(CREATURES[0]);
  const passive = PASSIVE_DESC[selected.id];
  const unlocked = isUnlocked(selected);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>Volver</button>
        <h2 className={styles.title}>Elige tu Pokémon</h2>
        <div className={styles.tagline}>Fan Game - No oficial</div>
      </div>

      <div className={styles.layout}>
        {/* ── Left grid ───────────────────────────────────────────────────── */}
        <div className={styles.characterGrid}>
          {CREATURES.map((c) => (
            <PokemonCard
              key={c.id}
              creature={c}
              selected={selected.id === c.id}
              onSelect={() => setSelected(c)}
            />
          ))}
        </div>

        {/* ── Right detail ─────────────────────────────────────────────────── */}
        <div className={styles.detailColumn}>
          <div
            className={styles.previewCard}
            style={{
              background: `linear-gradient(135deg,${selected.colors.primary}22,${selected.colors.secondary}11)`,
              border: `2px solid ${selected.colors.primary}55`,
              boxShadow: `0 0 50px ${selected.colors.primary}22`,
            }}
          >
            <BigPreview creature={selected} locked={!unlocked} />

            <div className={styles.nameBlock}>
              <h3 className={styles.pokemonName} style={{ color: selected.colors.primary }}>
                {selected.name}
              </h3>
              <div className={styles.badges}>
                <span
                  className={styles.badge}
                  style={{ background: `${selected.colors.primary}33`, color: selected.colors.accent }}
                >
                  {ELEMENT_ICON[selected.element]} {ELEMENT_LABEL[selected.element]}
                </span>
                {selected.stats.canDoubleJump && (
                  <span className={styles.badge} style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.72)" }}>
                    Doble salto
                  </span>
                )}
                <span className={`${styles.badge} ${styles.rarityBadge} ${RARITY_CSS[selected.rarity]}`}>
                  {RARITY_LABEL[selected.rarity]}
                </span>
              </div>
            </div>

            {unlocked ? (
              <>
                <p className={styles.description}>{selected.description}</p>

                <div
                  className={styles.infoBox}
                  style={{ background: `${selected.colors.accent}14`, border: `1px solid ${selected.colors.accent}44` }}
                >
                  <p className={styles.boxTitle} style={{ color: selected.colors.accent }}>{selected.specialName}</p>
                  <p className={styles.boxText}>{selected.specialDescription}</p>
                  <p className={styles.boxHint}>Tecla: K · Costo: 30 energía</p>
                </div>

                {passive && (
                  <div className={styles.infoBox} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
                    <p className={styles.boxTitle} style={{ color: "rgba(255,255,255,0.72)" }}>Pasiva: {passive.name}</p>
                    <p className={styles.boxText}>{passive.desc}</p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.lockedInfo}>
                <div className={styles.lockedBigIcon}>🔒</div>
                <div className={styles.lockedTitle}>Pokémon bloqueado</div>
                <div className={styles.lockedHint}>
                  Completa el <strong style={{ color: "#ffd700" }}>Nivel {selected.unlockLevel}</strong> para
                  desbloquear a {selected.name}.
                </div>
              </div>
            )}
          </div>

          {/* Stats are always visible */}
          <div className={styles.statsCard}>
            <p className={styles.statsTitle}>Estadísticas</p>
            {STAT_ROWS.map(({ key, label, max, color }) => {
              const val = selected.stats[key] as number;
              return (
                <div key={key} className={styles.statRow}>
                  <span className={styles.statLabel}>{label}</span>
                  <div className={styles.statTrack}>
                    <div
                      className={styles.statFill}
                      style={{
                        width: `${(val / max) * 100}%`,
                        background: unlocked
                          ? `linear-gradient(90deg,${selected.colors.secondary},${color})`
                          : "rgba(255,255,255,0.15)",
                        boxShadow: unlocked ? `0 0 6px ${color}88` : "none",
                      }}
                    />
                  </div>
                  <span className={styles.statValue} style={{ color: unlocked ? selected.colors.accent : "rgba(255,255,255,0.3)" }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onSelect(selected)}
            className={styles.cta}
            style={
              unlocked
                ? { background: `linear-gradient(135deg,${selected.colors.secondary},${selected.colors.primary})`, boxShadow: `0 0 28px ${selected.colors.primary}66` }
                : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.30)", cursor: "not-allowed" }
            }
          >
            {unlocked ? `Jugar con ${selected.name}` : `🔒 Nivel ${selected.unlockLevel} requerido`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PokemonCard({ creature, selected, onSelect }: { creature: CreatureData; selected: boolean; onSelect: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = creature.colors;
  const unlocked = isUnlocked(creature);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawStableSprite(canvas, creature.id, 0, 2, 48, 50);
  }, [creature.id]);

  return (
    <div className={styles.cardWrapper}>
      <button
        type="button"
        onClick={onSelect}
        className={`${styles.characterCard} ${selected ? styles.selectedCard : ""}`}
        style={{
          background: selected ? `${c.primary}28` : "rgba(255,255,255,0.04)",
          borderColor: selected ? c.primary : "transparent",
          boxShadow: selected ? `0 0 16px ${c.primary}44` : "none",
          opacity: unlocked ? 1 : 0.72,
        }}
      >
        <canvas ref={ref} width={48} height={52} className={styles.cardSprite} style={{ filter: unlocked ? "none" : "grayscale(0.7)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div className={styles.cardRarityDot} style={{ background: RARITY_DOT[creature.rarity] }} />
          <span className={styles.cardName} style={{ color: unlocked ? c.primary : "rgba(255,255,255,0.35)" }}>
            {creature.name}
          </span>
        </div>
      </button>
      {!unlocked && (
        <div className={styles.cardLockOverlay}>
          <div className={styles.lockIcon}>🔒</div>
          <div className={styles.lockLevel}>Niv. {creature.unlockLevel}</div>
        </div>
      )}
    </div>
  );
}

function BigPreview({ creature, locked }: { creature: CreatureData; locked: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawStableSprite(canvas, creature.id, 5, 5, 100, 110);
  }, [creature.id]);

  return (
    <div className={styles.bigSpriteWrap}>
      <div className={styles.glowDisc} style={{ background: locked ? "#555" : creature.colors.primary }} />
      <canvas
        ref={ref}
        width={110}
        height={120}
        className={styles.bigSprite}
        style={{ filter: locked ? "grayscale(0.6) brightness(0.7)" : "none" }}
      />
    </div>
  );
}
