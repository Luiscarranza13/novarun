import { TileType } from "@/types/game";
import { resolveCollisions } from "@/game/physics/collision";

export type ProjectileType =
  | "fireball" | "electric" | "rock"
  | "water" | "vine" | "psychic" | "shadow";

interface ProjectileOptions {
  x: number; y: number;
  vx: number; vy: number;
  type: ProjectileType;
  damage: number;
  color: string;
}

export class Projectile {
  x: number; y: number;
  vx: number; vy: number;
  width  = 16;
  height = 16;
  type:   ProjectileType;
  damage: number;
  color:  string;
  active = true;
  life   = 130;
  private frame = 0;

  constructor(opts: ProjectileOptions) {
    Object.assign(this, opts);
    this.x = opts.x; this.y = opts.y;
    this.vx = opts.vx; this.vy = opts.vy;
    this.type = opts.type; this.damage = opts.damage; this.color = opts.color;
    if (opts.type === "shadow" || opts.type === "psychic") {
      this.width = 20; this.height = 20;
    }
  }

  update(tiles: TileType[][], TILE_SIZE: number) {
    if (!this.active) return;
    this.frame++;
    this.life--;
    if (this.life <= 0) { this.active = false; return; }

    const res = resolveCollisions(
      this.x, this.y, this.width, this.height,
      this.vx, this.vy, tiles, TILE_SIZE
    );
    this.x = res.x; this.y = res.y;

    // Deactivate on wall/floor collision (except shadow/psychic which pierce)
    if ((res.vx === 0 || res.onGround) &&
        this.type !== "shadow" && this.type !== "psychic") {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const sx = this.x - cameraX;
    const sy = this.y;
    const cx = sx + this.width / 2;
    const cy = sy + this.height / 2;
    const r  = this.width / 2;
    const spin = this.frame * 0.18;

    ctx.save();
    ctx.shadowBlur  = 14;
    ctx.shadowColor = this.color;

    if (this.type === "fireball") {
      // Flame orb
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.35, "#FFD700");
      g.addColorStop(0.7, "#FF4500");
      g.addColorStop(1, "#CC0000");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // Flicker spikes
      ctx.fillStyle = "#FF8C00";
      for (let i = 0; i < 5; i++) {
        const a = spin + (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.lineTo(cx + Math.cos(a + 0.3) * r * 1.5, cy + Math.sin(a + 0.3) * r * 1.5);
        ctx.lineTo(cx + Math.cos(a + 0.6) * r, cy + Math.sin(a + 0.6) * r);
        ctx.closePath(); ctx.fill();
      }
    } else if (this.type === "electric") {
      // Spinning lightning star
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = spin + (i / 8) * Math.PI * 2;
        const rr = i % 2 === 0 ? r : r * 0.45;
        i === 0
          ? ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
          : ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      // White core
      ctx.fillStyle = "#FFFACD";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === "water") {
      // Blue water droplet
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
      g.addColorStop(0, "#AADDFF"); g.addColorStop(1, "#006699");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath(); ctx.ellipse(cx - r * 0.2, cy - r * 0.2, r * 0.3, r * 0.2, -0.5, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === "vine") {
      // Green twisting vine
      ctx.strokeStyle = "#4CAF50"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx, cy);
      ctx.bezierCurveTo(sx + this.width * 0.3, cy - 6 * Math.sin(spin), sx + this.width * 0.7, cy + 6 * Math.sin(spin), sx + this.width, cy);
      ctx.stroke();
      // Leaf
      ctx.fillStyle = "#2E7D32";
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.8, r * 0.5, spin, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === "psychic") {
      // Purple pulsing orb
      const pulse = 0.8 + Math.sin(this.frame * 0.3) * 0.2;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * pulse);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.4, "#DA70D6");
      g.addColorStop(1, "rgba(147,112,219,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * pulse * 1.5, 0, Math.PI * 2); ctx.fill();
      // Spinning rings
      ctx.strokeStyle = "#9B59B6"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, spin, spin + Math.PI); ctx.stroke();
      ctx.strokeStyle = "#C39BD3";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, spin + Math.PI, spin + Math.PI * 2); ctx.stroke();
    } else if (this.type === "shadow") {
      // Shadowy dark ball
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "#8B6FC4");
      g.addColorStop(0.5, "#4A3580");
      g.addColorStop(1, "rgba(30,10,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2); ctx.fill();
      // Swirling dark streaks
      ctx.strokeStyle = "rgba(200,150,255,0.6)"; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const a0 = spin + (i / 3) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, a0, a0 + Math.PI * 1.1); ctx.stroke();
      }
    } else {
      // Default rock chunk
      ctx.fillStyle = "#A9A9A9";
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin);
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    ctx.restore();
  }
}
