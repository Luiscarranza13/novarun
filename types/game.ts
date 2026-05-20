// ─── Core geometric primitives ───────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Difficulty ───────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "normal" | "hard";

// ─── Achievements ─────────────────────────────────────────────────────────────

export type AchievementId =
  | "first_kill"
  | "speed_run"
  | "untouchable"
  | "collector"
  | "star_power"
  | "used_special"
  | "boss_slayer"
  | "completionist";

// ─── Game state machine ───────────────────────────────────────────────────────

export type GameState =
  | "menu"
  | "character-select"
  | "playing"
  | "paused"
  | "game-over"
  | "victory";

export interface LevelStats {
  timeSeconds: number;
  enemiesKilled: number;
  coinsCollected: number;
  isHighScore: boolean;
}

// ─── Creature / character types ───────────────────────────────────────────────

export type ElementType =
  | "fire"
  | "water"
  | "electric"
  | "plant"
  | "rock"
  | "shadow";

export interface CreatureStats {
  maxHp: number;
  speed: number;       // pixels per frame
  jumpForce: number;   // initial upward velocity (negative)
  attack: number;      // base attack power
  maxEnergy: number;
  canDoubleJump: boolean;
}

export interface CreatureColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface CreatureData {
  id: string;
  name: string;
  element: ElementType;
  description: string;
  specialName: string;
  specialDescription: string;
  stats: CreatureStats;
  colors: CreatureColors;
}

// ─── Input ────────────────────────────────────────────────────────────────────

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;     // one-frame pulse
  jumpHeld: boolean; // held this frame — used for glide/levitate passives
  attack: boolean;   // one-frame pulse
  special: boolean;  // one-frame pulse
}

// ─── Level tiles ─────────────────────────────────────────────────────────────

/** 0=empty, 1=solid block, 2=one-way platform */
export type TileType = 0 | 1 | 2;

export interface EnemySpawnData {
  tileX: number;
  tileY: number;
  type: "basic" | "jumper" | "shooter";
  /** patrol range in tiles from spawn point */
  patrolRange: number;
}

export interface LevelData {
  id: number;
  name: string;
  tiles: TileType[][];
  enemySpawns: EnemySpawnData[];
  coinTiles: Vec2[];
  heartTiles: Vec2[];
  starTiles?: Vec2[];
  speedTiles?: Vec2[];
  bossSpawn?: { tileX: number; tileY: number };
  goalTile: Vec2;
  playerStartTile: Vec2;
  bgTop: string;
  bgBottom: string;
  tileColor: string;
  platformColor: string;
  decorationColor: string;
}

// ─── HUD state exposed to React ───────────────────────────────────────────────

export interface HUDState {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  score: number;
  level: number;
  creatureName: string;
  element: ElementType;
  colors: CreatureColors;
  boss?: { hp: number; maxHp: number; phase: number } | null;
}
