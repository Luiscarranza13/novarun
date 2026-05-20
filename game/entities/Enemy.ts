import { TileType } from "@/types/game";
import { resolveCollisions } from "@/game/physics/collision";
import { Projectile } from "./Projectile";
import { drawZubat, drawGeodude, drawKoffing } from "@/game/rendering/sprites";

export type EnemyType = "basic" | "jumper" | "shooter";

export interface DiffMult { hp: number; speed: number; damage: number; }

const GRAVITY    = 0.55;
const MAX_FALL   = 14;

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

  pendingProjectile: Projectile | null = null;

  private jumpCooldown: number;
  private jumpInterval: number;
  private hurtTimer  = 0;
  private deathTimer = 0;
  private animFrame  = 0;
  private shootCooldown = 0;
  private shootInterval: number;
  facingRight = false;

  constructor(
    tileX: number, tileY: number,
    type: EnemyType, patrolRange: number,
    TILE_SIZE: number,
    diff: DiffMult = { hp: 1, speed: 1, damage: 1 }
  ) {
    this.type   = type;
    this.x      = tileX * TILE_SIZE;
    this.y      = tileY * TILE_SIZE - this.height;
    this.damage = (type === "basic" ? 15 : type === "jumper" ? 22 : 10) * diff.damage;
    this.hp = this.maxHp = (type === "basic" ? 30 : type === "jumper" ? 45 : 55) * diff.hp;

    if (type === "shooter") {
      this.vx = 0;  // stands still
      this.shootInterval = 130 + Math.floor(Math.random() * 60);
      this.shootCooldown = Math.floor(Math.random() * this.shootInterval);
    } else {
      this.vx = (type === "basic" ? -1.6 : -1.2) * diff.speed;
      this.shootInterval = 0;
    }

    this.patrolLeft  = (tileX - patrolRange) * TILE_SIZE;
    this.patrolRight = (tileX + patrolRange) * TILE_SIZE;

    this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    this.jumpCooldown = Math.floor(Math.random() * this.jumpInterval);

    const v = _enemyCounter++ % 3;
    this.visual = v === 0 ? "zubat" : v === 1 ? "geodude" : "koffing";
    if (type === "jumper") this.visual = "geodude";
    if (type === "shooter") this.visual = "koffing";
  }

  update(tiles: TileType[][], TILE_SIZE: number, playerX = 0, playerY = 0) {
    if (this.dead) { if (this.deathTimer < 24) this.deathTimer++; return; }
    this.animFrame++;
    if (this.hurtTimer > 0) this.hurtTimer--;
    this.pendingProjectile = null;

    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);

    if (this.type === "jumper") {
      if (this.jumpCooldown <= 0) {
        this.vy = -12;
        this.jumpCooldown = this.jumpInterval;
      } else {
        this.jumpCooldown--;
      }
    }

    if (this.type === "shooter") {
      // Face player
      this.facingRight = playerX > this.x;
      if (this.shootCooldown <= 0) {
        const dir = this.facingRight ? 1 : -1;
        const dy  = (playerY - this.y) / Math.max(1, Math.abs(playerX - this.x));
        this.pendingProjectile = new Projectile({
          x: this.x + (this.facingRight ? this.width : -14),
          y: this.y + this.height / 2 - 7,
          vx: dir * 5,
          vy: Math.max(-3, Math.min(3, dy * 4)),
          type: "rock",
          damage: this.damage,
          color: "#AA7744",
        });
        this.shootCooldown = this.shootInterval;
      } else {
        this.shootCooldown--;
      }
    }

    const res = resolveCollisions(
      this.x, this.y, this.width, this.height,
      this.vx, this.vy, tiles, TILE_SIZE
    );
    this.x = res.x; this.y = res.y; this.vy = res.vy;

    if (this.type !== "shooter") {
      if (this.x <= this.patrolLeft || res.vx === 0) {
        this.vx = Math.abs(this.vx); this.facingRight = true;
      } else if (this.x + this.width >= this.patrolRight) {
        this.vx = -Math.abs(this.vx); this.facingRight = false;
      }
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

    // Shooter: draw with warning glow when about to fire
    if (this.type === "shooter" && this.shootCooldown < 30) {
      ctx.shadowBlur  = 12 + (30 - this.shootCooldown) * 0.5;
      ctx.shadowColor = "#FF8800";
    }

    if (this.visual === "zubat") {
      drawZubat(ctx, sx, sy, this.width, this.height, this.facingRight, this.animFrame, hurt);
    } else if (this.visual === "geodude") {
      drawGeodude(ctx, sx, sy, this.width, this.height, this.animFrame, hurt);
    } else {
      drawKoffing(ctx, sx, sy, this.width, this.height, this.animFrame, hurt);
    }

    ctx.shadowBlur = 0;

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
