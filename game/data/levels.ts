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

// ─── Level 4 — Acantilado Eléctrico ──────────────────────────────────────────

function buildLevel4(): TileType[][] {
  const map = emptyMap(12, 72);

  // Ground with wide gaps — need good jumping to cross
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  8,  1);
    fillRow(map, row, 13, 22, 1);
    fillRow(map, row, 27, 36, 1);
    fillRow(map, row, 41, 52, 1);
    fillRow(map, row, 56, 65, 1);
    fillRow(map, row, 68, 71, 1);
  }

  // Multi-level platforms — creates a vertical challenge
  fillRow(map, 7, 2,  5,  2);
  fillRow(map, 5, 5,  8,  2);
  fillRow(map, 6, 10, 13, 2);
  fillRow(map, 4, 14, 17, 2);
  fillRow(map, 7, 18, 21, 2);
  fillRow(map, 3, 22, 26, 2);
  fillRow(map, 5, 28, 31, 2);
  fillRow(map, 7, 33, 36, 2);
  fillRow(map, 4, 37, 40, 2);
  fillRow(map, 6, 41, 44, 2);
  fillRow(map, 2, 44, 48, 2);
  fillRow(map, 5, 49, 53, 2);
  fillRow(map, 7, 54, 57, 2);
  fillRow(map, 3, 58, 62, 2);
  fillRow(map, 5, 63, 67, 2);
  fillRow(map, 6, 68, 71, 2);

  // Solid cliff pillars
  fillRect(map, 7, 6, 2, 3, 1);
  fillRect(map, 21, 5, 2, 4, 1);
  fillRect(map, 38, 6, 2, 3, 1);
  fillRect(map, 53, 5, 2, 4, 1);

  return map;
}

// ─── Level 5 — Templo Maldito ─────────────────────────────────────────────────

function buildLevel5(): TileType[][] {
  const map = emptyMap(12, 76);

  // Temple floor — continuous with raised sections
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  75, 1);
  }

  // Raised pillars blocking direct path
  fillRect(map, 10, 6, 3, 3, 1);
  fillRect(map, 20, 5, 3, 4, 1);
  fillRect(map, 30, 4, 3, 5, 1);
  fillRect(map, 42, 6, 3, 3, 1);
  fillRect(map, 54, 5, 3, 4, 1);
  fillRect(map, 64, 4, 3, 5, 1);

  // Raised platform sections above pillars
  fillRow(map, 5, 4,  8,  2);
  fillRow(map, 4, 13, 17, 2);
  fillRow(map, 3, 22, 26, 2);
  fillRow(map, 5, 33, 38, 2);
  fillRow(map, 4, 44, 49, 2);
  fillRow(map, 3, 56, 61, 2);
  fillRow(map, 5, 66, 70, 2);

  // Ceiling sections (trap-like low ceiling in places)
  fillRow(map, 0, 8,  14, 1);
  fillRow(map, 0, 25, 32, 1);
  fillRow(map, 0, 48, 55, 1);
  fillRow(map, 1, 8,  14, 1);
  fillRow(map, 1, 25, 32, 1);
  fillRow(map, 1, 48, 55, 1);

  return map;
}

// ─── Level 6 — Cima Volcánica (Boss Level) ────────────────────────────────────

function buildLevel6(): TileType[][] {
  const map = emptyMap(12, 82);

  // Approach: broken volcanic ground
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  10, 1);
    fillRow(map, row, 14, 24, 1);
    fillRow(map, row, 28, 38, 1);
    fillRow(map, row, 42, 52, 1);
    // Boss arena — solid flat floor
    fillRow(map, row, 54, 81, 1);
  }

  // Stepping stones to reach boss arena
  fillRow(map, 7, 2,  5,  2);
  fillRow(map, 5, 6,  9,  2);
  fillRow(map, 6, 11, 14, 2);
  fillRow(map, 4, 16, 20, 2);
  fillRow(map, 7, 22, 25, 2);
  fillRow(map, 5, 27, 30, 2);
  fillRow(map, 3, 31, 36, 2);
  fillRow(map, 6, 38, 41, 2);
  fillRow(map, 7, 43, 46, 2);
  fillRow(map, 5, 48, 52, 2);

  // Volcanic rocks in the approach
  fillRect(map, 8,  7, 2, 2, 1);
  fillRect(map, 20, 6, 2, 3, 1);
  fillRect(map, 36, 7, 2, 2, 1);

  // Boss arena walls (fire-pillars at entrance)
  fillRect(map, 54, 6, 2, 3, 1);

  return map;
}

// ─── Level registry ───────────────────────────────────────────────────────────

function appendEncoreSection(map: TileType[][], levelId: number): TileType[][] {
  const start = map[0].length;
  const extra = levelId === 6 ? 48 : 44;
  for (const row of map) row.push(...Array(extra).fill(0) as TileType[]);

  if (levelId === 3) {
    for (let row = 9; row <= 11; row++) {
      fillRow(map, row, start, start + 5, 1);
      fillRow(map, row, start + 38, start + extra - 1, 1);
    }
  } else {
    for (let row = 9; row <= 11; row++) {
      fillRow(map, row, start, start + 8, 1);
      fillRow(map, row, start + 13, start + 22, 1);
      fillRow(map, row, start + 27, start + extra - 1, 1);
    }
  }

  const ledges: [number, number, number][] = [
    [3, 7, 4], [8, 5, 4], [13, 6, 4], [18, 4, 5],
    [24, 7, 4], [29, 5, 5], [35, 3, 4], [39, 6, 4],
  ];
  for (const [c, r, w] of ledges) fillRow(map, r, start + c, start + c + w - 1, 2);

  fillRect(map, start + 10, 7, 2, 2, 1);
  fillRect(map, start + 22, 6, 2, 3, 1);
  fillRect(map, start + 33, 6, 2, 3, 1);

  if (levelId === 4 || levelId === 6) {
    fillRow(map, 2, start + 16, start + 20, 2);
    fillRow(map, 4, start + 37, start + 42, 2);
  }

  if (levelId === 5) {
    fillRow(map, 0, start + 8, start + 15, 1);
    fillRow(map, 1, start + 8, start + 15, 1);
    fillRow(map, 0, start + 28, start + 35, 1);
    fillRow(map, 1, start + 28, start + 35, 1);
  }

  if (levelId === 6) {
    for (let row = 9; row <= 11; row++) fillRow(map, row, start + 28, start + extra - 1, 1);
    fillRect(map, start + 29, 6, 2, 3, 1);
  }

  return map;
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Ruta 1 — Pallet Town",
    tiles: appendEncoreSection(buildLevel1(), 1),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 101, y: 5 },
    enemySpawns: [
      { tileX: 7,  tileY: 8, type: "basic",  patrolRange: 3 },
      { tileX: 19, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 29, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 37, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 45, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 54, tileY: 8, type: "basic",  patrolRange: 2 },
      { tileX: 68, tileY: 8, type: "basic",  patrolRange: 3 },
      { tileX: 82, tileY: 8, type: "jumper", patrolRange: 3 },
      { tileX: 94, tileY: 8, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 5 }, { x: 5, y: 5 }, { x: 7, y: 5 },
      { x: 11, y: 4 }, { x: 12, y: 4 },
      { x: 22, y: 3 }, { x: 24, y: 3 },
      { x: 29, y: 5 }, { x: 30, y: 5 },
      { x: 40, y: 2 }, { x: 42, y: 2 },
      { x: 52, y: 3 }, { x: 53, y: 3 }, { x: 55, y: 3 },
      { x: 64, y: 6 }, { x: 69, y: 4 }, { x: 73, y: 5 },
      { x: 78, y: 3 }, { x: 84, y: 6 }, { x: 91, y: 4 },
      { x: 99, y: 5 },
    ],
    heartTiles: [{ x: 18, y: 6 }, { x: 36, y: 4 }, { x: 88, y: 4 }],
    starTiles:  [{ x: 23, y: 3 }],
    speedTiles: [{ x: 43, y: 1 }, { x: 95, y: 3 }],
    bgTop:           "#87CEEB",
    bgBottom:        "#C8E6A0",
    tileColor:       "#5D8A3C",
    platformColor:   "#8BC34A",
    decorationColor: "#A5D6A7",
  },
  {
    id: 2,
    name: "Monte Luna",
    tiles: appendEncoreSection(buildLevel2(), 2),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 106, y: 5 },
    enemySpawns: [
      { tileX: 4,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 14, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 25, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 30, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 36, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 48, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 55, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 59, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 72, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 86, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 99, tileY: 4, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 6 }, { x: 7, y: 4 }, { x: 13, y: 5 },
      { x: 18, y: 3 }, { x: 27, y: 2 }, { x: 32, y: 4 },
      { x: 40, y: 3 }, { x: 44, y: 5 }, { x: 49, y: 2 },
      { x: 54, y: 4 }, { x: 62, y: 3 },
      { x: 69, y: 6 }, { x: 74, y: 4 }, { x: 79, y: 5 },
      { x: 85, y: 3 }, { x: 94, y: 4 }, { x: 103, y: 5 },
    ],
    heartTiles: [{ x: 22, y: 5 }, { x: 50, y: 5 }, { x: 91, y: 4 }],
    starTiles:  [{ x: 39, y: 2 }],
    speedTiles: [{ x: 7,  y: 3 }, { x: 101, y: 3 }],
    bgTop:           "#1a1a2e",
    bgBottom:        "#16213e",
    tileColor:       "#4A4A6A",
    platformColor:   "#6A6A9A",
    decorationColor: "#9090C0",
  },
  {
    id: 3,
    name: "Islas Espuma",
    tiles: appendEncoreSection(buildLevel3(), 3),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 111, y: 5 },
    enemySpawns: [
      { tileX: 8,  tileY: 4, type: "jumper",  patrolRange: 2 },
      { tileX: 18, tileY: 3, type: "basic",   patrolRange: 2 },
      { tileX: 27, tileY: 5, type: "jumper",  patrolRange: 3 },
      { tileX: 32, tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 37, tileY: 4, type: "jumper",  patrolRange: 2 },
      { tileX: 46, tileY: 6, type: "basic",   patrolRange: 2 },
      { tileX: 56, tileY: 5, type: "jumper",  patrolRange: 3 },
      { tileX: 60, tileY: 3, type: "shooter", patrolRange: 1 },
      { tileX: 65, tileY: 4, type: "basic",   patrolRange: 2 },
      { tileX: 74, tileY: 6, type: "jumper",  patrolRange: 2 },
      { tileX: 86, tileY: 4, type: "basic",   patrolRange: 2 },
      { tileX: 101, tileY: 5, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3,  y: 6 }, { x: 8,  y: 4 }, { x: 14, y: 6 },
      { x: 18, y: 3 }, { x: 23, y: 5 }, { x: 27, y: 2 },
      { x: 32, y: 6 }, { x: 39, y: 4 }, { x: 43, y: 5 },
      { x: 49, y: 6 }, { x: 55, y: 2 }, { x: 60, y: 6 },
      { x: 65, y: 3 },
      { x: 73, y: 6 }, { x: 78, y: 4 }, { x: 83, y: 5 },
      { x: 89, y: 3 }, { x: 96, y: 6 }, { x: 105, y: 4 },
    ],
    heartTiles: [{ x: 23, y: 2 }, { x: 54, y: 4 }, { x: 93, y: 4 }],
    starTiles:  [{ x: 45, y: 3 }],
    speedTiles: [{ x: 14, y: 3 }, { x: 108, y: 3 }],
    bgTop:           "#001f3f",
    bgBottom:        "#003366",
    tileColor:       "#B0D4E8",
    platformColor:   "#D0ECFF",
    decorationColor: "#E8F8FF",
  },
  {
    id: 4,
    name: "Acantilado Eléctrico",
    tiles: appendEncoreSection(buildLevel4(), 4),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 113, y: 5 },
    enemySpawns: [
      { tileX: 4,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 15, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 20, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 28, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 33, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 43, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 50, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 57, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 62, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 78, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 91, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 106, tileY: 4, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 6 }, { x: 6, y: 4 }, { x: 11, y: 5 },
      { x: 15, y: 3 }, { x: 23, y: 2 }, { x: 30, y: 4 },
      { x: 37, y: 6 }, { x: 44, y: 5 }, { x: 46, y: 1 },
      { x: 50, y: 4 }, { x: 59, y: 2 }, { x: 65, y: 4 },
      { x: 76, y: 6 }, { x: 81, y: 4 }, { x: 88, y: 5 },
      { x: 96, y: 1 }, { x: 104, y: 3 }, { x: 111, y: 5 },
    ],
    heartTiles: [{ x: 18, y: 3 }, { x: 53, y: 4 }, { x: 98, y: 4 }],
    starTiles:  [{ x: 45, y: 1 }],
    speedTiles: [{ x: 23, y: 2 }, { x: 86, y: 4 }],
    bgTop:           "#080E1E",
    bgBottom:        "#101828",
    tileColor:       "#2C3854",
    platformColor:   "#445070",
    decorationColor: "#6680AA",
  },
  {
    id: 5,
    name: "Templo Maldito",
    tiles: appendEncoreSection(buildLevel5(), 5),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 116, y: 5 },
    enemySpawns: [
      { tileX: 6,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 13, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 23, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 28, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 35, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 45, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 50, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 57, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 67, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 82, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 94, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 109, tileY: 8, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 4, y: 4 }, { x: 6, y: 8 }, { x: 14, y: 3 },
      { x: 23, y: 2 }, { x: 34, y: 4 }, { x: 36, y: 2 },
      { x: 45, y: 3 }, { x: 47, y: 5 }, { x: 57, y: 3 },
      { x: 60, y: 2 }, { x: 67, y: 4 }, { x: 71, y: 7 },
      { x: 80, y: 6 }, { x: 85, y: 4 }, { x: 91, y: 5 },
      { x: 99, y: 3 }, { x: 107, y: 4 }, { x: 114, y: 5 },
    ],
    heartTiles: [{ x: 15, y: 3 }, { x: 55, y: 3 }, { x: 103, y: 4 }],
    starTiles:  [{ x: 35, y: 2 }],
    speedTiles: [{ x: 58, y: 2 }, { x: 89, y: 4 }],
    bgTop:           "#140800",
    bgBottom:        "#261200",
    tileColor:       "#5C3010",
    platformColor:   "#7A4A1E",
    decorationColor: "#B87830",
  },
  {
    id: 6,
    name: "Cima Volcánica",
    tiles: appendEncoreSection(buildLevel6(), 6),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 126, y: 5 },
    bossSpawn: { tileX: 112, tileY: 8 },
    enemySpawns: [
      { tileX: 4,  tileY: 6, type: "basic",   patrolRange: 2 },
      { tileX: 12, tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 18, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 25, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 32, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 38, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 44, tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 49, tileY: 8, type: "jumper",  patrolRange: 2 },
      { tileX: 72, tileY: 8, type: "basic",   patrolRange: 3 },
      { tileX: 86, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 99, tileY: 4, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 6 }, { x: 7, y: 4 }, { x: 12, y: 4 },
      { x: 17, y: 5 }, { x: 22, y: 6 }, { x: 28, y: 2 },
      { x: 33, y: 6 }, { x: 39, y: 5 }, { x: 44, y: 5 },
      { x: 49, y: 4 }, { x: 56, y: 7 }, { x: 62, y: 7 },
      { x: 72, y: 6 }, { x: 79, y: 4 }, { x: 86, y: 5 },
      { x: 94, y: 3 }, { x: 102, y: 4 }, { x: 118, y: 7 },
    ],
    heartTiles: [{ x: 16, y: 3 }, { x: 46, y: 2 }, { x: 96, y: 4 }],
    starTiles:  [{ x: 29, y: 1 }],
    speedTiles: [{ x: 50, y: 3 }, { x: 103, y: 3 }],
    bgTop:           "#120000",
    bgBottom:        "#300000",
    tileColor:       "#6B1010",
    platformColor:   "#9B2020",
    decorationColor: "#D03030",
  },
];
