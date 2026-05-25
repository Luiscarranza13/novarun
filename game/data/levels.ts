import { LevelData, TileType } from "@/types/game";

export const TILE_SIZE = 40;

// ─── Tile-map helpers ─────────────────────────────────────────────────────────

function emptyMap(rows: number, cols: number): TileType[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0) as TileType[]);
}

function fillRow(map: TileType[][], row: number, c1: number, c2: number, type: TileType) {
  for (let c = c1; c <= c2; c++)
    if (c >= 0 && c < map[0].length) map[row][c] = type;
}

function fillRect(map: TileType[][], col: number, row: number, w: number, h: number, type: TileType) {
  for (let r = row; r < row + h; r++)
    for (let c = col; c < col + w; c++)
      if (r >= 0 && r < map.length && c >= 0 && c < map[0].length) map[r][c] = type;
}

// ─── Level 1 — Ruta 1 (Pallet Town) · 200 tiles ──────────────────────────────
// Sección 1 (0-59): tutorial suave. Sección 2 (60-119): escalera/gaps.
// Sección 3 (120-199): desafío final con plataformas aéreas y gaps amplios.

function buildLevel1(): TileType[][] {
  const map = emptyMap(12, 200);

  // ── Sección 1 (0–59): tutorial ────────────────────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  12, 1);
    fillRow(map, row, 16, 30, 1);
    fillRow(map, row, 34, 46, 1);
    fillRow(map, row, 50, 59, 1);
  }
  fillRow(map, 6, 3,  7,  2); fillRow(map, 5, 10, 13, 2);
  fillRow(map, 7, 17, 20, 2); fillRow(map, 4, 22, 25, 2);
  fillRow(map, 6, 27, 31, 2); fillRow(map, 5, 35, 38, 2);
  fillRow(map, 3, 40, 43, 2); fillRow(map, 6, 43, 48, 2);
  fillRow(map, 4, 52, 55, 2); fillRow(map, 2, 56, 59, 2);
  fillRect(map, 8,  7, 2, 2, 1); fillRect(map, 24, 6, 2, 3, 1);
  fillRect(map, 37, 6, 2, 3, 1);

  // ── Sección 2 (60–119): escalera ascendente con gaps ─────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 60, 71, 1); fillRow(map, row, 75, 87, 1);
    fillRow(map, row, 91, 103, 1); fillRow(map, row, 107, 119, 1);
  }
  fillRow(map, 7, 63, 67,  2); fillRow(map, 5, 71, 75,  2);
  fillRow(map, 4, 79, 83,  2); fillRow(map, 3, 86, 90,  2);
  fillRow(map, 5, 93, 97,  2); fillRow(map, 2, 101, 106, 2);
  fillRow(map, 4, 109, 113, 2); fillRow(map, 6, 115, 119, 2);
  fillRect(map, 67,  6, 2, 3, 1); fillRect(map, 84, 5, 2, 4, 1);
  fillRect(map, 100, 4, 2, 5, 1);

  // ── Sección 3 (120–199): desafío aéreo final ─────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 120, 131, 1); fillRow(map, row, 135, 146, 1);
    fillRow(map, row, 150, 161, 1); fillRow(map, row, 165, 176, 1);
    fillRow(map, row, 180, 191, 1); fillRow(map, row, 195, 199, 1);
  }
  // Plataformas aéreas que cruzan los gaps (132-134, 147-149, 162-164, 177-179, 192-194)
  fillRow(map, 6, 123, 127, 2); fillRow(map, 4, 132, 136, 2);
  fillRow(map, 7, 138, 142, 2); fillRow(map, 5, 147, 151, 2);
  fillRow(map, 3, 153, 157, 2); fillRow(map, 6, 162, 166, 2);
  fillRow(map, 4, 169, 173, 2); fillRow(map, 7, 177, 181, 2);
  fillRow(map, 5, 183, 187, 2); fillRow(map, 2, 192, 196, 2);
  // Obstáculos sólidos
  fillRect(map, 128, 7, 2, 2, 1); fillRect(map, 144, 6, 2, 3, 1);
  fillRect(map, 160, 7, 2, 2, 1); fillRect(map, 176, 5, 2, 4, 1);
  fillRect(map, 190, 6, 2, 3, 1);

  return map;
}

// ─── Level 2 — Monte Luna · 220 tiles ────────────────────────────────────────
// Sección 1 (0-64): cueva con plataformas zigzag. Sección 2 (65-129): cueva cerrada.
// Sección 3 (130-219): cueva profunda con techo muy bajo y estalactitas largas.

function buildLevel2(): TileType[][] {
  const map = emptyMap(12, 220);

  // ── Sección 1 (0–64) ──────────────────────────────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  7,  1); fillRow(map, row, 11, 19, 1);
    fillRow(map, row, 23, 30, 1); fillRow(map, row, 34, 42, 1);
    fillRow(map, row, 46, 53, 1); fillRow(map, row, 57, 64, 1);
  }
  fillRow(map, 7, 2,  5,  2); fillRow(map, 5, 6,  9,  2);
  fillRow(map, 6, 12, 15, 2); fillRow(map, 4, 17, 20, 2);
  fillRow(map, 6, 21, 24, 2); fillRow(map, 3, 26, 29, 2);
  fillRow(map, 5, 31, 34, 2); fillRow(map, 7, 35, 38, 2);
  fillRow(map, 4, 39, 42, 2); fillRow(map, 6, 43, 46, 2);
  fillRow(map, 3, 48, 51, 2); fillRow(map, 5, 53, 56, 2);
  fillRow(map, 7, 57, 60, 2); fillRow(map, 4, 61, 64, 2);
  fillRect(map, 4,  0, 2, 3, 1); fillRect(map, 14, 0, 2, 4, 1);
  fillRect(map, 27, 0, 2, 3, 1); fillRect(map, 40, 0, 2, 4, 1);
  fillRect(map, 55, 0, 2, 3, 1);
  fillRect(map, 9,  6, 2, 3, 1); fillRect(map, 24, 5, 2, 4, 1);
  fillRect(map, 47, 6, 2, 3, 1);

  // ── Sección 2 (65–129): cueva más cerrada ────────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 65, 74,  1); fillRow(map, row, 78, 88,  1);
    fillRow(map, row, 92, 102, 1); fillRow(map, row, 106, 116, 1);
    fillRow(map, row, 120, 129, 1);
  }
  fillRow(map, 6, 67, 70, 2); fillRow(map, 4, 72, 77,  2);
  fillRow(map, 7, 80, 83, 2); fillRow(map, 3, 86, 91,  2);
  fillRow(map, 5, 94, 98, 2); fillRow(map, 6, 100, 104, 2);
  fillRow(map, 3, 108, 112, 2); fillRow(map, 5, 114, 118, 2);
  fillRow(map, 7, 120, 124, 2); fillRow(map, 4, 126, 129, 2);
  fillRect(map, 68,  0, 2, 4, 1); fillRect(map, 79,  0, 2, 3, 1);
  fillRect(map, 93,  0, 2, 5, 1); fillRect(map, 107, 0, 2, 3, 1);
  fillRect(map, 121, 0, 2, 4, 1);
  fillRect(map, 75,  6, 2, 3, 1); fillRect(map, 103, 5, 2, 4, 1);
  fillRect(map, 117, 6, 2, 3, 1);
  fillRow(map, 2, 82,  90, 1);
  fillRow(map, 2, 110, 118, 1);

  // ── Sección 3 (130–219): cueva profunda, paso estrecho ──────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 130, 139, 1); fillRow(map, row, 143, 152, 1);
    fillRow(map, row, 156, 165, 1); fillRow(map, row, 169, 178, 1);
    fillRow(map, row, 182, 191, 1); fillRow(map, row, 195, 204, 1);
    fillRow(map, row, 208, 219, 1);
  }
  // Plataformas bridgeando gaps (140-142, 153-155, 166-168, 179-181, 192-194, 205-207)
  fillRow(map, 5, 132, 136, 2); fillRow(map, 7, 140, 144, 2);
  fillRow(map, 4, 148, 152, 2); fillRow(map, 6, 154, 158, 2);
  fillRow(map, 3, 163, 167, 2); fillRow(map, 5, 170, 174, 2);
  fillRow(map, 7, 179, 183, 2); fillRow(map, 4, 186, 190, 2);
  fillRow(map, 6, 193, 197, 2); fillRow(map, 3, 202, 206, 2);
  fillRow(map, 5, 210, 214, 2); fillRow(map, 7, 216, 219, 2);
  // Estalactitas muy largas (techo bajo forzado)
  fillRect(map, 133, 0, 2, 6, 1); fillRect(map, 147, 0, 2, 5, 1);
  fillRect(map, 161, 0, 2, 6, 1); fillRect(map, 175, 0, 2, 5, 1);
  fillRect(map, 189, 0, 2, 6, 1); fillRect(map, 203, 0, 2, 5, 1);
  fillRect(map, 215, 0, 2, 6, 1);
  // Techo bajo en zonas intermedias (el jugador DEBE agacharse/saltar bajo)
  fillRow(map, 2, 135, 143, 1); fillRow(map, 2, 157, 165, 1);
  fillRow(map, 2, 183, 191, 1); fillRow(map, 2, 207, 215, 1);
  // Rocas en suelo
  fillRect(map, 141, 7, 2, 2, 1); fillRect(map, 155, 6, 2, 3, 1);
  fillRect(map, 169, 7, 2, 2, 1); fillRect(map, 193, 6, 2, 3, 1);

  return map;
}

// ─── Level 3 — Islas Espuma · 240 tiles ──────────────────────────────────────
// Puro platforming aéreo. Sección 3 (140-239): islas diminutas, fe ciega.

function buildLevel3(): TileType[][] {
  const map = emptyMap(12, 240);

  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,   4,   1);
    fillRow(map, row, 236, 239, 1);
  }

  // ── Sección 1 (0–69): plataformas en zigzag ──────────────────────────────
  const p1: [number, number, number][] = [
    [1,  7, 4], [6,  5, 4], [10, 7, 3], [14, 4, 4], [18, 6, 3],
    [22, 3, 4], [25, 6, 3], [28, 4, 4], [32, 7, 3], [36, 5, 4],
    [38, 3, 4], [42, 6, 3], [45, 4, 4], [49, 7, 3], [53, 5, 4],
    [55, 3, 4], [59, 6, 3], [62, 4, 4], [65, 7, 3], [67, 5, 3],
  ];
  for (const [c, r, w] of p1) fillRow(map, r, c, c + w - 1, 2);
  fillRect(map, 9,  7, 1, 5, 1); fillRect(map, 24, 6, 1, 6, 1);
  fillRect(map, 42, 7, 1, 5, 1); fillRect(map, 60, 6, 1, 6, 1);

  // ── Sección 2 (70–139): islas más pequeñas ───────────────────────────────
  const p2: [number, number, number][] = [
    [70,  7, 3], [74, 5, 3], [78, 7, 3], [82, 4, 3], [85, 6, 3],
    [89, 3, 3],  [93, 7, 2], [96, 5, 3], [100, 3, 3], [104, 6, 2],
    [107, 4, 3], [111, 7, 3], [115, 5, 3], [119, 3, 3], [122, 6, 3],
    [126, 4, 3], [130, 7, 3], [133, 5, 3],
  ];
  for (const [c, r, w] of p2) fillRow(map, r, c, c + w - 1, 2);
  fillRect(map, 76,  7, 1, 5, 1); fillRect(map, 94,  6, 1, 6, 1);
  fillRect(map, 112, 7, 1, 5, 1); fillRect(map, 128, 6, 1, 6, 1);

  // ── Sección 3 (140–239): islas diminutas, solo 2 tiles de ancho ──────────
  const p3: [number, number, number][] = [
    [140, 7, 2], [143, 5, 2], [146, 7, 2], [149, 4, 2], [152, 6, 2],
    [155, 3, 2], [158, 7, 2], [161, 5, 2], [164, 7, 2], [167, 4, 2],
    [170, 6, 2], [173, 3, 2], [176, 7, 2], [179, 5, 2], [182, 7, 2],
    [185, 4, 2], [188, 6, 2], [191, 3, 2], [194, 7, 2], [197, 5, 2],
    [200, 7, 2], [203, 4, 2], [206, 6, 2], [209, 3, 2], [212, 7, 2],
    [215, 5, 2], [218, 7, 2], [221, 4, 2], [224, 6, 2], [227, 3, 2],
    [230, 7, 2], [233, 5, 2],
  ];
  for (const [c, r, w] of p3) fillRow(map, r, c, c + w - 1, 2);
  // Pilares de hielo que bloquean rutas directas
  fillRect(map, 157, 7, 1, 5, 1); fillRect(map, 181, 6, 1, 6, 1);
  fillRect(map, 205, 7, 1, 5, 1); fillRect(map, 229, 6, 1, 6, 1);

  return map;
}

// ─── Level 4 — Acantilado Eléctrico · 250 tiles ──────────────────────────────
// Sección 3 (145–249): torres eléctricas sobre el vacío absoluto.

function buildLevel4(): TileType[][] {
  const map = emptyMap(12, 250);

  // ── Sección 1 (0–71) ──────────────────────────────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  8,  1); fillRow(map, row, 13, 22, 1);
    fillRow(map, row, 27, 36, 1); fillRow(map, row, 41, 52, 1);
    fillRow(map, row, 56, 65, 1); fillRow(map, row, 68, 71, 1);
  }
  fillRow(map, 7, 2,  5,  2); fillRow(map, 5, 5,  8,  2);
  fillRow(map, 6, 10, 13, 2); fillRow(map, 4, 14, 17, 2);
  fillRow(map, 7, 18, 21, 2); fillRow(map, 3, 22, 26, 2);
  fillRow(map, 5, 28, 31, 2); fillRow(map, 7, 33, 36, 2);
  fillRow(map, 4, 37, 40, 2); fillRow(map, 6, 41, 44, 2);
  fillRow(map, 2, 44, 48, 2); fillRow(map, 5, 49, 53, 2);
  fillRow(map, 7, 54, 57, 2); fillRow(map, 3, 58, 62, 2);
  fillRow(map, 5, 63, 67, 2); fillRow(map, 6, 68, 71, 2);
  fillRect(map, 7,  6, 2, 3, 1); fillRect(map, 21, 5, 2, 4, 1);
  fillRect(map, 38, 6, 2, 3, 1); fillRect(map, 53, 5, 2, 4, 1);

  // ── Sección 2 (72–144): solo plataformas, sin suelo ──────────────────────
  fillRow(map, 7, 73, 77,   2); fillRow(map, 5, 79, 83,   2);
  fillRow(map, 3, 85, 89,   2); fillRow(map, 6, 91, 95,   2);
  fillRow(map, 2, 97, 101,  2); fillRow(map, 4, 103, 107, 2);
  fillRow(map, 7, 109, 113, 2); fillRow(map, 5, 115, 119, 2);
  fillRow(map, 3, 121, 125, 2); fillRow(map, 6, 127, 131, 2);
  fillRow(map, 2, 133, 137, 2); fillRow(map, 5, 139, 143, 2);
  fillRect(map, 77, 4, 1, 8, 1); fillRect(map, 95, 3, 1, 9, 1);
  fillRect(map, 113, 4, 1, 8, 1); fillRect(map, 131, 3, 1, 9, 1);
  for (let row = 9; row <= 11; row++) fillRow(map, row, 139, 144, 1);

  // ── Sección 3 (145–249): acantilado infinito, sin suelo ──────────────────
  // Plataformas estrechas de 4 tiles sobre el abismo total
  fillRow(map, 6, 146, 149,  2); fillRow(map, 4, 152, 155,  2);
  fillRow(map, 7, 158, 161,  2); fillRow(map, 3, 164, 167,  2);
  fillRow(map, 5, 170, 173,  2); fillRow(map, 7, 176, 179,  2);
  fillRow(map, 2, 182, 185,  2); fillRow(map, 5, 188, 191,  2);
  fillRow(map, 7, 194, 197,  2); fillRow(map, 3, 200, 203,  2);
  fillRow(map, 6, 206, 209,  2); fillRow(map, 4, 212, 215,  2);
  fillRow(map, 7, 218, 221,  2); fillRow(map, 2, 224, 227,  2);
  fillRow(map, 5, 230, 233,  2); fillRow(map, 7, 236, 239,  2);
  fillRow(map, 3, 242, 245,  2); fillRow(map, 6, 246, 249,  2);
  // Torres eléctricas (pilares sólidos)
  fillRect(map, 155, 4, 1, 8, 1); fillRect(map, 167, 3, 1, 9, 1);
  fillRect(map, 179, 4, 1, 8, 1); fillRect(map, 191, 3, 1, 9, 1);
  fillRect(map, 203, 4, 1, 8, 1); fillRect(map, 215, 3, 1, 9, 1);
  fillRect(map, 227, 4, 1, 8, 1); fillRect(map, 239, 3, 1, 9, 1);
  // Suelo al final para poder pisar antes del encore
  for (let row = 9; row <= 11; row++) fillRow(map, row, 245, 249, 1);

  return map;
}

// ─── Level 5 — Templo Maldito · 260 tiles ────────────────────────────────────
// Suelo continuo. Sección 3 (150–259): pasillo trampa extremo con múltiples techos bajos.

function buildLevel5(): TileType[][] {
  const map = emptyMap(12, 260);

  for (let row = 9; row <= 11; row++) fillRow(map, row, 0, 259, 1);

  // ── Sección 1 (0–74): pilares y plataformas ───────────────────────────────
  fillRect(map, 10, 6, 3, 3, 1); fillRect(map, 20, 5, 3, 4, 1);
  fillRect(map, 30, 4, 3, 5, 1); fillRect(map, 42, 6, 3, 3, 1);
  fillRect(map, 54, 5, 3, 4, 1); fillRect(map, 64, 4, 3, 5, 1);
  fillRow(map, 5, 4,  8,  2); fillRow(map, 4, 13, 17, 2);
  fillRow(map, 3, 22, 26, 2); fillRow(map, 5, 33, 38, 2);
  fillRow(map, 4, 44, 49, 2); fillRow(map, 3, 56, 61, 2);
  fillRow(map, 5, 66, 70, 2);
  fillRow(map, 0, 8,  14, 1); fillRow(map, 1, 8,  14, 1);
  fillRow(map, 0, 25, 32, 1); fillRow(map, 1, 25, 32, 1);
  fillRow(map, 0, 48, 55, 1); fillRow(map, 1, 48, 55, 1);

  // ── Sección 2 (75–149): más pilares y pasillo trampa ─────────────────────
  fillRect(map, 78,  6, 3, 3, 1); fillRect(map, 90,  5, 3, 4, 1);
  fillRect(map, 103, 4, 3, 5, 1); fillRect(map, 115, 6, 3, 3, 1);
  fillRect(map, 128, 5, 3, 4, 1); fillRect(map, 140, 4, 3, 5, 1);
  fillRow(map, 5, 72,  76, 2); fillRow(map, 4, 82,  87, 2);
  fillRow(map, 3, 93,  98, 2); fillRow(map, 5, 106, 111, 2);
  fillRow(map, 4, 118, 123, 2); fillRow(map, 3, 131, 136, 2);
  fillRow(map, 5, 143, 148, 2);
  fillRow(map, 0, 75,  82,  1); fillRow(map, 1, 75,  82,  1);
  fillRow(map, 0, 99,  107, 1); fillRow(map, 1, 99,  107, 1);
  fillRow(map, 0, 124, 133, 1); fillRow(map, 1, 124, 133, 1);

  // ── Sección 3 (150–259): gauntlet de trampas extremo ────────────────────
  fillRect(map, 153, 6, 3, 3, 1); fillRect(map, 165, 5, 3, 4, 1);
  fillRect(map, 178, 4, 3, 5, 1); fillRect(map, 192, 6, 3, 3, 1);
  fillRect(map, 205, 5, 3, 4, 1); fillRect(map, 218, 4, 3, 5, 1);
  fillRect(map, 232, 6, 3, 3, 1); fillRect(map, 245, 5, 3, 4, 1);
  fillRow(map, 5, 150, 155, 2); fillRow(map, 4, 168, 173, 2);
  fillRow(map, 3, 182, 187, 2); fillRow(map, 5, 196, 200, 2);
  fillRow(map, 4, 209, 214, 2); fillRow(map, 3, 222, 227, 2);
  fillRow(map, 5, 236, 241, 2); fillRow(map, 4, 249, 254, 2);
  // Trampas de techo muy bajo (múltiples corredores apretados)
  fillRow(map, 0, 155, 163, 1); fillRow(map, 1, 155, 163, 1);
  fillRow(map, 0, 175, 183, 1); fillRow(map, 1, 175, 183, 1);
  fillRow(map, 0, 197, 205, 1); fillRow(map, 1, 197, 205, 1);
  fillRow(map, 0, 220, 228, 1); fillRow(map, 1, 220, 228, 1);
  fillRow(map, 0, 242, 250, 1); fillRow(map, 1, 242, 250, 1);
  // Pasaje final extra difícil
  fillRow(map, 0, 251, 258, 1); fillRow(map, 1, 251, 258, 1);
  fillRow(map, 2, 251, 258, 1);

  return map;
}

// ─── Level 6 — Cima Volcánica (Boss) · 280 tiles ─────────────────────────────
// Aproximación volcánica extensa (0-199) → arena final gigante (200-279).

function buildLevel6(): TileType[][] {
  const map = emptyMap(12, 280);

  // ── Aproximación volcánica 1 (0–109) ─────────────────────────────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 0,  10, 1); fillRow(map, row, 14, 24, 1);
    fillRow(map, row, 28, 40, 1); fillRow(map, row, 44, 56, 1);
    fillRow(map, row, 60, 70, 1); fillRow(map, row, 74, 84, 1);
    fillRow(map, row, 88, 98, 1); fillRow(map, row, 102, 109, 1);
  }
  fillRow(map, 7, 2,  5,  2); fillRow(map, 5, 6,  9,  2);
  fillRow(map, 6, 11, 14, 2); fillRow(map, 4, 16, 20, 2);
  fillRow(map, 7, 22, 25, 2); fillRow(map, 5, 27, 30, 2);
  fillRow(map, 3, 31, 36, 2); fillRow(map, 6, 38, 41, 2);
  fillRow(map, 7, 43, 46, 2); fillRow(map, 5, 48, 52, 2);
  fillRow(map, 4, 54, 57, 2); fillRow(map, 6, 59, 62, 2);
  fillRow(map, 3, 64, 68, 2); fillRow(map, 5, 70, 73, 2);
  fillRow(map, 7, 75, 78, 2); fillRow(map, 4, 80, 84, 2);
  fillRow(map, 6, 86, 90, 2); fillRow(map, 3, 92, 96, 2);
  fillRow(map, 5, 99, 103, 2);
  fillRect(map, 8,  7, 2, 2, 1); fillRect(map, 20, 6, 2, 3, 1);
  fillRect(map, 36, 7, 2, 2, 1); fillRect(map, 52, 6, 2, 3, 1);
  fillRect(map, 68, 7, 2, 2, 1); fillRect(map, 84, 6, 2, 3, 1);
  fillRect(map, 97, 7, 2, 2, 1);

  // ── Aproximación volcánica 2 (110–199): terreno más caótico ──────────────
  for (let row = 9; row <= 11; row++) {
    fillRow(map, row, 110, 119, 1); fillRow(map, row, 123, 133, 1);
    fillRow(map, row, 137, 147, 1); fillRow(map, row, 151, 161, 1);
    fillRow(map, row, 165, 175, 1); fillRow(map, row, 179, 189, 1);
    fillRow(map, row, 193, 199, 1);
  }
  fillRow(map, 6, 111, 115, 2); fillRow(map, 4, 119, 123, 2);
  fillRow(map, 7, 126, 130, 2); fillRow(map, 3, 134, 138, 2);
  fillRow(map, 5, 141, 145, 2); fillRow(map, 7, 149, 153, 2);
  fillRow(map, 4, 157, 161, 2); fillRow(map, 6, 163, 167, 2);
  fillRow(map, 3, 171, 175, 2); fillRow(map, 5, 178, 182, 2);
  fillRow(map, 7, 186, 190, 2); fillRow(map, 4, 193, 197, 2);
  // Rocas volcánicas más densas
  fillRect(map, 117, 7, 2, 2, 1); fillRect(map, 131, 6, 2, 3, 1);
  fillRect(map, 147, 7, 2, 2, 1); fillRect(map, 163, 6, 2, 3, 1);
  fillRect(map, 177, 7, 2, 2, 1); fillRect(map, 193, 6, 2, 3, 1);

  // ── Arena final gigante (200–279): suelo sólido plano ─────────────────────
  for (let row = 9; row <= 11; row++) fillRow(map, row, 200, 279, 1);
  // Pilares de entrada volcánica
  fillRect(map, 200, 5, 2, 4, 1); fillRect(map, 204, 5, 2, 4, 1);
  // Plataformas tácticas dentro de la arena
  fillRow(map, 5, 215, 224, 2);
  fillRow(map, 3, 232, 241, 2);
  fillRow(map, 5, 250, 259, 2);
  fillRow(map, 3, 265, 274, 2);
  // Muros de cobertura
  fillRect(map, 228, 6, 2, 3, 1); fillRect(map, 245, 6, 2, 3, 1);
  fillRect(map, 262, 6, 2, 3, 1);

  return map;
}

// ─── Sección final compartida (encore) ───────────────────────────────────────
// Se añade al final de cada nivel: ~80 tiles de desafío extra + zona de meta.

function appendEncoreSection(map: TileType[][], levelId: number): TileType[][] {
  const start = map[0].length;
  const extra  = levelId === 6 ? 90 : 80;
  for (const row of map) row.push(...Array(extra).fill(0) as TileType[]);

  // Suelo inicial del encore y zona de meta
  if (levelId === 3) {
    for (let row = 9; row <= 11; row++) {
      fillRow(map, row, start, start + 6, 1);
      fillRow(map, row, start + 68, start + extra - 1, 1);
    }
  } else {
    for (let row = 9; row <= 11; row++) {
      fillRow(map, row, start,      start + 9,  1);
      fillRow(map, row, start + 15, start + 27, 1);
      fillRow(map, row, start + 31, start + extra - 1, 1);
    }
  }

  // Plataformas del encore (14 tramos cubriendo ~77 tiles)
  const ledges: [number, number, number][] = [
    [4,  7, 5], [10, 5, 4], [16, 6, 4], [21, 4, 5],
    [27, 7, 4], [32, 5, 5], [38, 3, 4], [43, 6, 5],
    [49, 4, 5], [55, 7, 4], [60, 5, 4], [65, 6, 5],
    [70, 4, 4], [75, 7, 4],
  ];
  for (const [c, r, w] of ledges) fillRow(map, r, start + c, start + c + w - 1, 2);

  // Obstáculos sólidos del encore
  fillRect(map, start + 11, 7, 2, 2, 1);
  fillRect(map, start + 25, 6, 2, 3, 1);
  fillRect(map, start + 39, 5, 2, 4, 1);
  fillRect(map, start + 53, 6, 2, 3, 1);
  fillRect(map, start + 67, 5, 2, 4, 1);

  // Variantes por nivel
  if (levelId === 2) {
    fillRect(map, start + 6,  0, 2, 3, 1);
    fillRect(map, start + 22, 0, 2, 4, 1);
    fillRect(map, start + 44, 0, 2, 3, 1);
    fillRect(map, start + 62, 0, 2, 4, 1);
  }
  if (levelId === 4 || levelId === 6) {
    fillRow(map, 2, start + 18, start + 23, 2);
    fillRow(map, 4, start + 40, start + 46, 2);
    fillRow(map, 2, start + 58, start + 64, 2);
  }
  if (levelId === 5) {
    fillRow(map, 0, start + 9,  start + 16, 1);
    fillRow(map, 1, start + 9,  start + 16, 1);
    fillRow(map, 0, start + 30, start + 38, 1);
    fillRow(map, 1, start + 30, start + 38, 1);
    fillRow(map, 0, start + 55, start + 63, 1);
    fillRow(map, 1, start + 55, start + 63, 1);
  }
  if (levelId === 6) {
    for (let row = 9; row <= 11; row++) fillRow(map, row, start + 30, start + extra - 1, 1);
    fillRect(map, start + 31, 6, 2, 3, 1);
    fillRow(map, 5, start + 40, start + 47, 2);
    fillRow(map, 3, start + 54, start + 61, 2);
    fillRow(map, 5, start + 68, start + 75, 2);
  }

  return map;
}

// ─── Level registry ───────────────────────────────────────────────────────────

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Ruta 1 — Pallet Town",
    tiles: appendEncoreSection(buildLevel1(), 1),
    playerStartTile: { x: 1, y: 7 },
    goalTile: { x: 276, y: 5 },
    enemySpawns: [
      { tileX: 7,   tileY: 8, type: "basic",   patrolRange: 3 },
      { tileX: 19,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 29,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 37,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 45,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 54,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 66,  tileY: 8, type: "basic",   patrolRange: 3 },
      { tileX: 77,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 85,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 95,  tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 107, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 116, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 125, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 135, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 145, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 154, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 165, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 175, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 185, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 218, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 240, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 258, tileY: 8, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3,  y: 5 }, { x: 5,  y: 5 }, { x: 7,  y: 5 },
      { x: 11, y: 4 }, { x: 22, y: 3 }, { x: 24, y: 3 },
      { x: 29, y: 5 }, { x: 40, y: 2 }, { x: 42, y: 2 },
      { x: 52, y: 3 }, { x: 64, y: 6 }, { x: 73, y: 5 },
      { x: 80, y: 3 }, { x: 87, y: 2 }, { x: 95, y: 4 },
      { x: 101, y: 1 }, { x: 108, y: 5 }, { x: 115, y: 3 },
      { x: 123, y: 6 }, { x: 132, y: 4 }, { x: 140, y: 5 },
      { x: 148, y: 3 }, { x: 157, y: 6 }, { x: 165, y: 4 },
      { x: 173, y: 5 }, { x: 183, y: 3 }, { x: 195, y: 6 },
      { x: 218, y: 4 }, { x: 230, y: 5 }, { x: 245, y: 3 },
      { x: 260, y: 6 }, { x: 270, y: 4 },
    ],
    heartTiles: [
      { x: 18, y: 6 }, { x: 36, y: 4 },
      { x: 88, y: 4 }, { x: 150, y: 4 },
      { x: 220, y: 4 },
    ],
    starTiles:  [{ x: 23, y: 3 }, { x: 102, y: 1 }, { x: 190, y: 3 }],
    speedTiles: [{ x: 43, y: 1 }, { x: 120, y: 3 }, { x: 170, y: 3 }, { x: 250, y: 3 }],
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
    goalTile: { x: 296, y: 5 },
    enemySpawns: [
      { tileX: 4,   tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 14,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 25,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 30,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 36,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 48,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 55,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 59,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 70,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 79,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 88,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 96,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 104, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 115, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 125, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 135, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 145, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 155, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 165, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 175, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 185, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 197, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 210, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 255, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 275, tileY: 8, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 6 }, { x: 7, y: 4 }, { x: 13, y: 5 },
      { x: 18, y: 3 }, { x: 27, y: 2 }, { x: 32, y: 4 },
      { x: 40, y: 3 }, { x: 44, y: 5 }, { x: 49, y: 2 },
      { x: 54, y: 4 }, { x: 62, y: 3 }, { x: 69, y: 6 },
      { x: 74, y: 4 }, { x: 82, y: 5 }, { x: 90, y: 3 },
      { x: 97, y: 2 }, { x: 106, y: 4 }, { x: 114, y: 3 },
      { x: 120, y: 5 }, { x: 130, y: 5 }, { x: 140, y: 3 },
      { x: 150, y: 6 }, { x: 160, y: 4 }, { x: 170, y: 5 },
      { x: 180, y: 3 }, { x: 190, y: 6 }, { x: 200, y: 4 },
      { x: 212, y: 5 }, { x: 256, y: 4 }, { x: 270, y: 5 },
      { x: 285, y: 3 },
    ],
    heartTiles: [
      { x: 22, y: 5 }, { x: 50, y: 5 },
      { x: 91, y: 4 }, { x: 153, y: 4 },
      { x: 230, y: 4 },
    ],
    starTiles:  [{ x: 39, y: 2 }, { x: 110, y: 2 }, { x: 200, y: 2 }],
    speedTiles: [{ x: 7, y: 3 }, { x: 83, y: 3 }, { x: 165, y: 3 }, { x: 260, y: 3 }],
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
    goalTile: { x: 316, y: 5 },
    enemySpawns: [
      { tileX: 8,   tileY: 4, type: "jumper",  patrolRange: 2 },
      { tileX: 18,  tileY: 3, type: "basic",   patrolRange: 2 },
      { tileX: 27,  tileY: 5, type: "jumper",  patrolRange: 3 },
      { tileX: 32,  tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 37,  tileY: 4, type: "jumper",  patrolRange: 2 },
      { tileX: 46,  tileY: 6, type: "basic",   patrolRange: 2 },
      { tileX: 56,  tileY: 5, type: "jumper",  patrolRange: 3 },
      { tileX: 60,  tileY: 3, type: "shooter", patrolRange: 1 },
      { tileX: 65,  tileY: 4, type: "basic",   patrolRange: 2 },
      { tileX: 74,  tileY: 6, type: "jumper",  patrolRange: 2 },
      { tileX: 83,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 92,  tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 100, tileY: 3, type: "basic",   patrolRange: 2 },
      { tileX: 110, tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 120, tileY: 4, type: "jumper",  patrolRange: 2 },
      { tileX: 130, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 143, tileY: 6, type: "jumper",  patrolRange: 2 },
      { tileX: 155, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 168, tileY: 6, type: "jumper",  patrolRange: 2 },
      { tileX: 180, tileY: 4, type: "basic",   patrolRange: 2 },
      { tileX: 195, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 210, tileY: 6, type: "jumper",  patrolRange: 2 },
      { tileX: 228, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 270, tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 295, tileY: 4, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 3, y: 6 },   { x: 8, y: 4 },   { x: 14, y: 6 },
      { x: 18, y: 3 },  { x: 23, y: 5 },  { x: 27, y: 2 },
      { x: 32, y: 6 },  { x: 39, y: 4 },  { x: 49, y: 6 },
      { x: 55, y: 2 },  { x: 65, y: 3 },  { x: 73, y: 6 },
      { x: 80, y: 4 },  { x: 93, y: 3 },  { x: 108, y: 4 },
      { x: 122, y: 6 }, { x: 130, y: 3 }, { x: 142, y: 5 },
      { x: 152, y: 3 }, { x: 162, y: 6 }, { x: 172, y: 4 },
      { x: 182, y: 5 }, { x: 192, y: 3 }, { x: 203, y: 6 },
      { x: 213, y: 4 }, { x: 222, y: 5 }, { x: 233, y: 3 },
      { x: 270, y: 4 }, { x: 285, y: 5 }, { x: 300, y: 3 },
    ],
    heartTiles: [
      { x: 23, y: 2 },  { x: 54, y: 4 },
      { x: 105, y: 4 }, { x: 175, y: 4 },
      { x: 240, y: 4 },
    ],
    starTiles:  [{ x: 45, y: 3 }, { x: 116, y: 2 }, { x: 210, y: 2 }],
    speedTiles: [{ x: 14, y: 3 }, { x: 85, y: 3 }, { x: 175, y: 3 }, { x: 275, y: 3 }],
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
    goalTile: { x: 326, y: 5 },
    enemySpawns: [
      { tileX: 4,   tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 15,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 20,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 28,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 33,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 43,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 50,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 57,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 62,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 75,  tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 83,  tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 92,  tileY: 5, type: "basic",   patrolRange: 2 },
      { tileX: 100, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 110, tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 120, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 133, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 148, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 162, tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 176, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 190, tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 205, tileY: 5, type: "shooter", patrolRange: 1 },
      { tileX: 220, tileY: 5, type: "basic",   patrolRange: 2 },
      { tileX: 235, tileY: 5, type: "jumper",  patrolRange: 3 },
      { tileX: 278, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 310, tileY: 8, type: "jumper",  patrolRange: 3 },
    ],
    coinTiles: [
      { x: 3, y: 6 },   { x: 6, y: 4 },   { x: 15, y: 3 },
      { x: 23, y: 2 },  { x: 37, y: 6 },  { x: 46, y: 1 },
      { x: 59, y: 2 },  { x: 73, y: 6 },  { x: 86, y: 5 },
      { x: 95, y: 2 },  { x: 111, y: 3 }, { x: 127, y: 1 },
      { x: 141, y: 5 }, { x: 152, y: 2 }, { x: 164, y: 4 },
      { x: 176, y: 5 }, { x: 188, y: 3 }, { x: 200, y: 5 },
      { x: 213, y: 2 }, { x: 225, y: 4 }, { x: 237, y: 6 },
      { x: 278, y: 4 }, { x: 293, y: 5 }, { x: 308, y: 3 },
      { x: 320, y: 5 },
    ],
    heartTiles: [
      { x: 18, y: 3 }, { x: 53, y: 4 },
      { x: 113, y: 4 }, { x: 180, y: 4 },
      { x: 250, y: 4 },
    ],
    starTiles:  [{ x: 45, y: 1 }, { x: 128, y: 1 }, { x: 224, y: 1 }],
    speedTiles: [{ x: 23, y: 2 }, { x: 86, y: 4 }, { x: 165, y: 3 }, { x: 290, y: 3 }],
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
    goalTile: { x: 336, y: 5 },
    enemySpawns: [
      { tileX: 6,   tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 13,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 23,  tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 28,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 35,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 45,  tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 50,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 57,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 67,  tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 80,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 91,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 102, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 113, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 124, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 135, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 146, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 158, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 170, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 183, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 196, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 208, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 220, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 233, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 248, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 293, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 315, tileY: 8, type: "shooter", patrolRange: 1 },
    ],
    coinTiles: [
      { x: 4, y: 4 },   { x: 14, y: 3 }, { x: 23, y: 2 },
      { x: 34, y: 4 },  { x: 45, y: 3 }, { x: 57, y: 3 },
      { x: 67, y: 4 },  { x: 80, y: 6 }, { x: 91, y: 5 },
      { x: 107, y: 4 }, { x: 123, y: 5 }, { x: 139, y: 4 },
      { x: 155, y: 5 }, { x: 169, y: 3 }, { x: 182, y: 4 },
      { x: 197, y: 2 }, { x: 211, y: 5 }, { x: 224, y: 3 },
      { x: 237, y: 4 }, { x: 252, y: 2 }, { x: 265, y: 5 },
      { x: 295, y: 5 }, { x: 310, y: 3 }, { x: 325, y: 4 },
    ],
    heartTiles: [
      { x: 15, y: 3 }, { x: 55, y: 3 },
      { x: 118, y: 4 }, { x: 185, y: 4 },
      { x: 255, y: 4 },
    ],
    starTiles:  [{ x: 35, y: 2 }, { x: 130, y: 2 }, { x: 230, y: 2 }],
    speedTiles: [{ x: 58, y: 2 }, { x: 100, y: 4 }, { x: 190, y: 4 }, { x: 305, y: 3 }],
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
    goalTile: { x: 366, y: 5 },
    bossSpawn: { tileX: 265, tileY: 8 },
    enemySpawns: [
      { tileX: 4,   tileY: 6, type: "basic",   patrolRange: 2 },
      { tileX: 12,  tileY: 5, type: "jumper",  patrolRange: 2 },
      { tileX: 18,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 25,  tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 32,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 44,  tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 56,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 63,  tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 70,  tileY: 8, type: "jumper",  patrolRange: 2 },
      { tileX: 78,  tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 85,  tileY: 6, type: "shooter", patrolRange: 1 },
      { tileX: 93,  tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 100, tileY: 4, type: "shooter", patrolRange: 1 },
      { tileX: 113, tileY: 8, type: "jumper",  patrolRange: 2 },
      { tileX: 125, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 137, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 149, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 161, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 173, tileY: 8, type: "basic",   patrolRange: 2 },
      { tileX: 185, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 197, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 210, tileY: 8, type: "basic",   patrolRange: 3 },
      { tileX: 225, tileY: 8, type: "jumper",  patrolRange: 3 },
      { tileX: 240, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 255, tileY: 8, type: "jumper",  patrolRange: 2 },
      { tileX: 335, tileY: 8, type: "shooter", patrolRange: 1 },
      { tileX: 350, tileY: 8, type: "jumper",  patrolRange: 3 },
    ],
    coinTiles: [
      { x: 3, y: 6 },   { x: 7, y: 4 },   { x: 17, y: 5 },
      { x: 28, y: 2 },  { x: 39, y: 5 },  { x: 49, y: 4 },
      { x: 57, y: 7 },  { x: 70, y: 5 },  { x: 84, y: 4 },
      { x: 98, y: 3 },  { x: 115, y: 7 }, { x: 130, y: 5 },
      { x: 146, y: 3 }, { x: 160, y: 5 }, { x: 175, y: 4 },
      { x: 188, y: 5 }, { x: 200, y: 7 }, { x: 215, y: 7 },
      { x: 230, y: 5 }, { x: 245, y: 7 }, { x: 258, y: 4 },
      { x: 270, y: 5 }, { x: 280, y: 7 }, { x: 295, y: 4 },
      { x: 335, y: 7 }, { x: 350, y: 5 }, { x: 358, y: 4 },
    ],
    heartTiles: [
      { x: 16, y: 3 }, { x: 46, y: 2 },
      { x: 120, y: 4 }, { x: 190, y: 4 },
      { x: 255, y: 4 },
    ],
    starTiles:  [{ x: 29, y: 1 }, { x: 99, y: 2 }, { x: 215, y: 2 }],
    speedTiles: [{ x: 50, y: 3 }, { x: 140, y: 3 }, { x: 220, y: 3 }, { x: 340, y: 3 }],
    bgTop:           "#120000",
    bgBottom:        "#300000",
    tileColor:       "#6B1010",
    platformColor:   "#9B2020",
    decorationColor: "#D03030",
  },
];
