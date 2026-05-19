import { TileType } from "@/types/game";

export interface CollisionResult {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
}

/**
 * Resolves AABB movement against a tile map.
 * Handles solid tiles (type 1) and one-way platforms (type 2).
 * Movement is separated into horizontal then vertical passes
 * to avoid corner-catching artifacts.
 */
export function resolveCollisions(
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
  vy: number,
  tiles: TileType[][],
  TILE_SIZE: number
): CollisionResult {
  let nx = x + vx;
  let ny = y + vy;
  let resolvedVx = vx;
  let resolvedVy = vy;
  let onGround = false;

  const rows = tiles.length;
  const cols = tiles[0]?.length ?? 0;

  const tileAt = (col: number, row: number): TileType => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return 0;
    return tiles[row][col];
  };

  // ── Horizontal pass ──────────────────────────────────────────────────────
  if (vx !== 0) {
    const yTop = Math.floor(y / TILE_SIZE);
    const yBot = Math.floor((y + h - 1) / TILE_SIZE);

    if (vx > 0) {
      const xEdge = Math.floor((nx + w - 1) / TILE_SIZE);
      for (let row = yTop; row <= yBot; row++) {
        if (tileAt(xEdge, row) === 1) {
          nx = xEdge * TILE_SIZE - w;
          resolvedVx = 0;
          break;
        }
      }
    } else {
      const xEdge = Math.floor(nx / TILE_SIZE);
      for (let row = yTop; row <= yBot; row++) {
        if (tileAt(xEdge, row) === 1) {
          nx = (xEdge + 1) * TILE_SIZE;
          resolvedVx = 0;
          break;
        }
      }
    }
  }

  // ── Vertical pass ─────────────────────────────────────────────────────────
  if (vy !== 0) {
    const xLeft  = Math.floor(nx / TILE_SIZE);
    const xRight = Math.floor((nx + w - 1) / TILE_SIZE);

    if (vy > 0) {
      // Falling — check bottom edge
      const yEdge = Math.floor((ny + h - 1) / TILE_SIZE);
      for (let col = xLeft; col <= xRight; col++) {
        const t = tileAt(col, yEdge);
        if (t === 1) {
          ny = yEdge * TILE_SIZE - h;
          resolvedVy = 0;
          onGround = true;
          break;
        }
        // One-way platform: only land when coming from above
        if (t === 2) {
          const platformTop = yEdge * TILE_SIZE;
          // previous bottom was above platform top
          if (y + h <= platformTop + 1) {
            ny = platformTop - h;
            resolvedVy = 0;
            onGround = true;
            break;
          }
        }
      }
    } else {
      // Jumping — check top edge (only solids block upward)
      const yEdge = Math.floor(ny / TILE_SIZE);
      for (let col = xLeft; col <= xRight; col++) {
        if (tileAt(col, yEdge) === 1) {
          ny = (yEdge + 1) * TILE_SIZE;
          resolvedVy = 0;
          break;
        }
      }
    }
  }

  return { x: nx, y: ny, vx: resolvedVx, vy: resolvedVy, onGround };
}

/** AABB overlap test between two bounding boxes */
export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
