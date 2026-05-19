import { TileType } from "@/types/game";
import { resolveCollisions } from "@/game/physics/collision";
import { drawZubat, drawGeodude, drawKoffing } from "@/game/rendering/sprites";

export type EnemyType = "basic" | "jumper";

const GRAVITY    = 0.55;
const MAX_FALL   = 14;

// Visual type assigned based on spawn sequence for variety
let _enemyCounter = 0;
type EnemyVisual = "zubat" | "geodude" | "koffing";

export class Enemy {
  x: number;
  y: number;
  width  = 34;
  height = 34;
  vx: number;
  vy = 0;
  hp: number;
  maxHp: number;
  damage: number;
  dead = false;

  type: EnemyType;
  visual: EnemyVisual;

  patrolLeft:  number;
  patrolRight: number;

  private jumpCooldown: number;
  private jumpInterval: number;
  private hurtTimer  = 0;
  private deathTimer = 0;
  private animFrame  = 0;
  facingRight = false;

  constructor(
    tileX: number, tileY: number,
    type: EnemyType, patrolRange: number,
    TILE_SIZE: number
  ) {
    this.type   = type;
    this.x      = tileX * TILE_SIZE;
    this.y      = tileY * TILE_SIZE - this.height;
    this.vx     = type === "basic" ? -1.6 : -1.2;
    this.damage = type === "basic" ? 15 : 22;
    this.hp = this.maxHp = type === "basic" ? 30 : 45;

    this.patrolLeft  = (tileX - patrolRange) * TILE_SIZE;
    this.patrolRight = (tileX + patrolRange) * TILE_SIZE;

    this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    this.jumpCooldown = Math.floor(Math.random() * this.jumpInterval);

    // Assign visual type in rotation
    const v = _enemyCounter++ % 3;
    this.visual = v === 0 ? "zubat" : v === 1 ? "geodude" : "koffing";
    // Jumpers are always geodude (bouncy rock)
    if (type === "jumper") this.visual = "geodude";
  }

  update(tiles: TileType[][], TILE_SIZE: number) {
    if (this.dead) { if (this.deathTimer < 24) this.deathTimer++; return; }
    this.animFrame++;
    if (this.hurtTimer > 0) this.hurtTimer--;

    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);

    if (this.type === "jumper") {
      if (this.jumpCooldown <= 0) {
        this.vy = -12;
        this.jumpCooldown = this.jumpInterval;
      } else {
        this.jumpCooldown--;
      }
    }

    const res = resolveCollisions(
      this.x, this.y, this.width, this.height,
      this.vx, this.vy, tiles, TILE_SIZE
    );
    this.x = res.x; this.y = res.y; this.vy = res.vy;

    // Patrol reversal
    if (this.x <= this.patrolLeft || res.vx === 0) {
      this.vx = Math.abs(this.vx); this.facingRight = true;
    } else if (this.x + this.width >= this.patrolRight) {
      this.vx = -Math.abs(this.vx); this.facingRight = false;
    }
  }

  takeDamage(amount: number) {
    if (this.dead) return;
    this.hp -= amount;
    this.hurtTimer = 10;
    if (this.hp <= 0) { this.dead = true; this.hp = 0; this.deathTimer = 0; }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const sx = this.x - cameraX;
    const sy = this.y;

    if (this.dead) {
      const alpha = Math.max(0, 1 - this.deathTimer / 24);
      ctx.globalAlpha = alpha;
    }

    const hurt = this.hurtTimer > 0;

    if (this.visual === "zubat") {
      drawZubat(ctx, sx, sy, this.width, this.height, this.facingRight, this.animFrame, hurt);
    } else if (this.visual === "geodude") {
      drawGeodude(ctx, sx, sy, this.width, this.height, this.animFrame, hurt);
    } else {
      drawKoffing(ctx, sx, sy, this.width, this.height, this.animFrame, hurt);
    }

    // HP bar
    if (!this.dead && this.hp < this.maxHp) {
      const bw = this.width - 4;
      ctx.fillStyle = "#330000";
      ctx.fillRect(sx + 2, sy - 9, bw, 5);
      ctx.fillStyle = "#FF2222";
      ctx.fillRect(sx + 2, sy - 9, bw * (this.hp / this.maxHp), 5);
    }

    if (this.dead) ctx.globalAlpha = 1;
  }
}
