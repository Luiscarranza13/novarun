import { AchievementId } from "@/types/game";

// ─── High scores ──────────────────────────────────────────────────────────────

const SAVE_KEY        = "novarun_highscores";
const ACHIEVEMENT_KEY = "novarun_achievements";
const LEVEL_COUNT     = 6;

interface HighScoreData { [levelKey: string]: number; }

function loadScores(): HighScoreData {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    return data ? (JSON.parse(data) as HighScoreData) : {};
  } catch { return {}; }
}

export function getHighScore(levelIndex: number): number {
  return loadScores()[`level_${levelIndex}`] ?? 0;
}

/** Returns true if the new score is a new record. */
export function saveHighScore(levelIndex: number, score: number): boolean {
  const current = getHighScore(levelIndex);
  if (score <= current) return false;
  try {
    const data = loadScores();
    data[`level_${levelIndex}`] = score;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch { return false; }
}

export function getAllHighScores(): number[] {
  const data = loadScores();
  return Array.from({ length: LEVEL_COUNT }, (_, i) => data[`level_${i}`] ?? 0);
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_kill",    name: "Primer Golpe",    description: "Derrota a tu primer enemigo",              icon: "👊" },
  { id: "speed_run",     name: "Velocista",        description: "Completa un nivel en menos de 90 segundos", icon: "⚡" },
  { id: "untouchable",   name: "Intocable",        description: "Completa un nivel sin recibir daño",        icon: "🛡" },
  { id: "collector",     name: "Coleccionista",    description: "Recoge 10 monedas en un nivel",             icon: "💰" },
  { id: "star_power",    name: "Estrella",         description: "Recoge una estrella de poder",              icon: "⭐" },
  { id: "used_special",  name: "Poder Especial",   description: "Usa tu habilidad especial por primera vez", icon: "✨" },
  { id: "boss_slayer",   name: "Vencedor del Jefe", description: "Derrota a El Maestro",                    icon: "👑" },
  { id: "completionist", name: "Completista",       description: "Completa los 6 niveles",                  icon: "🏆" },
];

function loadAchievements(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AchievementId[]);
  } catch { return new Set(); }
}

/** Returns true if this is the first time the achievement is unlocked. */
export function unlockAchievement(id: AchievementId): boolean {
  const current = loadAchievements();
  if (current.has(id)) return false;
  current.add(id);
  try {
    localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(Array.from(current)));
  } catch { /* ignore */ }
  return true;
}

export function getUnlockedAchievements(): AchievementId[] {
  return Array.from(loadAchievements());
}

export function isAchievementUnlocked(id: AchievementId): boolean {
  return loadAchievements().has(id);
}
