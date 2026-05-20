"use client";

import { useEffect, useRef, useState } from "react";
import { CREATURES } from "@/game/data/creatures";
import { CreatureData } from "@/types/game";
import { PokemonId, SPRITE_MAP } from "@/game/rendering/sprites";
import styles from "./CharacterSelect.module.css";

interface Props {
  onSelect: (c: CreatureData) => void;
  onBack: () => void;
}

const ELEMENT_LABEL: Record<string, string> = {
  fire: "Fuego",
  water: "Agua",
  electric: "Electrico",
  plant: "Planta",
  rock: "Roca",
  shadow: "Fantasma",
};

const ELEMENT_ICON: Record<string, string> = {
  fire: "F",
  water: "A",
  electric: "E",
  plant: "P",
  rock: "R",
  shadow: "S",
};

const PASSIVE_DESC: Record<string, { name: string; desc: string }> = {
  pikachu: { name: "Descarga estatica", desc: "El doble salto libera una descarga electrica que dana a los enemigos cercanos." },
  charizard: { name: "Planeo", desc: "Manten salto mientras caes para planear a baja velocidad." },
  bulbasaur: { name: "Regeneracion", desc: "Se cura lentamente de forma continua gracias a su energia vital." },
  squirtle: { name: "Escudo acuatico", desc: "Su escudo especial lo hace inmune al dano durante varios segundos." },
  mewtwo: { name: "Levitar", desc: "Manten salto en el aire para reducir la gravedad y flotar por mas tiempo." },
  gengar: { name: "Vuelo fantasma", desc: "En el aire se mueve mas rapido y cae mas lento que los demas." },
  eevee: { name: "Adaptacion", desc: "Su barrida especial lo propulsa a gran velocidad, ignorando la friccion." },
};

const STAT_ROWS = [
  { key: "maxHp", label: "HP", max: 130, color: "#FF4444" },
  { key: "speed", label: "Velocidad", max: 10, color: "#44AAFF" },
  { key: "jumpForce", label: "Salto", max: 15, color: "#44FF88" },
  { key: "attack", label: "Ataque", max: 12, color: "#FF8C00" },
  { key: "maxEnergy", label: "Energia", max: 100, color: "#AA44FF" },
] as const;

function drawStableSprite(
  canvas: HTMLCanvasElement,
  creatureId: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const ctx = canvas.getContext("2d");
  const drawFn = SPRITE_MAP[creatureId as PokemonId];
  if (!ctx || !drawFn) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, x, y, width, height, true, 0, "idle", false);
}

export default function CharacterSelect({ onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<CreatureData>(CREATURES[0]);
  const passive = PASSIVE_DESC[selected.id];

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          Volver
        </button>
        <h2 className={styles.title}>Elige tu Pokemon</h2>
        <div className={styles.tagline}>Fan Game - No oficial</div>
      </div>

      <div className={styles.layout}>
        <div className={styles.characterGrid}>
          {CREATURES.map((creature) => (
            <PokemonCard
              key={creature.id}
              creature={creature}
              selected={selected.id === creature.id}
              onSelect={() => setSelected(creature)}
            />
          ))}
        </div>

        <div className={styles.detailColumn}>
          <div
            className={styles.previewCard}
            style={{
              background: `linear-gradient(135deg,${selected.colors.primary}22,${selected.colors.secondary}11)`,
              border: `2px solid ${selected.colors.primary}55`,
              boxShadow: `0 0 50px ${selected.colors.primary}22`,
            }}
          >
            <BigPreview creature={selected} />

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
                  <span
                    className={styles.badge}
                    style={{ background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.72)" }}
                  >
                    Doble salto
                  </span>
                )}
              </div>
            </div>

            <p className={styles.description}>{selected.description}</p>

            <div
              className={styles.infoBox}
              style={{ background: `${selected.colors.accent}14`, border: `1px solid ${selected.colors.accent}44` }}
            >
              <p className={styles.boxTitle} style={{ color: selected.colors.accent }}>
                {selected.specialName}
              </p>
              <p className={styles.boxText}>{selected.specialDescription}</p>
              <p className={styles.boxHint}>Tecla: K - Costo: 30 energia</p>
            </div>

            {passive && (
              <div
                className={styles.infoBox}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <p className={styles.boxTitle} style={{ color: "rgba(255,255,255,0.72)" }}>
                  Pasiva: {passive.name}
                </p>
                <p className={styles.boxText}>{passive.desc}</p>
              </div>
            )}
          </div>

          <div className={styles.statsCard}>
            <p className={styles.statsTitle}>Estadisticas</p>
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
                        background: `linear-gradient(90deg,${selected.colors.secondary},${color})`,
                        boxShadow: `0 0 6px ${color}88`,
                      }}
                    />
                  </div>
                  <span className={styles.statValue} style={{ color: selected.colors.accent }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onSelect(selected)}
            className={styles.cta}
            style={{
              background: `linear-gradient(135deg,${selected.colors.secondary},${selected.colors.primary})`,
              boxShadow: `0 0 28px ${selected.colors.primary}66`,
            }}
          >
            Jugar con {selected.name}
          </button>
        </div>
      </div>
    </div>
  );
}

function PokemonCard({
  creature,
  selected,
  onSelect,
}: {
  creature: CreatureData;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = creature.colors;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawStableSprite(canvas, creature.id, 0, 2, 48, 50);
  }, [creature.id]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${styles.characterCard} ${selected ? styles.selectedCard : ""}`}
      style={{
        background: selected ? `${c.primary}28` : "rgba(255,255,255,0.04)",
        borderColor: selected ? c.primary : "transparent",
        boxShadow: selected ? `0 0 16px ${c.primary}44` : "none",
      }}
    >
      <canvas ref={ref} width={48} height={52} className={styles.cardSprite} />
      <span className={styles.cardName} style={{ color: c.primary }}>
        {creature.name}
      </span>
    </button>
  );
}

function BigPreview({ creature }: { creature: CreatureData }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawStableSprite(canvas, creature.id, 5, 5, 100, 110);
  }, [creature.id]);

  return (
    <div className={styles.bigSpriteWrap}>
      <div className={styles.glowDisc} style={{ background: creature.colors.primary }} />
      <canvas ref={ref} width={110} height={120} className={styles.bigSprite} />
    </div>
  );
}
