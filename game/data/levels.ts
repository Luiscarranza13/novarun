import { LevelData, TileType } from "@/types/game";

export const TILE_SIZE = 40;

// ─── Tile-map helpers ─────────────────────────────────────────────────────────

function emptyMap(rows: number, cols: number): TileType[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0) as TileType[]);
}

function fillRow(
  map: TileType[][], row: number,
  c1: number, c2: number, type: TileType
) {
  for (let c = c1; c <= c2; c++) {
    if (c >= 0 && c < map[0].length) map[row][c] = type;
  }
}

function fillRect(
  map: TileType[][], col: number, row: number,
  w: number, h: number, type: TileType
) {
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      if (r >= 0 && r < map.length && c >= 0 && c < map[0].length)
        map[r][c] = type;
}

// ─── Level 1 — Ruta 1 (Pallet Town) ──────────────────────────────────────────

function buildLevel1(): TileType[][] {
  const map = emptyMap(12, 60);

  // Ground (rows 9-11) with gaps at 13-15, 31-33, 47-49
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  12, 1);
    fillRow(map, row, 16, 30, 1);
    fillRow(map, row, 34, 46, 1);
    fillRow(map, row, 50, 59, 1);
  }

  // Platforms (type 2 = one-way)
  fillRow(map, 6, 3,  7,  2);  // early hop
  fillRow(map, 5, 10, 13, 2);  // bridge over gap 1
  fillRow(map, 7, 17, 20, 2);  // low ledge
  fillRow(map, 4, 22, 25, 2);  // high platform
  fillRow(map, 6, 27, 31, 2);  // bridge over gap 2
  fillRow(map, 5, 35, 38, 2);
  fillRow(map, 3, 40, 43, 2);  // sky platform
  fillRow(map, 6, 43, 48, 2);  // bridge over gap 3
  fillRow(map, 4, 52, 55, 2);
  fillRow(map, 2, 56, 59, 2);  // top near goal

  // Solid raised terrain
  fillRect(map, 8, 7, 2, 2, 1);
  fillRect(map, 24, 6, 2, 3, 1);
  fillRect(map, 37, 6, 2, 3, 1);

  return map;
}

// ─── Level 2 — Monte Luna ─────────────────────────────────────────────────────

function buildLevel2(): TileType[][] {
  const map = emptyMap(12, 65);

  // Spiky cave ground with more gaps
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  7,  1);
    fillRow(map, row, 11, 19, 1);
    fillRow(map, row, 23, 30, 1);
    fillRow(map, row, 34, 42, 1);
    fillRow(map, row, 46, 53, 1);
    fillRow(map, row, 57, 64, 1);
  }

  // Dense platforms
  fillRow(map, 7, 2,  5,  2);
  fillRow(map, 5, 6,  9,  2);
  fillRow(map, 6, 12, 15, 2);
  fillRow(map, 4, 17, 20, 2);
  fillRow(map, 6, 21, 24, 2);
  fillRow(map, 3, 26, 29, 2);
  fillRow(map, 5, 31, 34, 2);
  fillRow(map, 7, 35, 38, 2);
  fillRow(map, 4, 39, 42, 2);
  fillRow(map, 6, 43, 46, 2);
  fillRow(map, 3, 48, 51, 2);
  fillRow(map, 5, 53, 56, 2);
  fillRow(map, 7, 57, 60, 2);
  fillRow(map, 4, 61, 64, 2);

  // Cave stalactite-style blocks from ceiling
  fillRect(map, 4,  0, 2, 3, 1);
  fillRect(map, 14, 0, 2, 4, 1);
  fillRect(map, 27, 0, 2, 3, 1);
  fillRect(map, 40, 0, 2, 4, 1);
  fillRect(map, 55, 0, 2, 3, 1);
  // Floor rocks
  fillRect(map, 9,  6, 2, 3, 1);
  fillRect(map, 24, 5, 2, 4, 1);
  fillRect(map, 47, 6, 2, 3, 1);

  return map;
}

// ─── Level 3 — Islas Espuma ───────────────────────────────────────────────────

function buildLevel3(): TileType[][] {
  const map = emptyMap(12, 70);

  // Almost no ground — pure platforming
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  4,  1);
    fillRow(map, row, 66, 69, 1);
  }

  // Zigzag platforms
  const platforms: [number, number, number][] = [
    [1,  7, 4], [6,  5, 4], [10, 7, 3], [14, 4, 4], [18, 6, 3],
    [22, 3, 4], [25, 6, 3], [28, 4, 4], [32, 7, 3], [36, 5, 4],
    [38, 3, 4], [42, 6, 3], [45, 4, 4], [49, 7, 3], [53, 5, 4],
    [55, 3, 4], [59, 6, 3], [62, 4, 4], [65, 7, 3], [67, 5, 3],
  ];
  for (const [c, r, ww] of platforms) fillRow(map, r, c, c + ww - 1, 2);

  // Ice pillars
  fillRect(map, 9,  7, 1, 5, 1);
  fillRect(map, 24, 6, 1, 6, 1);
  fillRect(map, 42, 7, 1, 5, 1);
  fillRect(map, 60, 6, 1, 6, 1);

  return map;
}

// ─── Level registry ───────────────────────────────────────────────────────────

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Ruta 1 — Pallet Town",
    tiles: buildLevel1(),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 57, y: 5 },
    enemySpawns: [
      { tileX: 7,  tileY: 8, type: "basic",  patrolRange: 3 },
      { tileX: 19, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 29, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 37, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 45, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 54, tileY: 8, type: "basic",  patrolRange: 2 },
    ],
    coinTiles: [
      { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 7, y: 5 },
      { x: 11, y: 4 }, { x: 12, y: 4 },
      { x: 22, y: 3 }, { x: 24, y: 3 },
      { x: 29, y: 5 }, { x: 30, y: 5 },
      { x: 40, y: 2 }, { x: 42, y: 2 },
      { x: 52, y: 3 }, { x: 53, y: 3 }, { x: 55, y: 3 },
    ],
    heartTiles: [{ x: 18, y: 6 }, { x: 36, y: 4 }],
    bgTop:           "#87CEEB",
    bgBottom:        "#C8E6A0",
    tileColor:       "#5D8A3C",
    platformColor:   "#8BC34A",
    decorationColor: "#A5D6A7",
  },
  {
    id: 2,
    name: "Monte Luna",
    tiles: buildLevel2(),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 62, y: 5 },
    enemySpawns: [
      { tileX: 4,  tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 14, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 25, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 36, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 48, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 59, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 62, tileY: 8, type: "basic",  patrolRange: 2 },
    ],
    coinTiles: [
      { x: 3, y: 6 }, { x: 7, y: 4 }, { x: 13, y: 5 },
      { x: 18, y: 3 }, { x: 27, y: 2 }, { x: 32, y: 4 },
      { x: 40, y: 3 }, { x: 44, y: 5 }, { x: 49, y: 2 },
      { x: 54, y: 4 }, { x: 62, y: 3 },
    ],
    heartTiles: [{ x: 22, y: 5 }, { x: 50, y: 5 }],
    bgTop:           "#1a1a2e",
    bgBottom:        "#16213e",
    tileColor:       "#4A4A6A",
    platformColor:   "#6A6A9A",
    decorationColor: "#9090C0",
  },
  {
    id: 3,
    name: "Islas Espuma",
    tiles: buildLevel3(),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 67, y: 5 },
    enemySpawns: [
      { tileX: 8,  tileY: 4, type: "jumper", patrolRange: 2 },
      { tileX: 18, tileY: 3, type: "basic",  patrolRange: 2 },
      { tileX: 27, tileY: 5, type: "jumper", patrolRange: 3 },
      { tileX: 37, tileY: 4, type: "jumper", patrolRange: 2 },
      { tileX: 46, tileY: 6, type: "basic",  patrolRange: 2 },
      { tileX: 56, tileY: 5, type: "jumper", patrolRange: 3 },
      { tileX: 65, tileY: 4, type: "basic",  patrolRange: 2 },
    ],
    coinTiles: [
      { x: 3,  y: 6 }, { x: 8,  y: 4 }, { x: 14, y: 6 },
      { x: 18, y: 3 }, { x: 23, y: 5 }, { x: 27, y: 2 },
      { x: 32, y: 6 }, { x: 39, y: 4 }, { x: 43, y: 5 },
      { x: 49, y: 6 }, { x: 55, y: 2 }, { x: 60, y: 6 },
      { x: 65, y: 3 },
    ],
    heartTiles: [{ x: 23, y: 2 }, { x: 54, y: 4 }],
    bgTop:           "#001f3f",
    bgBottom:        "#003366",
    tileColor:       "#B0D4E8",
    platformColor:   "#D0ECFF",
    decorationColor: "#E8F8FF",
  },
];
