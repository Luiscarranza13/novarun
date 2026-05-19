export type CollectibleType = "coin" | "heart";

export class Collectible {
  x: number;
  y: number;
  width  = 22;
  height = 22;
  type:      CollectibleType;
  collected  = false;
  private t  = Math.random() * Math.PI * 2;
  private speed = 0.05 + Math.random() * 0.025;

  constructor(x: number, y: number, type: CollectibleType) {
    this.x = x; this.y = y; this.type = type;
  }

  update() { this.t += this.speed; }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const sx = this.x - cameraX;
    const sy = this.y + Math.sin(this.t) * 4;
    const cx = sx + this.width / 2;
    const cy = sy + this.height / 2;
    const r  = this.width / 2;

    ctx.save();

    if (this.type === "coin") {
      // Pokéball  ───────────────────────────────────────────────────────────
      ctx.shadowBlur  = 10;
      ctx.shadowColor = "#FF4444";

      // Top half (red)
      ctx.fillStyle = "#FF4444";
      ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.fill();
      // Bottom half (white)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI); ctx.fill();
      // Center band
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(sx, cy - 2, this.width, 4);
      // Center button
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.20, 0, Math.PI * 2); ctx.fill();
      // Outline
      ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    } else {
      // Potion  ─────────────────────────────────────────────────────────────
      ctx.shadowBlur  = 10;
      ctx.shadowColor = "#FF69B4";

      // Bottle body
      ctx.fillStyle = "#FF6688";
      ctx.beginPath();
      ctx.roundRect(sx + r * 0.35, cy - r * 0.2, r * 1.3, r * 1.4, 4);
      ctx.fill();
      // Liquid shine
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.roundRect(sx + r * 0.45, cy - r * 0.1, r * 0.4, r * 0.9, 3);
      ctx.fill();
      // Bottle neck
      ctx.fillStyle = "#CC4466";
      ctx.fillRect(sx + r * 0.6, cy - r * 0.7, r * 0.8, r * 0.5);
      // Cap
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(sx + r * 0.5, cy - r * 1.0, r, r * 0.35);
      // P label
      ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${r * 0.9}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("P", cx + 1, cy + r * 0.4);
    }

    ctx.restore();
  }
}
