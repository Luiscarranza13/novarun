import { TileType } from "@/types/game";
import { resolveCollisions } from "@/game/physics/collision";
import { Projectile } from "./Projectile";

const GRAVITY  = 0.55;
const MAX_FALL = 14;

type AiState = "idle" | "telegraph" | "charge" | "shoot";

export class Boss {
  x: number;
  y: number;
  readonly width  = 80;
  readonly height = 76;
  vx = 0;
  vy = 0;
  hp: number;
  maxHp: number;
  damage = 40;
  dead   = false;
  phase  = 1;   // 1 | 2 | 3 — updated each frame

  pendingProjectiles: Projectile[] = [];
  facingRight = true;

  private hurtTimer  = 0;
  private deathTimer = 0;
  private animFrame  = 0;

  private aiState: AiState = "idle";
  private aiTimer   = 90;
  private chargeVx  = 0;

  private arenaLeft:  number;
  private arenaRight: number;

  constructor(tileX: number, tileY: number, TILE_SIZE: number) {
    this.x         = tileX * TILE_SIZE - this.width / 2;
    this.y         = tileY * TILE_SIZE - this.height;
    this.hp        = this.maxHp = 600;
    this.arenaLeft  = Math.max(0, (tileX - 16) * TILE_SIZE);
    this.arenaRight = (tileX + 6) * TILE_SIZE;
  }

  get hurtFlash() { return this.hurtTimer > 0; }

  update(tiles: TileType[][], TILE_SIZE: number, playerX: number, playerY: number) {
    if (this.dead) {
      if (this.deathTimer < 90) this.deathTimer++;
      return;
    }

    this.animFrame++;
    if (this.hurtTimer > 0) this.hurtTimer--;
    this.pendingProjectiles = [];

    const hpPct  = this.hp / this.maxHp;
    this.phase   = hpPct > 0.67 ? 1 : hpPct > 0.33 ? 2 : 3;
    const speed  = 7 + (this.phase - 1) * 2;     // 7 / 9 / 11
    const idleMs = 80 - (this.phase - 1) * 18;   // 80 / 62 / 44

    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);

    this.aiTimer--;
    switch (this.aiState) {
      case "idle":
        this.vx *= 0.85;
        this.facingRight = playerX > this.x + this.width / 2;
        if (this.aiTimer <= 0) {
          const shootProb = this.phase === 1 ? 0 : this.phase === 2 ? 0.55 : 0.70;
          if (Math.random() < shootProb) {
            this.aiState = "telegraph";
            this.aiTimer = 28;
          } else {
            this.aiState = "telegraph";
            this.aiTimer = 32;
          }
          this._nextAction = Math.random() < (this.phase === 1 ? 0 : this.phase === 2 ? 0.55 : 0.70) ? "shoot" : "charge";
        }
        break;

      case "telegraph":
        this.vx *= 0.9;
        if (this.aiTimer <= 0) {
          if (this._nextAction === "shoot") {
            this._fireSpread(playerX, playerY);
            this.aiState = "shoot";
            this.aiTimer = 45;
          } else {
            const dir = playerX > this.x ? 1 : -1;
            this.chargeVx = dir * speed;
            this.facingRight = dir > 0;
            this.aiState = "charge";
            this.aiTimer = 55 - (this.phase - 1) * 8;
          }
        }
        break;

      case "charge":
        this.vx = this.chargeVx;
        if (this.aiTimer <= 0 ||
            this.x <= this.arenaLeft ||
            this.x + this.width >= this.arenaRight) {
          this.vx = 0;
          this.aiState = "idle";
          this.aiTimer = idleMs + Math.floor(Math.random() * 30);
        }
        break;

      case "shoot":
        this.vx *= 0.85;
        if (this.aiTimer <= 0) {
          this.aiState = "idle";
          this.aiTimer = idleMs + Math.floor(Math.random() * 25);
        }
        break;
    }

    if (this.x < this.arenaLeft)              { this.x = this.arenaLeft;              this.vx = 0; }
    if (this.x + this.width > this.arenaRight) { this.x = this.arenaRight - this.width; this.vx = 0; }

    const res = resolveCollisions(
      this.x, this.y, this.width, this.height,
      this.vx, this.vy, tiles, TILE_SIZE
    );
    this.x = res.x; this.y = res.y; this.vy = res.vy;
  }

  private _nextAction: "charge" | "shoot" = "charge";

  private _fireSpread(playerX: number, playerY: number) {
    const count  = this.phase === 3 ? 5 : 3;
    const spread = this.phase === 3 ? Math.PI / 3.5 : Math.PI / 5;
    const speed  = 6.5;
    const cx     = this.x + (this.facingRight ? this.width + 6 : -16);
    const cy     = this.y + this.height * 0.38;
    const dx     = playerX - cx;
    const dy     = playerY - cy;
    const base   = Math.atan2(dy, dx);
    const col    = this.phase === 3 ? "#FF2222" : this.phase === 2 ? "#FF8844" : "#8844FF";

    for (let i = 0; i < count; i++) {
      const angle = base + (i - Math.floor(count / 2)) * (spread / Math.max(count - 1, 1));
      this.pendingProjectiles.push(new Projectile({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: "psychic",
        damage: this.damage * 0.55,
        color: col,
      }));
    }
  }

  takeDamage(amount: number) {
    if (this.dead || this.hurtTimer > 6) return;
    this.hp -= amount;
    this.hurtTimer = 12;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; this.deathTimer = 0; }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const sx = Math.floor(this.x - cameraX);
    const sy = Math.floor(this.y);
    const W  = this.width;
    const H  = this.height;
    const t  = this.animFrame;

    if (this.dead) {
      ctx.globalAlpha = Math.max(0, 1 - this.deathTimer / 90);
    }

    const hurt = this.hurtFlash;
    const aura = this.phase === 1 ? "#5566FF" : this.phase === 2 ? "#FF8822" : "#FF2233";
    const body = this.phase === 1 ? "#1C1840" : this.phase === 2 ? "#2A1808" : "#280808";

    ctx.save();
    if (hurt) ctx.filter = "brightness(8) saturate(0)";

    // Outer aura pulse
    const pulseR = 24 + Math.sin(t * 0.14) * 7;
    const auG = ctx.createRadialGradient(sx + W * 0.5, sy + H * 0.52, 0, sx + W * 0.5, sy + H * 0.52, pulseR + W * 0.5);
    auG.addColorStop(0, aura + "44");
    auG.addColorStop(1, "transparent");
    ctx.fillStyle = auG;
    ctx.beginPath();
    ctx.ellipse(sx + W * 0.5, sy + H * 0.52, W * 0.52 + pulseR * 0.3, H * 0.52 + pulseR * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur  = 18 + Math.sin(t * 0.12) * 6;
    ctx.shadowColor = aura;

    // Legs
    const legSwing = this.aiState === "charge" ? Math.sin(t * 0.35) * 10 : 0;
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(sx + W * 0.38, sy + H * 0.88, 11, 8, -0.2 + legSwing * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + W * 0.62, sy + H * 0.88, 11, 8,  0.2 - legSwing * 0.04, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(sx + W * 0.50, sy + H * 0.62, W * 0.40, H * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest gem
    const gemColor = this.phase === 1 ? "#88AAFF" : this.phase === 2 ? "#FFAA44" : "#FF5555";
    ctx.fillStyle = gemColor;
    ctx.beginPath();
    const gx = sx + W * 0.50; const gy = sy + H * 0.58; const gr = 7;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
      i === 0 ? ctx.moveTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr)
              : ctx.lineTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;

    // Head
    ctx.shadowBlur  = 10;
    ctx.shadowColor = aura;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(sx + W * 0.50, sy + H * 0.30, W * 0.30, H * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Horns
    ctx.fillStyle = aura;
    const hornDir = this.facingRight ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(sx + W * 0.38, sy + H * 0.10);
    ctx.lineTo(sx + W * 0.28 - hornDir * 6, sy - 14);
    ctx.lineTo(sx + W * 0.44, sy + H * 0.08);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + W * 0.62, sy + H * 0.10);
    ctx.lineTo(sx + W * 0.72 + hornDir * 6, sy - 14);
    ctx.lineTo(sx + W * 0.56, sy + H * 0.08);
    ctx.closePath(); ctx.fill();

    // Eyes
    ctx.shadowBlur  = 14;
    ctx.shadowColor = aura;
    ctx.fillStyle   = aura;
    const eyeDir = this.facingRight ? 1 : -1;
    ctx.beginPath(); ctx.ellipse(sx + W * 0.38, sy + H * 0.26, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + W * 0.62, sy + H * 0.26, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle  = "#FFFFFF";
    ctx.beginPath(); ctx.ellipse(sx + W * 0.38 + eyeDir * 2.5, sy + H * 0.26, 3, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + W * 0.62 + eyeDir * 2.5, sy + H * 0.26, 3, 2.2, 0, 0, Math.PI * 2); ctx.fill();

    // Arms
    const armSwing = this.aiState === "charge" ? Math.sin(t * 0.35) * 8 : this.aiState === "shoot" ? Math.sin(t * 0.25) * 15 : 0;
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(sx + W * 0.18, sy + H * 0.52 + armSwing, 10, 18, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + W * 0.82, sy + H * 0.52 - armSwing, 10, 18, -0.3, 0, Math.PI * 2); ctx.fill();

    // Tail
    ctx.strokeStyle = aura;
    ctx.lineWidth   = 6;
    ctx.lineCap     = "round";
    const tailX = sx + W * (this.facingRight ? 0.18 : 0.82);
    const tailOff = this.facingRight ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(tailX, sy + H * 0.70);
    ctx.quadraticCurveTo(tailX + tailOff * 22, sy + H * 0.44, tailX + tailOff * 12, sy + H * 0.18);
    ctx.stroke();

    // Telegraph flash
    if (this.aiState === "telegraph") {
      const fa = (Math.sin(t * 0.6) * 0.5 + 0.5) * 0.45;
      const rgb = this.phase === 1 ? "100,120,255" : this.phase === 2 ? "255,150,60" : "255,80,80";
      ctx.fillStyle = `rgba(${rgb},${fa})`;
      ctx.beginPath();
      ctx.ellipse(sx + W * 0.5, sy + H * 0.5, W * 0.56, H * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    if (this.dead) ctx.globalAlpha = 1;

    // HP bar (above boss)
    if (!this.dead) {
      const bw = W + 20; const bx = sx - 10; const by = sy - 20;
      ctx.fillStyle = "#1A0000";
      ctx.fillRect(bx, by, bw, 10);
      const barColor = this.phase === 1 ? "#5566FF" : this.phase === 2 ? "#FF8822" : "#FF2233";
      ctx.fillStyle = barColor;
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), 10);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(bx + bw * 0.67 - 1, by, 2, 10);
      ctx.fillRect(bx + bw * 0.33 - 1, by, 2, 10);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EL MAESTRO", sx + W * 0.5, by - 3);
    }
  }
}
