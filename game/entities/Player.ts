import { CreatureData, InputState, TileType } from "@/types/game";
import { resolveCollisions } from "@/game/physics/collision";
import { Projectile } from "./Projectile";
import { SPRITE_MAP, PokemonId } from "@/game/rendering/sprites";
import { sfx } from "@/game/SoundEngine";

const GRAVITY           = 0.55;
const MAX_FALL          = 16;
const ATTACK_DURATION   = 18;
const SPECIAL_COOLDOWN  = 120;
const INVINCIBLE_FRAMES = 80;
const SHIELD_FRAMES     = 180;
const DASH_FRAMES       = 14;
const ENERGY_REGEN      = 0.15;

export type PlayerState =
  | "idle" | "walking" | "jumping" | "falling"
  | "attacking" | "special" | "hurt" | "shielded";

export class Player {
  x: number;
  y: number;
  width  = 32;
  height = 38;
  vx = 0;
  vy = 0;

  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;

  onGround  = false;
  facingRight = true;
  state: PlayerState = "idle";
  animFrame = 0;

  private speed:    number;
  private jumpForce: number;
  private baseAttack: number;
  private canDoubleJump: boolean;
  private hasDoubleJumped = false;

  private attackTimer    = 0;
  private specialTimer   = 0;
  private invincibleTimer = 0;
  private shieldTimer    = 0;
  private dashTimer      = 0;
  private hurtTimer      = 0;

  starTimer   = 0;  // rainbow invincibility power-up
  speedTimer  = 0;  // speed boost power-up

  private prevOnGround = false;

  creature: CreatureData;
  pendingProjectile: Projectile | null = null;
  didDoubleJump = false;   // one-frame flag for GameEngine to read

  constructor(tileX: number, tileY: number, creature: CreatureData, TILE_SIZE: number) {
    this.creature      = creature;
    this.x             = tileX * TILE_SIZE;
    this.y             = tileY * TILE_SIZE - this.height;
    this.hp            = creature.stats.maxHp;
    this.maxHp         = creature.stats.maxHp;
    this.energy        = creature.stats.maxEnergy;
    this.maxEnergy     = creature.stats.maxEnergy;
    this.speed         = creature.stats.speed;
    this.jumpForce     = -creature.stats.jumpForce;
    this.baseAttack    = creature.stats.attack;
    this.canDoubleJump = creature.stats.canDoubleJump;
  }

  get invincible() { return this.invincibleTimer > 0 || this.shieldTimer > 0 || this.starTimer > 0; }

  activateStar() {
    this.starTimer = 300;
    sfx.powerup();
  }

  activateSpeed() {
    this.speedTimer = 240;
    sfx.powerup();
  }

  heal(amount: number) { this.hp = Math.min(this.hp + amount, this.maxHp); }

  takeDamage(amount: number) {
    if (this.invincible) return;
    this.hp -= amount;
    this.hurtTimer      = 14;
    this.invincibleTimer = INVINCIBLE_FRAMES;
    this.state = "hurt";
    this.vy = -5;
    this.vx = this.facingRight ? -3 : 3;
    sfx.damage();
  }

  update(input: InputState, tiles: TileType[][], TILE_SIZE: number) {
    this.animFrame++;
    this.didDoubleJump = false;  // reset each frame — GameEngine reads this
    this.tickTimers();
    this.handleMovement(input);
    this.handleJump(input);
    this.handleAttack(input, TILE_SIZE);
    this.handleSpecial(input, TILE_SIZE);
    this.applyGravity(input);
    this.moveAndCollide(tiles, TILE_SIZE);
    this.updateState();
    this.regenEnergy();
    this.applyPassiveRegen();
  }

  private tickTimers() {
    if (this.attackTimer    > 0) this.attackTimer--;
    if (this.specialTimer   > 0) this.specialTimer--;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (this.shieldTimer    > 0) this.shieldTimer--;
    if (this.dashTimer      > 0) this.dashTimer--;
    if (this.hurtTimer      > 0) this.hurtTimer--;
    if (this.starTimer      > 0) this.starTimer--;
    if (this.speedTimer     > 0) this.speedTimer--;
  }

  private handleMovement(input: InputState) {
    if (this.dashTimer > 0) return;
    const airBoost = (this.creature.id === "gengar" && !this.onGround) ? 1.25 : 1;
    const speedBoost = this.speedTimer > 0 ? 1.65 : 1;
    if (input.left)        { this.vx = -this.speed * airBoost * speedBoost; this.facingRight = false; }
    else if (input.right)  { this.vx =  this.speed * airBoost * speedBoost; this.facingRight = true;  }
    else                   { this.vx *= 0.75; if (Math.abs(this.vx) < 0.2) this.vx = 0; }
  }

  private handleJump(input: InputState) {
    if (!input.jump) return;
    if (this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.hasDoubleJumped = false;
      sfx.jump();
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.vy = this.jumpForce * 0.85;
      this.hasDoubleJumped = true;
      this.didDoubleJump = true;  // signal GameEngine for discharge effect
      sfx.doublejump();
    }
  }

  private handleAttack(input: InputState, _TILE_SIZE: number) {
    if (!input.attack || this.attackTimer > 0) return;
    this.attackTimer = ATTACK_DURATION;
    this.state = "attacking";
    sfx.attack();

    // Squirtle: water pistol on normal attack
    if (this.creature.id === "squirtle") {
      const dir = this.facingRight ? 1 : -1;
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -14),
        y: this.y + this.height / 2 - 7,
        vx: dir * 10, vy: -0.5,
        type: "water", damage: this.baseAttack * 1.2, color: "#4488AA",
      });
    }
  }

  private handleSpecial(input: InputState, TILE_SIZE: number) {
    if (!input.special || this.specialTimer > 0 || this.energy < 30) return;
    void TILE_SIZE;
    this.specialTimer = SPECIAL_COOLDOWN;
    this.energy -= 30;
    this.state = "special";

    const id  = this.creature.id;
    const dir = this.facingRight ? 1 : -1;

    if (id === "pikachu") {
      sfx.pikachuThunderbolt();
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -14),
        y: this.y + this.height / 2 - 7,
        vx: dir * 12, vy: 0,
        type: "electric", damage: this.baseAttack * 2, color: "#FFD700",
      });
    } else if (id === "charizard") {
      sfx.special();
      // Big fireball
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -18),
        y: this.y + this.height / 2 - 9,
        vx: dir * 10, vy: 0,
        type: "fireball", damage: this.baseAttack * 2.5, color: "#FF4500",
      });
    } else if (id === "bulbasaur") {
      sfx.special();
      // Vine — heals slightly and launches projectile
      this.heal(15);
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -14),
        y: this.y + this.height / 2 - 7,
        vx: dir * 8, vy: -1,
        type: "vine", damage: this.baseAttack * 1.8, color: "#4CAF50",
      });
    } else if (id === "squirtle") {
      sfx.special();
      // Water shield
      this.shieldTimer = SHIELD_FRAMES;
    } else if (id === "mewtwo") {
      sfx.special();
      // Psychic blast — area damage projectile
      this.dashTimer = DASH_FRAMES;
      this.vx = dir * 20;
      this.vy = -3;
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -20),
        y: this.y + this.height / 2 - 10,
        vx: dir * 14, vy: 0,
        type: "psychic", damage: this.baseAttack * 2.2, color: "#9B59B6",
      });
    } else if (id === "gengar") {
      sfx.special();
      // Shadow ball
      this.pendingProjectile = new Projectile({
        x: this.x + (this.facingRight ? this.width : -16),
        y: this.y + this.height / 2 - 8,
        vx: dir * 11, vy: 0,
        type: "shadow", damage: this.baseAttack * 2, color: "#7B68EE",
      });
    } else if (id === "eevee") {
      sfx.special();
      // Tackle dash
      this.dashTimer = DASH_FRAMES;
      this.vx = dir * 18;
      this.vy = -2;
    }
  }

  private applyGravity(input: InputState) {
    const id = this.creature.id;
    let grav = GRAVITY;

    // Charizard glide: holding jump while falling cuts gravity in half
    if (id === "charizard" && !this.onGround && this.vy > 0 && input.jumpHeld) {
      grav = GRAVITY * 0.42;
      this.vy = Math.min(this.vy, 5);  // cap fall speed while gliding
    }
    // Mewtwo levitate: holding jump while airborne reduces gravity
    if (id === "mewtwo" && !this.onGround && input.jumpHeld && this.vy > -2) {
      grav = GRAVITY * 0.30;
    }
    // Gengar ghost drift: slightly slower fall when in the air
    if (id === "gengar" && !this.onGround && this.vy > 0) {
      grav = GRAVITY * 0.80;
    }

    this.vy = Math.min(this.vy + grav, MAX_FALL);
  }

  private applyPassiveRegen() {
    // Bulbasaur regen: slowly heals over time via Overgrow passive
    if (this.creature.id === "bulbasaur" && this.hp < this.maxHp) {
      this.hp = Math.min(this.hp + 0.025, this.maxHp);
    }
  }

  private moveAndCollide(tiles: TileType[][], TILE_SIZE: number) {
    this.prevOnGround = this.onGround;
    const res = resolveCollisions(
      this.x, this.y, this.width, this.height,
      this.vx, this.vy, tiles, TILE_SIZE
    );
    this.x = res.x; this.y = res.y;
    this.vx = res.vx; this.vy = res.vy;
    if (res.onGround) {
      if (!this.prevOnGround && this.vy >= 0) sfx.land();
      this.onGround = true;
      this.hasDoubleJumped = false;
    } else {
      if (this.vy > 0) this.onGround = false;
    }
  }

  private updateState() {
    if (this.hurtTimer    > 0) { this.state = "hurt";      return; }
    if (this.shieldTimer  > 0) { this.state = "shielded";  return; }
    if (this.attackTimer  > 0) { this.state = "attacking"; return; }
    if (this.dashTimer    > 0) { this.state = "special";   return; }
    if (!this.onGround) {
      this.state = this.vy < 0 ? "jumping" : "falling";
    } else if (Math.abs(this.vx) > 0.5) {
      this.state = "walking";
    } else {
      this.state = "idle";
    }
  }

  private regenEnergy() {
    this.energy = Math.min(this.energy + ENERGY_REGEN, this.maxEnergy);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number) {
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);

    ctx.save();

    // Star power: rainbow glow aura
    if (this.starTimer > 0) {
      const hue = (Date.now() / 8) % 360;
      ctx.shadowBlur  = 22;
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.strokeStyle = `hsl(${hue},100%,60%)`;
      ctx.lineWidth   = 3;
      ctx.strokeRect(sx - 2, sy - 2, this.width + 4, this.height + 4);
    }

    // Speed boost: cyan glow
    if (this.speedTimer > 0 && this.starTimer === 0) {
      ctx.shadowBlur  = 14;
      ctx.shadowColor = "#00FFEE";
    }

    // Invincibility flicker (not during star or shield)
    if (this.invincibleTimer > 0 && !this.shieldTimer && this.starTimer === 0) {
      ctx.globalAlpha = 0.72;
    }

    // Water shield ring
    if (this.shieldTimer > 0) {
      ctx.shadowBlur  = 24;
      ctx.shadowColor = "#00BFFF";
      const a = this.shieldTimer / SHIELD_FRAMES;
      ctx.strokeStyle = `rgba(0,191,255,${a})`;
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.arc(sx + this.width / 2, sy + this.height / 2, this.width * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dash speed lines
    if (this.dashTimer > 0) {
      ctx.globalAlpha = 0.4;
      const lineColor = this.creature.colors.accent;
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = lineColor;
        ctx.fillRect(
          sx + (this.facingRight ? -i * 12 : this.width + i * 4),
          sy + 8, 8, this.height - 16
        );
      }
      ctx.globalAlpha = 1;
    }

    // Draw Pokémon sprite
    const drawFn = SPRITE_MAP[this.creature.id as PokemonId];
    if (drawFn) {
      drawFn(ctx, sx, sy, this.width, this.height,
             this.facingRight, this.animFrame,
             this.state, this.hurtTimer > 0);
    }

    ctx.restore();

    // Attack shockwave
    if (this.attackTimer > ATTACK_DURATION - 6) {
      const atkAlpha = (this.attackTimer - (ATTACK_DURATION - 6)) / 6;
      ctx.save();
      ctx.globalAlpha = atkAlpha * 0.6;
      ctx.fillStyle = this.creature.colors.accent;
      const atkX = this.facingRight ? sx + this.width - 4 : sx - 20;
      ctx.beginPath();
      ctx.ellipse(atkX + 12, sy + this.height / 2, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
