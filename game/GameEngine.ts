import { CreatureData, GameState, HUDState, LevelStats } from "@/types/game";
import { LEVELS, TILE_SIZE } from "@/game/data/levels";
import { Player } from "@/game/entities/Player";
import { Enemy } from "@/game/entities/Enemy";
import { Collectible } from "@/game/entities/Collectible";
import { Projectile } from "@/game/entities/Projectile";
import { aabbOverlap } from "@/game/physics/collision";
import { sfx } from "@/game/SoundEngine";
import { saveHighScore } from "@/game/saveSystem";

export interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onHUDUpdate:   (hud: HUDState) => void;
  onStatsReady?: (stats: LevelStats) => void;
}

// ─── Particle ──────────────────────────────────────────────────────────────────

class Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  life: number; maxLife: number;
  size: number;

  constructor(x: number, y: number, color: string, speed = 4, size?: number) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = -(Math.random() * speed * 0.8 + 0.5);
    this.color   = color;
    this.maxLife = 20 + Math.floor(Math.random() * 20);
    this.life    = this.maxLife;
    this.size    = size ?? (3 + Math.random() * 4);
  }

  update() { this.x += this.vx; this.y += this.vy; this.vy += 0.22; this.life--; }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const a = this.life / this.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.size * a, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ─── Score popup ───────────────────────────────────────────────────────────────

class ScorePopup {
  x: number; y: number; text: string;
  life = 50; alpha = 1; color: string;

  constructor(x: number, y: number, text: string, color = "#FFD700") {
    this.x = x; this.y = y; this.text = text; this.color = color;
  }

  update() { this.y -= 0.8; this.life--; this.alpha = this.life / 50; }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.save();
    ctx.globalAlpha  = this.alpha;
    ctx.font         = "bold 14px 'Segoe UI', sans-serif";
    ctx.textAlign    = "center";
    ctx.strokeStyle  = "rgba(0,0,0,0.6)"; ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x - cameraX, this.y);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.x - cameraX, this.y);
    ctx.restore();
  }
}

// ─── GameEngine ────────────────────────────────────────────────────────────────

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx:    CanvasRenderingContext2D;
  private animId = 0;

  private halted     = false;
  private paused     = false;
  private frameCount = 0;

  // Level stats tracking
  private levelStartTime  = 0;
  private enemiesKilled   = 0;
  private coinsCollected  = 0;

  // Enemy projectiles (separate from player projectiles)
  private enemyProjectiles: Projectile[] = [];

  // Gamepad state for edge detection
  private gpPrev = { jump: false, attack: false, special: false };

  private player:       Player | null = null;
  private enemies:      Enemy[] = [];
  private collectibles: Collectible[] = [];
  private projectiles:  Projectile[] = [];
  private particles:    Particle[] = [];
  private popups:       ScorePopup[] = [];

  private cameraX    = 0;
  private levelIndex = 0;
  private score      = 0;

  private shakeAmount = 0;
  private shakeX = 0; private shakeY = 0;

  private levelAnnounceTimer = 0;

  private pulseJump    = false;
  private pulseAttack  = false;
  private pulseSpecial = false;
  private heldKeys     = new Set<string>();

  private callbacks: GameCallbacks;
  private creature:  CreatureData | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext("2d")!;
    this.callbacks = callbacks;
  }

  // ── Public ────────────────────────────────────────────────────────────────────

  startLevel(creature: CreatureData, levelIndex: number) {
    this.halted          = false;
    this.paused          = false;
    this.frameCount      = 0;
    this.creature        = creature;
    this.levelIndex      = levelIndex;
    this.score           = 0;
    this.cameraX         = 0;
    this.particles       = [];
    this.popups          = [];
    this.shakeAmount     = 0;
    this.levelAnnounceTimer = 130;
    this.levelStartTime  = Date.now();
    this.enemiesKilled   = 0;
    this.coinsCollected  = 0;
    this.enemyProjectiles = [];

    const level = LEVELS[levelIndex];
    if (!level) return;

    this.player = new Player(
      level.playerStartTile.x, level.playerStartTile.y, creature, TILE_SIZE
    );

    this.enemies = level.enemySpawns.map(
      (s) => new Enemy(s.tileX, s.tileY, s.type, s.patrolRange, TILE_SIZE)
    );

    this.collectibles = [
      ...level.coinTiles.map(
        (t) => new Collectible(t.x * TILE_SIZE + 9, t.y * TILE_SIZE + 9, "coin")
      ),
      ...level.heartTiles.map(
        (t) => new Collectible(t.x * TILE_SIZE + 9, t.y * TILE_SIZE + 9, "heart")
      ),
      ...(level.starTiles ?? []).map(
        (t) => new Collectible(t.x * TILE_SIZE + 9, t.y * TILE_SIZE + 9, "star")
      ),
      ...(level.speedTiles ?? []).map(
        (t) => new Collectible(t.x * TILE_SIZE + 9, t.y * TILE_SIZE + 9, "speed")
      ),
    ];

    this.projectiles = [];

    cancelAnimationFrame(this.animId);
    this.loop();
  }

  handleKeyDown(key: string) {
    this.heldKeys.add(key);
    const k = key.toLowerCase();
    if (["z", " ", "arrowup", "w"].includes(k)) this.pulseJump    = true;
    if (["j", "v"].includes(k))                  this.pulseAttack  = true;
    if (["k", "b"].includes(k))                  this.pulseSpecial = true;
  }

  handleKeyUp(key: string) { this.heldKeys.delete(key); }

  // New method to handle voice commands with internal timing
  handleVoiceAction(key: string, durationMs: number) {
    console.log(`[Engine] Comando de voz recibido: ${key} por ${durationMs}ms`);
    this.handleKeyDown(key);
    window.setTimeout(() => {
      this.handleKeyUp(key);
      console.log(`[Engine] Liberando comando: ${key}`);
    }, durationMs);
  }

  triggerSpecial() {
    this.pulseSpecial = true;
  }

  pause() {
    if (this.halted || this.paused) return;
    this.paused = true;
    cancelAnimationFrame(this.animId);
    this.callbacks.onStateChange("paused");
  }

  resume() {
    if (this.halted || !this.paused) return;
    this.paused = false;
    this.callbacks.onStateChange("playing");
    this.loop();
  }

  stop() {
    this.halted = true;
    this.paused = false;
    cancelAnimationFrame(this.animId);
    sfx.stopBGM();
  }

  destroy() { this.stop(); }

  // ── Game loop ─────────────────────────────────────────────────────────────────

  private loop() {
    if (this.halted) return;   // FIX: bail out if stopped
    this.update();
    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private consumePulses() {
    this.pulseJump = this.pulseAttack = this.pulseSpecial = false;
  }

  // ── Update ────────────────────────────────────────────────────────────────────

  private pollGamepad() {
    const pads = navigator.getGamepads?.() ?? [];
    for (const pad of pads) {
      if (!pad) continue;
      const left    = pad.buttons[14]?.pressed || pad.axes[0] < -0.4;
      const right   = pad.buttons[15]?.pressed || pad.axes[0] > 0.4;
      const jump    = pad.buttons[0]?.pressed ?? false;
      const attack  = pad.buttons[2]?.pressed ?? false;
      const special = pad.buttons[1]?.pressed ?? false;

      if (left)  this.heldKeys.add("ArrowLeft");  else this.heldKeys.delete("ArrowLeft");
      if (right) this.heldKeys.add("ArrowRight"); else this.heldKeys.delete("ArrowRight");
      if (jump)  this.heldKeys.add("ArrowUp");    else this.heldKeys.delete("ArrowUp");

      if (jump   && !this.gpPrev.jump)    this.pulseJump    = true;
      if (attack && !this.gpPrev.attack)  this.pulseAttack  = true;
      if (special && !this.gpPrev.special) this.pulseSpecial = true;

      this.gpPrev = { jump, attack, special };
      break;
    }
  }

  private update() {
    const p     = this.player;
    const level = LEVELS[this.levelIndex];
    if (!p || !level) return;

    this.frameCount++;
    if (this.levelAnnounceTimer > 0) this.levelAnnounceTimer--;

    this.shakeAmount = 0;
    this.shakeX = this.shakeY = 0;

    this.pollGamepad();

    // Input
    const h = this.heldKeys;
    p.update(
      {
        left:     h.has("ArrowLeft")  || h.has("a") || h.has("A"),
        right:    h.has("ArrowRight") || h.has("d") || h.has("D"),
        jump:     this.pulseJump,
        jumpHeld: h.has("ArrowUp") || h.has("w") || h.has("W") || h.has("z") || h.has("Z") || h.has(" "),
        attack:   this.pulseAttack,
        special:  this.pulseSpecial,
      },
      level.tiles, TILE_SIZE
    );
    this.consumePulses();

    // Camera smooth follow
    const target = p.x - this.canvas.width / 2 + p.width / 2;
    const maxCam = level.tiles[0].length * TILE_SIZE - this.canvas.width;
    this.cameraX += (Math.max(0, Math.min(target, maxCam)) - this.cameraX) * 0.12;

    // Pending projectile from player
    if (p.pendingProjectile) {
      this.projectiles.push(p.pendingProjectile);
      p.pendingProjectile = null;
    }

    // Projectiles
    this.projectiles = this.projectiles.filter((proj) => {
      proj.update(level.tiles, TILE_SIZE);
      return proj.active;
    });

    // Enemies
    for (const enemy of this.enemies) {
      enemy.update(level.tiles, TILE_SIZE, p.x, p.y);
      // Collect shooter projectiles
      if (enemy.pendingProjectile) {
        this.enemyProjectiles.push(enemy.pendingProjectile);
        enemy.pendingProjectile = null;
      }
      if (enemy.dead) continue;

      // Melee attack box
      if (p.state === "attacking") {
        const dir  = p.facingRight ? 1 : -1;
        const atkX = p.x + (dir > 0 ? p.width : -28);
        if (aabbOverlap(atkX, p.y + 4, 28, p.height - 8,
                        enemy.x, enemy.y, enemy.width, enemy.height)) {
          if (!enemy.dead) {
            enemy.takeDamage(p.creature.stats.attack);
            this.burst(enemy.x + 16, enemy.y + 16, "#FF8C00", 6);
            if (enemy.dead) this.enemiesKilled++;
          }
        }
      }

      // Projectile hits enemy
      for (const proj of this.projectiles) {
        if (!proj.active) continue;
        if (aabbOverlap(proj.x, proj.y, proj.width, proj.height,
                        enemy.x, enemy.y, enemy.width, enemy.height)) {
          enemy.takeDamage(proj.damage);
          this.burst(proj.x, proj.y, proj.color, 7);
          if (proj.type !== "shadow" && proj.type !== "psychic") proj.active = false;
          if (enemy.dead) {
            this.score += 200;
            this.enemiesKilled++;
            this.addPopup(enemy.x + 16, enemy.y, "+200", "#FFD700");
          }
        }
      }

      // Player–enemy contact
      if (!p.invincible) {
        if (aabbOverlap(p.x + 4, p.y + 4, p.width - 8, p.height - 8,
                        enemy.x, enemy.y, enemy.width, enemy.height)) {
          const stomp = p.vy > 1 && p.y + p.height < enemy.y + 14;
          if (stomp) {
            enemy.takeDamage(999);
            if (enemy.dead) this.enemiesKilled++;
            p.vy = -9;
            this.burst(enemy.x + 16, enemy.y, "#FFD700", 10);
            this.score += 300;
            this.addPopup(enemy.x + 16, enemy.y - 10, "+300", "#FFD700");
            sfx.stomp();
          } else {
            p.takeDamage(enemy.damage);
            this.shake(8);
            this.burst(p.x + 14, p.y + 14, "#FFFFFF", 8);
          }
        }
      }
    }

    // Mewtwo quake: area damage on psychic dash
    if (this.creature?.id === "mewtwo" && p.state === "special") {
      for (const enemy of this.enemies) {
        if (!enemy.dead && Math.abs(enemy.x - p.x) < this.canvas.width * 0.6) {
          enemy.takeDamage(this.creature.stats.attack * 1.5);
        }
      }
    }

    // Enemy projectiles — update and check vs player
    this.enemyProjectiles = this.enemyProjectiles.filter((proj) => {
      proj.update(level.tiles, TILE_SIZE);
      if (!proj.active) return false;
      if (!p.invincible && aabbOverlap(proj.x, proj.y, proj.width, proj.height,
                                       p.x + 4, p.y + 4, p.width - 8, p.height - 8)) {
        p.takeDamage(proj.damage);
        this.shake(6);
        this.burst(proj.x, proj.y, proj.color, 5);
        return false;
      }
      return true;
    });

    // Collectibles
    for (const col of this.collectibles) {
      if (col.collected) continue;
      col.update();
      if (aabbOverlap(p.x, p.y, p.width, p.height,
                      col.x, col.y, col.width, col.height)) {
        col.collected = true;
        if (col.type === "coin") {
          this.score += 10;
          this.coinsCollected++;
          this.burst(col.x + 11, col.y, "#FF4444", 6);
          this.addPopup(col.x + 11, col.y, "+10", "#FF6666");
          sfx.coin();
        } else if (col.type === "heart") {
          p.heal(25);
          this.burst(col.x + 11, col.y, "#FF69B4", 10);
          this.addPopup(col.x + 11, col.y, "+25 HP", "#FF88AA");
          sfx.heart();
        } else if (col.type === "star") {
          p.activateStar();
          this.burst(col.x + 11, col.y, "#FFD700", 16);
          this.addPopup(col.x + 11, col.y, "ESTRELLA!", "#FFD700");
        } else if (col.type === "speed") {
          p.activateSpeed();
          this.burst(col.x + 11, col.y, "#00FFEE", 12);
          this.addPopup(col.x + 11, col.y, "RAPIDO!", "#00FFEE");
        }
      }
    }

    // Passive creature aura effects
    this.spawnPassiveEffects(p);

    const goalPoleX = level.goalTile.x * TILE_SIZE + TILE_SIZE / 2;
    if (p.x + p.width >= goalPoleX - 16) {
      this.halted = true;
      cancelAnimationFrame(this.animId);
      sfx.stopBGM();
      sfx.victory();
      const isHighScore = saveHighScore(this.levelIndex, this.score);
      this.callbacks.onStatsReady?.({
        timeSeconds:    Math.floor((Date.now() - this.levelStartTime) / 1000),
        enemiesKilled:  this.enemiesKilled,
        coinsCollected: this.coinsCollected,
        isHighScore,
      });
      this.callbacks.onStateChange("victory");
      return;
    }

    if (p.hp <= 0 || p.y > this.canvas.height + 120) {
      this.halted = true;
      cancelAnimationFrame(this.animId);
      sfx.stopBGM();
      sfx.gameover();
      this.shake(16);
      this.callbacks.onStateChange("game-over");
      return;
    }

    // Particles & popups
    this.particles = this.particles.filter((pt) => { pt.update(); return pt.life > 0; });
    this.popups    = this.popups.filter((pp) => { pp.update(); return pp.life > 0; });

    // HUD
    this.callbacks.onHUDUpdate({
      hp:           p.hp,
      maxHp:        p.maxHp,
      energy:       p.energy,
      maxEnergy:    p.maxEnergy,
      score:        this.score,
      level:        this.levelIndex + 1,
      creatureName: this.creature!.name,
      element:      this.creature!.element,
      colors:       this.creature!.colors,
    });
  }

  // ── Passive creature particle effects ─────────────────────────────────────────

  private spawnPassiveEffects(p: Player) {
    const id = this.creature?.id;
    if (!id) return;
    const fc = this.frameCount;

    switch (id) {
      case "pikachu":
        // Random electric sparks
        if (fc % 10 === 0) {
          for (let i = 0; i < 2; i++) {
            const pt = new Particle(
              p.x + Math.random() * p.width,
              p.y + Math.random() * p.height,
              "#FFD700", 2, 2
            );
            pt.vy = -1.5;
            this.particles.push(pt);
          }
        }
        // Double-jump discharge: damage nearby enemies
        if (p.didDoubleJump) {
          this.burst(p.x + p.width / 2, p.y + p.height / 2, "#FFD700", 14);
          this.addPopup(p.x + p.width / 2, p.y - 8, "⚡ Descarga!", "#FFD700");
          for (const enemy of this.enemies) {
            if (!enemy.dead && Math.abs(enemy.x - p.x) < 110 && Math.abs(enemy.y - p.y) < 110) {
              enemy.takeDamage(this.creature!.stats.attack * 1.2);
            }
          }
          this.shake(4);
        }
        break;

      case "charizard":
        // Fire trail when moving fast
        if (Math.abs(p.vx) > 3 && fc % 3 === 0) {
          const cx = p.facingRight ? p.x : p.x + p.width;
          const pt = new Particle(cx, p.y + p.height * 0.55, "#FF4500", 2.5, 4);
          pt.vy = -1;
          this.particles.push(pt);
        }
        // Ember drips while idle
        if (fc % 20 === 0) {
          this.particles.push(new Particle(p.x + p.width * 0.6, p.y + 4, "#FF6600", 1.5, 2));
        }
        break;

      case "bulbasaur":
        // Leaf spores
        if (fc % 18 === 0) {
          const pt = new Particle(p.x + p.width / 2, p.y + p.height * 0.25, "#4CAF50", 1.5, 3);
          pt.vy = -1.2;
          this.particles.push(pt);
        }
        // Healing glow on low HP
        if (p.hp < p.maxHp * 0.35 && fc % 8 === 0) {
          this.particles.push(new Particle(p.x + Math.random() * p.width, p.y + Math.random() * p.height, "#66BB6A", 1.5, 2));
        }
        break;

      case "squirtle":
        // Bubbles during shield
        if (p.state === "shielded" && fc % 6 === 0) {
          const pt = new Particle(
            p.x + Math.random() * p.width,
            p.y + p.height * 0.8,
            "#00BFFF", 1.5, 3
          );
          pt.vy = -2;
          this.particles.push(pt);
        }
        // Water drip trail when walking
        if (p.state === "walking" && fc % 14 === 0) {
          this.particles.push(new Particle(p.x + p.width / 2, p.y + p.height - 4, "#4488CC", 1.5, 2));
        }
        break;

      case "mewtwo":
        // Psychic wisps
        if (fc % 8 === 0) {
          for (let i = 0; i < 2; i++) {
            const pt = new Particle(
              p.x + Math.random() * p.width,
              p.y + Math.random() * p.height,
              "#C39BD3", 2, 2.5
            );
            pt.vy = -1;
            this.particles.push(pt);
          }
        }
        // Aura ring burst during special
        if (p.state === "special" && fc % 3 === 0) {
          for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(p.x + p.width / 2, p.y + p.height / 2, "#9B59B6", 5, 4));
          }
        }
        break;

      case "gengar":
        // Shadow wisps trailing off feet
        if (fc % 7 === 0) {
          const pt = new Particle(
            p.x + Math.random() * p.width,
            p.y + p.height * 0.85,
            "#5B2C8D", 2, 3
          );
          pt.vy = -1.2;
          this.particles.push(pt);
        }
        // Ghostly dark smokes
        if (fc % 16 === 0) {
          const pt = new Particle(p.x + p.width / 2, p.y + p.height / 3, "#2C1654", 1.5, 4);
          pt.vy = -0.8;
          this.particles.push(pt);
        }
        break;

      case "eevee":
        // Sparkle trail during dash
        if (p.state === "special" && fc % 2 === 0) {
          for (let i = 0; i < 3; i++) {
            this.particles.push(new Particle(
              p.x + Math.random() * p.width, p.y + Math.random() * p.height,
              "#C8860A", 4, 3
            ));
          }
        }
        // Soft shimmer normally
        if (fc % 22 === 0) {
          this.particles.push(new Particle(p.x + Math.random() * p.width, p.y + 5, "#D4A04A", 1.5, 2));
        }
        break;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  private render() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const level = LEVELS[this.levelIndex];
    const p = this.player;
    if (!level || !p) return;

    // FIX: snap camera to whole pixels for rendering — prevents sub-pixel jitter on sprites
    const camX = Math.floor(this.cameraX);

    ctx.save();
    this.renderBackground(ctx, W, H, level);

    // Tiles — only visible columns
    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const endCol   = Math.min(level.tiles[0].length, startCol + Math.ceil(W / TILE_SIZE) + 3);

    for (let row = 0; row < level.tiles.length; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tile = level.tiles[row][col];
        if (!tile) continue;
        const tx = col * TILE_SIZE - camX;
        const ty = row * TILE_SIZE;
        // Pass whether there's an empty tile directly above for grass blades
        const hasAbove = row > 0 && level.tiles[row - 1][col] !== 0;
        tile === 1
          ? this.drawSolid(ctx, tx, ty, hasAbove, level.id)
          : this.drawPlatform(ctx, tx, ty, level.id);
      }
    }

    // Entities - Use integer coordinates relative to camera
    for (const col of this.collectibles) if (!col.collected) col.draw(ctx, camX);
    for (const e of this.enemies)        e.draw(ctx, camX);
    for (const proj of this.projectiles)      if (proj.active) proj.draw(ctx, camX);
    for (const proj of this.enemyProjectiles) if (proj.active) proj.draw(ctx, camX);
    for (const pt of this.particles)     pt.draw(ctx, camX);

    this.renderGoal(ctx, level, camX);

    p.draw(ctx, camX);

    for (const pp of this.popups) pp.draw(ctx, camX);

    if (this.levelAnnounceTimer > 0) this.renderAnnounce(ctx, W, H, level.name);

    ctx.restore();
  }

  // ── HD Background rendering ───────────────────────────────────────────────────

  private renderBackground(ctx: CanvasRenderingContext2D, W: number, H: number, level: typeof LEVELS[0]) {
    const t  = Date.now() / 1000;
    const px = Math.round(this.cameraX);  // use rounded value so parallax doesn't sub-pixel jitter

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, level.bgTop);
    bg.addColorStop(1, level.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (level.id === 1) {
      // ─── Route 1: vivid daylight scene ─────────────────────────────────────

      // Sun
      const sunX = (W * 0.82 - px * 0.02 + W * 2) % (W * 2.5);
      ctx.save();
      ctx.shadowBlur = 40; ctx.shadowColor = "rgba(255,220,100,0.8)";
      ctx.fillStyle = "#FFE066";
      ctx.beginPath(); ctx.arc(sunX, 55, 28, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Sun rays
      ctx.strokeStyle = "rgba(255,220,80,0.35)"; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.3;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * 32, 55 + Math.sin(a) * 32);
        ctx.lineTo(sunX + Math.cos(a) * 50, 55 + Math.sin(a) * 50);
        ctx.stroke();
      }
      ctx.restore();

      // Distant mountains — parallax 0.08
      ctx.fillStyle = "rgba(130,180,110,0.40)";
      for (let i = 0; i < 7; i++) {
        const mx = ((i * 210 - px * 0.08) % (W + 250) + W + 250) % (W + 250) - 60;
        const mh = 70 + (i % 3) * 45;
        ctx.beginPath();
        ctx.moveTo(mx, H); ctx.lineTo(mx + 105, H - mh); ctx.lineTo(mx + 210, H); ctx.fill();
      }

      // Mid-range tree silhouettes — parallax 0.18
      ctx.fillStyle = "rgba(60,110,50,0.55)";
      for (let i = 0; i < 9; i++) {
        const tx2 = ((i * 160 - px * 0.18) % (W + 200) + W + 200) % (W + 200) - 40;
        const th  = 60 + (i % 3) * 24;
        const tw  = 36 + (i % 2) * 14;
        // Tree canopy (two ellipses)
        ctx.beginPath();
        ctx.ellipse(tx2 + tw / 2, H - th + 18, tw * 0.5, tw * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(tx2 + tw * 0.75, H - th + 28, tw * 0.38, tw * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trunk
        ctx.fillStyle = "rgba(50,30,10,0.4)";
        ctx.fillRect(tx2 + tw * 0.42, H - th + 42, 6, 30);
        ctx.fillStyle = "rgba(60,110,50,0.55)";
      }

      // Clouds — parallax 0.28
      for (let i = 0; i < 6; i++) {
        const cx2 = ((i * 230 + 40 - px * 0.28) % (W + 260) + W + 260) % (W + 260) - 60;
        const cy2 = 35 + (i % 3) * 28;
        const cr  = 28 + (i % 2) * 14;
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.beginPath();
        ctx.arc(cx2,            cy2,            cr,           0, Math.PI * 2);
        ctx.arc(cx2 + cr * 0.9, cy2 - cr * 0.3, cr * 0.78,   0, Math.PI * 2);
        ctx.arc(cx2 + cr * 1.7, cy2,            cr * 0.88,   0, Math.PI * 2);
        ctx.arc(cx2 + cr * 0.5, cy2 - cr * 0.5, cr * 0.58,   0, Math.PI * 2);
        ctx.fill();
        // Cloud shadow underside
        ctx.fillStyle = "rgba(180,200,220,0.28)";
        ctx.beginPath();
        ctx.ellipse(cx2 + cr * 0.85, cy2 + cr * 0.5, cr * 1.4, cr * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flowers in the grass strip — parallax 0.45
      for (let i = 0; i < 14; i++) {
        const fx = ((i * 85 + 20 - px * 0.45) % (W + 100) + W + 100) % (W + 100) - 20;
        const fy = H - 28 + (i % 3) * 4;
        const fc = ["#FF69B4","#FFDD44","#FF4444","#AA44FF"][i % 4];
        ctx.fillStyle = fc;
        ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
        // Stem
        ctx.strokeStyle = "rgba(60,130,30,0.5)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx, fy + 4); ctx.lineTo(fx, fy + 14); ctx.stroke();
      }

      // Grass horizon strip
      ctx.fillStyle = "rgba(100,170,80,0.22)";
      ctx.fillRect(0, H - 60, W, 60);

    } else if (level.id === 2) {
      // ─── Mt. Moon: deep cave ─────────────────────────────────────────────────

      // Moon/planet visible through crack in ceiling
      const moonX = (W * 0.7 - px * 0.01 + W * 2) % (W * 2.2);
      ctx.save();
      ctx.shadowBlur = 30; ctx.shadowColor = "rgba(180,180,255,0.6)";
      ctx.fillStyle = "#DDE0FF";
      ctx.beginPath(); ctx.arc(moonX, 38, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(100,100,150,0.4)";
      ctx.beginPath(); ctx.ellipse(moonX - 5, 32, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(moonX + 8, 42, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Twinkling stars
      for (let i = 0; i < 50; i++) {
        const sx2 = (i * 137 + 7) % W;
        const sy2 = (i * 97  + 11) % (H * 0.55);
        const sa  = 0.3 + Math.sin(t * 2.2 + i * 0.7) * 0.28;
        const sr  = 0.8 + (i % 3) * 0.5;
        ctx.fillStyle = `rgba(210,215,255,${sa})`;
        ctx.beginPath(); ctx.arc(sx2, sy2, sr, 0, Math.PI * 2); ctx.fill();
      }

      // Deep cave rock formations — parallax 0.07
      ctx.fillStyle = "rgba(40,40,60,0.55)";
      for (let i = 0; i < 9; i++) {
        const rx = ((i * 145 - px * 0.07) % (W + 160) + W + 160) % (W + 160) - 30;
        const rh = 55 + (i % 3) * 35;
        ctx.beginPath();
        ctx.moveTo(rx, 0); ctx.lineTo(rx + 72, rh); ctx.lineTo(rx + 145, 0); ctx.fill();
      }

      // Stalactites (ceiling hangers) — parallax 0.13
      ctx.fillStyle = "rgba(55,55,80,0.7)";
      for (let i = 0; i < 12; i++) {
        const sx2 = ((i * 110 + 20 - px * 0.13) % (W + 130) + W + 130) % (W + 130) - 15;
        const sh  = 35 + (i % 4) * 22;
        ctx.beginPath();
        ctx.moveTo(sx2, 0); ctx.lineTo(sx2 + 14, sh); ctx.lineTo(sx2 + 28, 0); ctx.fill();
      }

      // Glowing crystals — parallax 0.2
      const crystalColors = ["rgba(100,100,220", "rgba(80,200,180", "rgba(200,80,200"];
      for (let i = 0; i < 8; i++) {
        const cx2 = ((i * 175 - px * 0.2 + 35) % (W + 200) + W + 200) % (W + 200) - 35;
        const cy2 = 40 + (i % 4) * 22;
        const pulse = 0.35 + Math.sin(t * 1.8 + i * 0.9) * 0.28;
        const col = crystalColors[i % 3];
        ctx.fillStyle = `${col},${pulse})`;
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = `${col},0.5)`;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + 9, cy2 + 28);
        ctx.lineTo(cx2 + 18, cy2); ctx.lineTo(cx2 + 9, cy2 - 10);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // Glowing mushrooms at ground level — parallax 0.35
      for (let i = 0; i < 8; i++) {
        const mx = ((i * 140 + 50 - px * 0.35) % (W + 160) + W + 160) % (W + 160) - 20;
        const my = H - 55;
        const glow = 0.4 + Math.sin(t * 0.9 + i) * 0.2;
        ctx.save();
        ctx.shadowBlur  = 12; ctx.shadowColor = `rgba(120,255,150,${glow})`;
        ctx.fillStyle   = `rgba(60,200,80,${glow * 0.9})`;
        ctx.beginPath();
        ctx.ellipse(mx, my, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(40,140,60,${glow * 0.7})`;
        ctx.fillRect(mx - 3, my, 6, 16);
        ctx.restore();
      }

    } else if (level.id === 3) {
      // ─── Seafoam Islands: polar sea ─────────────────────────────────────────

      // Aurora borealis bands
      for (let i = 0; i < 4; i++) {
        const ay = H * (0.12 + i * 0.14);
        const aw = 0.055 + Math.sin(t * 0.5 + i * 1.4) * 0.04;
        const ag = ctx.createLinearGradient(0, ay - 40, 0, ay + 40);
        const colors = [
          ["rgba(0,220,180", "rgba(0,180,255"],
          ["rgba(0,255,140", "rgba(120,0,255"],
          ["rgba(0,200,255", "rgba(80,255,200"],
          ["rgba(200,100,255","rgba(0,200,200"],
        ][i];
        ag.addColorStop(0, `${colors[0]},0)`);
        ag.addColorStop(0.5, `${colors[0]},${aw})`);
        ag.addColorStop(1, `${colors[1]},0)`);
        ctx.fillStyle = ag;
        const waveOffset = Math.sin(t * 0.4 + i * 0.8) * 60;
        ctx.save();
        ctx.translate(waveOffset, 0);
        ctx.fillRect(-60, ay - 40, W + 120, 80);
        ctx.restore();
      }

      // Stars
      for (let i = 0; i < 60; i++) {
        const sx2 = (i * 139) % W;
        const sy2 = (i * 83) % (H * 0.65);
        const sa  = 0.2 + Math.sin(t * 1.8 + i) * 0.3;
        const sr  = 0.7 + (i % 4) * 0.4;
        ctx.fillStyle = `rgba(200,220,255,${sa})`;
        ctx.beginPath(); ctx.arc(sx2, sy2, sr, 0, Math.PI * 2); ctx.fill();
      }

      // Distant icebergs — parallax 0.06
      ctx.fillStyle = "rgba(180,220,240,0.30)";
      for (let i = 0; i < 6; i++) {
        const ibx = ((i * 220 - px * 0.06) % (W + 240) + W + 240) % (W + 240) - 40;
        const ibh = 50 + (i % 3) * 30;
        ctx.beginPath();
        ctx.moveTo(ibx, H * 0.78);
        ctx.lineTo(ibx + 50, H * 0.78 - ibh);
        ctx.lineTo(ibx + 110, H * 0.78); ctx.fill();
        // Iceberg sheen
        ctx.fillStyle = "rgba(220,240,255,0.20)";
        ctx.beginPath();
        ctx.moveTo(ibx + 18, H * 0.78);
        ctx.lineTo(ibx + 50, H * 0.78 - ibh * 0.85);
        ctx.lineTo(ibx + 70, H * 0.78); ctx.fill();
        ctx.fillStyle = "rgba(180,220,240,0.30)";
      }

      // Ice shards rising from ground — parallax 0.18
      ctx.fillStyle = "rgba(180,230,255,0.35)";
      for (let i = 0; i < 10; i++) {
        const ix  = ((i * 115 - px * 0.18 + 30) % (W + 130) + W + 130) % (W + 130) - 20;
        const iy  = H * 0.72;
        const ih  = 30 + (i % 4) * 20;
        const iw2 = 14 + (i % 3) * 8;
        ctx.beginPath();
        ctx.moveTo(ix, iy); ctx.lineTo(ix + iw2 / 2, iy - ih); ctx.lineTo(ix + iw2, iy);
        ctx.closePath(); ctx.fill();
        // Shard highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(ix + 2, iy); ctx.lineTo(ix + iw2 * 0.4, iy - ih * 0.8); ctx.lineTo(ix + iw2 * 0.45, iy); ctx.fill();
        ctx.fillStyle = "rgba(180,230,255,0.35)";
      }

      // Water shimmer at horizon
      ctx.fillStyle = "rgba(0,60,120,0.22)";
      ctx.fillRect(0, H - 70, W, 70);
      for (let i = 0; i < 8; i++) {
        const wx = ((i * 130 - px * 0.5) % (W + 140) + W + 140) % (W + 140) - 10;
        const wa = 0.15 + Math.sin(t * 1.2 + i * 0.6) * 0.08;
        ctx.fillStyle = `rgba(100,200,255,${wa})`;
        ctx.fillRect(wx, H - 20, 60, 3);
      }
    }
  }

  // ── HD Tile drawing ───────────────────────────────────────────────────────────

  private drawSolid(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    hasAbove: boolean,
    levelId: number
  ) {
    const T = TILE_SIZE;

    if (levelId === 1) {
      // ─── Route 1: grass/dirt block ────────────────────────────────────────
      // Dirt body
      ctx.fillStyle = "#7B4F1E";
      ctx.fillRect(x, y, T, T);
      // Soil dots/pores
      ctx.fillStyle = "#5C3910";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 4  + i * 8, y + 14, 3, 3);
        ctx.fillRect(x + 8  + i * 7, y + 24, 2, 2);
        ctx.fillRect(x + 5  + i * 8, y + 32, 3, 2);
      }
      // Light soil streaks
      ctx.fillStyle = "rgba(200,150,90,0.14)";
      ctx.fillRect(x + 2, y + 10, T - 4, 2);
      ctx.fillRect(x + 2, y + 22, T - 4, 2);

      if (!hasAbove) {
        // Green grass cap
        ctx.fillStyle = "#48A828";
        ctx.fillRect(x, y, T, 9);
        ctx.fillStyle = "#5CC035";
        ctx.fillRect(x, y, T, 5);
        // Grass blade highlight
        ctx.fillStyle = "#7ADF50";
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(x + 2 + i * 6, y, 2, 4);
        }
        // Grass top highlight
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(x, y, T, 2);
      } else {
        // Covered top bevel
        ctx.fillStyle = "rgba(200,140,80,0.22)";
        ctx.fillRect(x, y, T, 5);
      }
      // Side shadow
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.fillRect(x, y, 3, T);
      ctx.fillStyle = "rgba(0,0,0,0.10)";
      ctx.fillRect(x + T - 3, y, 3, T);
      // Bottom shadow
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.fillRect(x, y + T - 5, T, 5);

    } else if (levelId === 2) {
      // ─── Mt. Moon: dark rock with cracks ─────────────────────────────────
      ctx.fillStyle = "#2E2E44";
      ctx.fillRect(x, y, T, T);
      // Layered rock depth
      ctx.fillStyle = "#252538";
      ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
      // Rough surface texture
      ctx.fillStyle = "#3C3C58";
      ctx.fillRect(x, y, T, 7);
      ctx.fillStyle = "#383852";
      ctx.fillRect(x, y, 6, T);

      // Cracks
      ctx.strokeStyle = "#1A1A28"; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 6,     y + 8);  ctx.lineTo(x + 16,    y + 20);
      ctx.moveTo(x + 22,    y + 4);  ctx.lineTo(x + 32,    y + 16);
      ctx.moveTo(x + T - 9, y + 18); ctx.lineTo(x + T - 3, y + 30);
      ctx.stroke();

      if (!hasAbove) {
        // Glowing rock-top edge
        ctx.fillStyle = "#5A5A80";
        ctx.fillRect(x, y, T, 7);
        ctx.fillStyle = "rgba(140,140,220,0.30)";
        ctx.fillRect(x, y, T, 3);
      }

      // Crystal flecks
      ctx.fillStyle = "rgba(110,110,210,0.45)";
      ctx.fillRect(x + 7,     y + 14, 4, 4);
      ctx.fillRect(x + T - 11, y + 8,  3, 5);
      ctx.fillRect(x + T / 2, y + T - 9, 4, 4);
      // Bioluminescent glow line
      ctx.fillStyle = "rgba(80,80,180,0.18)";
      ctx.fillRect(x, y + T - 5, T, 5);

    } else {
      // ─── Seafoam: ice blocks ─────────────────────────────────────────────
      ctx.fillStyle = "#8DC8E8";
      ctx.fillRect(x, y, T, T);

      // Ice depth gradient
      const iceGrad = ctx.createLinearGradient(x, y, x, y + T);
      iceGrad.addColorStop(0, "rgba(220,245,255,0.45)");
      iceGrad.addColorStop(0.3, "rgba(160,210,240,0.12)");
      iceGrad.addColorStop(1, "rgba(60,140,190,0.35)");
      ctx.fillStyle = iceGrad;
      ctx.fillRect(x, y, T, T);

      if (!hasAbove) {
        // Shiny ice top
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(x, y, T, 5);
        ctx.fillStyle = "rgba(200,240,255,0.35)";
        ctx.fillRect(x, y, T, 10);
      }

      // Frost crack lines
      ctx.strokeStyle = "rgba(255,255,255,0.42)"; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + 3,     y + 4);  ctx.lineTo(x + 11,    y + 13);
      ctx.moveTo(x + 11,    y + 13); ctx.lineTo(x + 22,    y + 9);
      ctx.moveTo(x + 22,    y + 9);  ctx.lineTo(x + 32,    y + 20);
      ctx.moveTo(x + T - 6, y + 5);  ctx.lineTo(x + T - 16, y + 16);
      ctx.stroke();

      // Specular highlight corner
      ctx.fillStyle = "rgba(255,255,255,0.30)";
      ctx.fillRect(x + 2, y + 2, T / 2 - 2, 3);
      ctx.fillRect(x + 2, y + 2, 3, T / 3);

      // Bottom edge shadow
      ctx.fillStyle = "rgba(40,100,150,0.32)";
      ctx.fillRect(x, y + T - 5, T, 5);
    }

    // Tile grid line (very faint)
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(x, y, T, T);
  }

  private drawPlatform(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    levelId: number
  ) {
    const T = TILE_SIZE;

    if (levelId === 1) {
      // Wooden plank platform
      ctx.fillStyle = "#8B6840";
      ctx.beginPath(); ctx.roundRect(x, y, T, 14, [5, 5, 2, 2]); ctx.fill();
      // Wood grain lines
      ctx.strokeStyle = "rgba(50,25,0,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + T * 0.28, y + 2); ctx.lineTo(x + T * 0.28, y + 12);
      ctx.moveTo(x + T * 0.60, y + 2); ctx.lineTo(x + T * 0.60, y + 12);
      ctx.stroke();
      // Mossy green top strip
      ctx.fillStyle = "#5A9E3A";
      ctx.fillRect(x + 2, y, T - 4, 4);
      ctx.fillStyle = "#70C045";
      ctx.fillRect(x + 2, y, T - 4, 2);
      // Nail details
      ctx.fillStyle = "rgba(80,50,20,0.5)";
      ctx.beginPath(); ctx.arc(x + 5, y + 8, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + T - 5, y + 8, 2, 0, Math.PI * 2); ctx.fill();

    } else if (levelId === 2) {
      // Floating rock platform
      ctx.fillStyle = "#484870";
      ctx.beginPath(); ctx.roundRect(x, y, T, 14, [5, 5, 2, 2]); ctx.fill();
      // Rock texture
      ctx.fillStyle = "#5A5A88";
      ctx.beginPath(); ctx.roundRect(x + 2, y + 1, T - 4, 6, [4, 4, 0, 0]); ctx.fill();
      // Glowing blue-purple edge
      ctx.fillStyle = "rgba(130,130,220,0.45)";
      ctx.fillRect(x + 2, y, T - 4, 3);
      ctx.fillStyle = "rgba(180,180,255,0.20)";
      ctx.fillRect(x + 2, y, T - 4, 1);

    } else {
      // Ice slab platform
      ctx.fillStyle = "#A8D8F0";
      ctx.beginPath(); ctx.roundRect(x, y, T, 14, [5, 5, 2, 2]); ctx.fill();
      // Ice gradient
      const ig = ctx.createLinearGradient(x, y, x, y + 14);
      ig.addColorStop(0, "rgba(220,245,255,0.50)");
      ig.addColorStop(1, "rgba(80,160,210,0.20)");
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.roundRect(x, y, T, 14, [5, 5, 2, 2]); ctx.fill();
      // Frost highlights
      ctx.fillStyle = "rgba(255,255,255,0.60)";
      ctx.fillRect(x + 2, y, T - 4, 3);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(x + 2, y, T - 4, 1);
    }

    // Underside shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(x, y + 11, T, 3);
  }

  // ── Animated goal flag ────────────────────────────────────────────────────────

  private renderGoal(ctx: CanvasRenderingContext2D, level: typeof LEVELS[0], camX: number) {
    const gx  = level.goalTile.x * TILE_SIZE - camX;
    const gy  = level.goalTile.y * TILE_SIZE;  // top of the pole
    const t   = Date.now() / 280;
    const T   = TILE_SIZE;
    const poleH = T * 4;                        // 160px pole

    // Glow halo at base
    const baseGrad = ctx.createRadialGradient(gx + T / 2, gy + poleH, 0, gx + T / 2, gy + poleH, 28);
    baseGrad.addColorStop(0, "rgba(255,215,0,0.40)");
    baseGrad.addColorStop(1, "rgba(255,215,0,0.00)");
    ctx.fillStyle = baseGrad;
    ctx.beginPath(); ctx.arc(gx + T / 2, gy + poleH, 28, 0, Math.PI * 2); ctx.fill();

    // Pole shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(gx + T / 2,     gy + 2, 7, poleH);
    // Pole
    ctx.fillStyle = "#C8A96E";
    ctx.fillRect(gx + T / 2 - 3, gy,     6, poleH);
    // Pole highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(gx + T / 2 - 2, gy, 2, poleH);

    // Waving flag
    const wave = Math.sin(t) * 6;
    ctx.fillStyle = "#EE2222";
    ctx.beginPath();
    ctx.moveTo(gx + T / 2 + 3,          gy + 4);
    ctx.quadraticCurveTo(gx + T / 2 + 22 + wave, gy + 14, gx + T / 2 + 3, gy + 28);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(gx + T / 2 + 3,          gy + 4);
    ctx.quadraticCurveTo(gx + T / 2 + 22 + wave, gy + 10, gx + T / 2 + 3, gy + 16);
    ctx.fill();
    // Flag star emblem
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 10px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("★", gx + T / 2 + 8, gy + 22);

    // Glowing star on pole tip
    ctx.save();
    ctx.shadowBlur  = 16;
    ctx.shadowColor = "#FFD700";
    ctx.fillStyle   = "#FFD700";
    const starR  = 8;
    const starCX = gx + T / 2;
    const starCY = gy - 6;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a  = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const a2 = a + Math.PI / 5;
      i === 0
        ? ctx.moveTo(starCX + starR * Math.cos(a),         starCY + starR * Math.sin(a))
        : ctx.lineTo(starCX + starR * Math.cos(a),         starCY + starR * Math.sin(a));
      ctx.lineTo(  starCX + starR * 0.4 * Math.cos(a2),   starCY + starR * 0.4 * Math.sin(a2));
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ── Level announce banner ─────────────────────────────────────────────────────

  private renderAnnounce(ctx: CanvasRenderingContext2D, W: number, H: number, name: string) {
    const prog  = this.levelAnnounceTimer / 130;
    const alpha = Math.min(1, prog * 2) * Math.min(1, (1 - prog) * 4);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${alpha * 0.65})`;
    ctx.fillRect(0, H / 2 - 48, W, 96);
    ctx.font      = `bold 26px 'Segoe UI', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(255,215,0,${alpha})`;
    ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.6})`; ctx.lineWidth = 4;
    ctx.strokeText(`Nivel ${this.levelIndex + 1}: ${name}`, W / 2, H / 2 + 10);
    ctx.fillText( `Nivel ${this.levelIndex + 1}: ${name}`, W / 2, H / 2 + 10);
    ctx.restore();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private burst(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) this.particles.push(new Particle(x, y, color));
  }

  private addPopup(x: number, y: number, text: string, color = "#FFD700") {
    this.popups.push(new ScorePopup(x, y, text, color));
  }

  private shake(amount: number) {
    void amount;
  }
}
