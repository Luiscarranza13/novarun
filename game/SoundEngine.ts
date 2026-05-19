/**
 * SoundEngine — procedural Web Audio sound effects + background music.
 * No external assets. All sounds and music are synthesised at runtime.
 */

// ── Note frequency helpers ────────────────────────────────────────────────────

const Q  = 0.188;  // 8th note at ~160 BPM
const HQ = Q / 2;  // 16th note
const HF = Q * 2;  // quarter note
const WH = Q * 4;  // half note

/* eslint-disable @typescript-eslint/naming-convention */
// Octave 2
const E2=82.41, G2=98.00, A2=110.00, B2=123.47;
// Octave 3
const C3=130.81, D3=146.83, E3=164.81, G3=196.00, A3=220.00, B3=246.94;
// Octave 4
const C4=261.63, D4=293.66, E4=329.63, Fs4=369.99, G4=392.00, A4=440.00, B4=493.88;
// Octave 5
const C5=523.25, D5=587.33, E5=659.25, F5=698.46, Fs5=739.99, G5=783.99, A5=880.00, B5=987.77;
// Octave 6
const C6=1046.50, D6=1174.66, E6=1318.51, G6=1567.98;
/* eslint-enable @typescript-eslint/naming-convention */

const R = 0; // rest

type N2 = [number, number];  // [freq, duration_secs]

// ── Music sequences ───────────────────────────────────────────────────────────

// Level 1 — Ruta 1 (G major, upbeat, 160 BPM)
const BGM1_MELODY: N2[] = [
  // Phrase A — bright ascending figure
  [E5,Q],[G5,Q],[A5,Q],[B5,Q], [G5,HF],[E5,Q],[D5,Q],
  [E5,Q],[G5,Q],[A5,Q],[G5,Q], [E5,HF],[R,Q],[R,Q],
  // Phrase B — wider range
  [A5,Q],[B5,Q],[A5,Q],[G5,Q], [E5,Q],[G5,Q],[A5,HF],
  [B5,Q],[D6,Q],[B5,Q],[A5,Q], [G5,HF],[R,Q],[R,Q],
  // Phrase C — counter-motion
  [G5,Q],[Fs5,Q],[E5,Q],[D5,Q],[E5,Q],[G5,Q],[A5,Q],[G5,Q],
  [E5,Q],[D5,Q],[E5,Q],[G5,Q], [D5,WH],[R,HF],
  // Phrase D — resolution
  [B4,Q],[D5,Q],[E5,Q],[G5,Q], [A5,Q],[G5,Q],[E5,Q],[D5,Q],
  [G5,HF],[D5,HF], [G4,WH],[R,WH],
];

const BGM1_BASS: N2[] = [
  [G3,HF],[D3,HF],[C3,HF],[D3,HF],
  [G3,HF],[D3,HF],[G3,HF],[D3,HF],
  [A3,HF],[E3,HF],[A3,HF],[D3,HF],
  [G3,HF],[D3,HF],[G3,WH],
  [G3,HF],[D3,HF],[C3,HF],[D3,HF],
  [E3,HF],[B2,HF],[E3,HF],[B2,HF],
  [C3,HF],[G3,HF],[D3,HF],[G3,HF],
  [G3,WH],[G3,WH],
];

const BGM1_HARM: N2[] = [
  [B4,HF],[D5,HF],[C5,HF],[D5,HF],
  [B4,HF],[D5,HF],[B4,HF],[D5,HF],
  [C5,HF],[E5,HF],[C5,HF],[D5,HF],
  [B4,HF],[D5,HF],[G4,WH],
  [B4,HF],[D5,HF],[C5,HF],[D5,HF],
  [G4,HF],[B4,HF],[G4,HF],[B4,HF],
  [A4,HF],[C5,HF],[B4,HF],[D5,HF],
  [G4,WH],[G4,WH],
];

// Level 2 — Mt. Moon (A natural minor, mysterious, 100 BPM)
const SLOW = 0.3; // 8th note at 100 BPM
const SLOW2 = SLOW * 2;
const SLOW4 = SLOW * 4;

const BGM2_MELODY: N2[] = [
  // Phrase A — slow descending
  [A4,SLOW2],[R,SLOW],[C5,SLOW2],[B4,SLOW],[A4,SLOW2],[G4,SLOW2],[A4,SLOW2],[R,SLOW2],
  [E5,SLOW2],[R,SLOW],[D5,SLOW2],[C5,SLOW],[B4,SLOW2],[A4,SLOW2],[G4,SLOW2],[R,SLOW2],
  // Phrase B — haunting echo
  [A4,SLOW2],[C5,SLOW2],[E5,SLOW4],               [A4,SLOW2],[E4,SLOW2],[A3,SLOW4],
  [G4,SLOW2],[A4,SLOW2],[C5,SLOW4],               [E4,SLOW2],[D4,SLOW2],[A3,SLOW4],
  // Phrase C — high point
  [E5,SLOW2],[F5,SLOW2],[E5,SLOW2],[D5,SLOW2],    [C5,SLOW2],[B4,SLOW2],[A4,SLOW4],
  [G4,SLOW2],[A4,SLOW2],[C5,SLOW2],[A4,SLOW2],    [E4,SLOW4],[R,SLOW4],
  // Resolution
  [A4,SLOW4],[R,SLOW2],[E4,SLOW4],[R,SLOW2],
  [A3,SLOW4*2],[R,SLOW4*2],
];

const BGM2_BASS: N2[] = [
  [A2,SLOW4],[R,SLOW4],[E2,SLOW4],[R,SLOW4],
  [C3,SLOW4],[R,SLOW4],[G2,SLOW4],[R,SLOW4],
  [A2,SLOW4],[R,SLOW4],[A2,SLOW4],[R,SLOW4],
  [E2,SLOW4],[R,SLOW4],[A2,SLOW4*2],
];

// Level 3 — Seafoam (D major pentatonic, ethereal, 120 BPM)
const ICY = 0.25;  // 8th note at 120 BPM
const ICY2 = ICY * 2;
const ICY4 = ICY * 4;
const ICY8 = ICY * 8;

const BGM3_MELODY: N2[] = [
  // Phrase A — floating
  [D5,ICY2],[R,ICY],[A5,ICY2],[R,ICY],[Fs5,ICY2],[E5,ICY2],[D5,ICY4],[R,ICY2],
  [E5,ICY2],[R,ICY],[B4,ICY2],[R,ICY],[A4,ICY2],[Fs4,ICY2],[E4,ICY4],[R,ICY2],
  // Phrase B — glittering
  [Fs5,ICY],[A5,ICY],[D6,ICY2],[A5,ICY2],[Fs5,ICY2],[E5,ICY4],[R,ICY2],
  [E5,ICY],[Fs5,ICY],[A5,ICY2],[Fs5,ICY2],[E5,ICY2],[D5,ICY4],[R,ICY2],
  // Phrase C — peak shimmer
  [A5,ICY4],[B5,ICY4],[A5,ICY4],[Fs5,ICY4],
  [E5,ICY4],[D5,ICY4],[B4,ICY4],[A4,ICY4],
  // Resolution
  [D5,ICY8],[A4,ICY8],
  [D5,ICY4],[R,ICY4],[R,ICY8],
];

const BGM3_BASS: N2[] = [
  [D3,ICY4],[R,ICY4],[A2,ICY4],[R,ICY4],
  [B2,ICY4],[R,ICY4],[Fs4,ICY4],[R,ICY4],
  [D3,ICY4],[R,ICY4],[D3,ICY4],[R,ICY4],
  [A2,ICY4],[R,ICY4],[D3,ICY8],
];

// ── MusicTrack — lookahead Web Audio scheduler ────────────────────────────────

class MusicTrack {
  private stopped   = true;
  private cursor    = 0;     // index into notes[]
  private nextTime  = 0;     // Web Audio clock of next note to schedule
  private timerId:  ReturnType<typeof setTimeout> | null = null;
  private gainNode: GainNode;
  private LOOKAHEAD = 0.45;  // seconds ahead to schedule
  private TICK_MS   = 100;   // setTimeout interval

  constructor(
    private ctx:   AudioContext,
    dest:          AudioNode,
    private notes: N2[],
    private wave:  OscillatorType,
    private vol:   number
  ) {
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = vol;
    this.gainNode.connect(dest);
  }

  start(delayStart = 0) {
    this.stopped   = false;
    this.cursor    = 0;
    this.nextTime  = this.ctx.currentTime + 0.05 + delayStart;
    this.tick();
  }

  stop() {
    this.stopped = true;
    if (this.timerId !== null) { clearTimeout(this.timerId); this.timerId = null; }
    this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12);
  }

  setMuted(muted: boolean) {
    this.gainNode.gain.setTargetAtTime(muted ? 0 : this.vol, this.ctx.currentTime, 0.06);
  }

  private tick() {
    while (this.nextTime < this.ctx.currentTime + this.LOOKAHEAD) {
      const [freq, dur] = this.notes[this.cursor % this.notes.length];
      this.cursor++;
      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.connect(g);
        g.connect(this.gainNode);
        osc.type = this.wave;
        osc.frequency.value = freq;
        const t = this.nextTime;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(1, t + Math.min(0.012, dur * 0.08));
        g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.008);
        osc.start(t);
        osc.stop(t + dur + 0.01);
      }
      this.nextTime += dur;
    }
    if (!this.stopped) {
      const delay = Math.max(30, (this.nextTime - this.ctx.currentTime - this.LOOKAHEAD) * 1000);
      this.timerId = setTimeout(() => this.tick(), Math.min(delay, this.TICK_MS));
    }
  }
}

// ── SoundEngine (singleton) ───────────────────────────────────────────────────

export class SoundEngine {
  private ctx:        AudioContext | null = null;
  private sfxBus:     GainNode    | null = null;
  private musicBus:   GainNode    | null = null;
  private tracks:     MusicTrack[]       = [];
  muted = false;

  // ── Audio context ───────────────────────────────────────────────────────────

  private boot(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        this.sfxBus   = this.ctx.createGain(); this.sfxBus.gain.value   = 0.22;
        this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.22;
        this.sfxBus.connect(this.ctx.destination);
        this.musicBus.connect(this.ctx.destination);
      } catch { return null; }
    }
    // Resume if suspended (autoplay policy)
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  private sfxCtx(): [AudioContext, GainNode] | null {
    if (this.muted) return null;
    const c = this.boot();
    if (!c || !this.sfxBus) return null;
    return [c, this.sfxBus];
  }

  // ── Low-level tone helper ───────────────────────────────────────────────────

  private tone(
    freq: number, dur: number,
    wave: OscillatorType = "square",
    vol = 0.22,
    delay = 0,
    freqEnd?: number,
    attack = 0.006
  ) {
    const pair = this.sfxCtx();
    if (!pair) return;
    const [ctx, bus] = pair;
    try {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(bus);
      osc.type = wave;
      const t = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + dur);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.008);
      osc.start(t); osc.stop(t + dur + 0.015);
    } catch { /* browser may block */ }
  }

  private noise(dur: number, vol = 0.15, delay = 0) {
    const pair = this.sfxCtx();
    if (!pair) return;
    const [ctx, bus] = pair;
    try {
      const bufSize = Math.ceil(ctx.sampleRate * dur);
      const buf  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src  = ctx.createBufferSource();
      const g    = ctx.createGain();
      const bpf  = ctx.createBiquadFilter();
      bpf.type = "bandpass"; bpf.frequency.value = 220; bpf.Q.value = 0.5;
      src.buffer = buf;
      src.connect(bpf); bpf.connect(g); g.connect(bus);
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.01);
      src.start(t); src.stop(t + dur + 0.01);
    } catch { /* ignore */ }
  }

  // ── Sound effects ───────────────────────────────────────────────────────────

  jump() {
    this.tone(260, 0.04, "triangle", 0.14, 0, 520, 0.003);
    this.tone(390, 0.05, "sine", 0.06, 0.02, 650, 0.003);
  }

  doublejump() {
    this.tone(520, 0.04, "sine", 0.12, 0,    780);
    this.tone(780, 0.04, "sine", 0.10, 0.05, 1040);
    this.tone(1040,0.06, "sine", 0.06, 0.10, 1560);
  }

  land() {
    this.tone(110, 0.035, "triangle", 0.05, 0, 80, 0.004);
  }

  coin() {
    // Rising Pokéball 3-note arpeggio: C–E–G
    this.tone(C5, 0.07, "sine", 0.16, 0);
    this.tone(E5, 0.07, "sine", 0.14, 0.07);
    this.tone(G5, 0.12, "sine", 0.12, 0.14);
    // Tiny sparkle on top
    this.tone(C6, 0.06, "sine", 0.08, 0.21);
  }

  heart() {
    // Gentle ascending potion sparkle
    this.tone(E5,  0.07, "sine", 0.12, 0);
    this.tone(G5,  0.07, "sine", 0.10, 0.07);
    this.tone(B5,  0.07, "sine", 0.09, 0.14);
    this.tone(E6,  0.14, "sine", 0.08, 0.21);
    // Soft shimmer
    this.tone(G6,  0.10, "sine", 0.05, 0.30);
  }

  attack() {
    this.tone(220, 0.045, "triangle", 0.07, 0, 140, 0.004);
  }

  special() {
    // Sparkly ascending charge
    this.tone(D5,  0.05, "sine", 0.12, 0);
    this.tone(Fs5, 0.05, "sine", 0.11, 0.05);
    this.tone(A5,  0.05, "sine", 0.10, 0.10);
    this.tone(D6,  0.05, "sine", 0.09, 0.15);
    this.tone(A5,  0.08, "sine", 0.08, 0.20);
    this.tone(D6,  0.12, "sine", 0.08, 0.25);
  }

  damage() {
    this.tone(180, 0.05, "triangle", 0.06, 0, 120, 0.004);
    this.tone(120, 0.07, "sine", 0.04, 0.035, 80, 0.004);
  }

  stomp() {
    this.tone(220, 0.04, "triangle", 0.07, 0, 130, 0.004);
    this.tone(110, 0.05, "sine", 0.04, 0.03, 70,  0.004);
    // Cute bounce squeak
    this.tone(660, 0.05, "sine",   0.08, 0.06, 880);
  }

  victory() {
    // Bright ascending G major scale + final chord
    const mel: [number, number][] = [
      [G4,0.08],[A4,0.08],[B4,0.08],[C5,0.08],[D5,0.08],[E5,0.08],[Fs5,0.08],[G5,0.14],
      [B5,0.08],[D6,0.08],[G6,0.25],
    ];
    mel.forEach(([f, d], i) => this.tone(f, d, "triangle", 0.12, i * 0.085));
    // Harmony
    const har: [number, number][] = [
      [B3,0.08],[C4,0.08],[D4,0.08],[E4,0.08],[G4,0.08],[A4,0.08],[C5,0.08],[B4,0.14],
    ];
    har.forEach(([f, d], i) => this.tone(f, d, "sine", 0.06, i * 0.085 + 0.01));
    // Final chord
    this.tone(G5, 0.55, "sine", 0.10, 0.95);
    this.tone(B5, 0.55, "sine", 0.08, 0.95);
    this.tone(D6, 0.55, "sine", 0.06, 0.95);
  }

  gameover() {
    // Sad descending melody
    const mel: [number, number][] = [
      [E5,0.18],[D5,0.18],[C5,0.18],[B4,0.22],
      [A4,0.18],[G4,0.18],[E4,0.22],
      [A3,0.50],
    ];
    mel.forEach(([f, d], i) => {
      this.tone(f, d, "triangle", 0.12, i * 0.185);
      this.tone(f / 2, d, "sine", 0.04, i * 0.185 + 0.01);
    });
  }

  // ── Background music ────────────────────────────────────────────────────────

  startBGM(levelId: number) {
    this.stopBGM();
    const c = this.boot();
    if (!c || !this.musicBus) return;

    let melNotes: N2[], bassNotes: N2[], harmNotes: N2[] | null = null;
    let melWave: OscillatorType, bassWave: OscillatorType, harmWave: OscillatorType = "triangle";
    let melVol: number, bassVol: number, harmVol = 0.15;

    if (levelId === 1) {
      melNotes  = BGM1_MELODY; melWave  = "triangle";   melVol   = 0.22;
      harmNotes = BGM1_HARM;   harmWave = "sine";     harmVol  = 0.12;
      bassNotes = BGM1_BASS;   bassWave = "triangle"; bassVol  = 0.30;
    } else if (levelId === 2) {
      melNotes  = BGM2_MELODY; melWave  = "sine";     melVol   = 0.22;
      harmNotes = null;
      bassNotes = BGM2_BASS;   bassWave = "sine";     bassVol  = 0.28;
    } else {
      melNotes  = BGM3_MELODY; melWave  = "sine";     melVol   = 0.18;
      harmNotes = null;
      bassNotes = BGM3_BASS;   bassWave = "triangle"; bassVol  = 0.25;
    }

    const mel  = new MusicTrack(c, this.musicBus, melNotes!,  melWave,  melVol);
    const bass = new MusicTrack(c, this.musicBus, bassNotes!, bassWave, bassVol);
    mel.start(0);
    bass.start(0);
    this.tracks = [mel, bass];

    if (harmNotes) {
      const harm = new MusicTrack(c, this.musicBus, harmNotes, harmWave, harmVol);
      harm.start(0);
      this.tracks.push(harm);
    }

    if (this.muted) this.tracks.forEach(t => t.setMuted(true));
  }

  stopBGM() {
    this.tracks.forEach(t => t.stop());
    this.tracks = [];
  }

  toggle(): boolean {
    this.muted = !this.muted;
    if (this.musicBus) {
      this.musicBus.gain.setTargetAtTime(this.muted ? 0 : 0.22, this.ctx!.currentTime, 0.08);
    }
    if (this.sfxBus) {
      this.sfxBus.gain.setTargetAtTime(this.muted ? 0 : 0.22, this.ctx!.currentTime, 0.08);
    }
    return !this.muted;
  }
}

export const sfx = new SoundEngine();
