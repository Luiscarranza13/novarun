"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { PointerEvent } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CreatureData } from "@/types/game";
import { LEVELS } from "@/game/data/levels";
import { sfx } from "@/game/SoundEngine";

import { classifyVoiceCommand, VOICE_GRAMMAR } from "@/game/voiceUtils";
import { ACHIEVEMENT_DEFS, AchievementDef } from "@/game/saveSystem";
import { Difficulty, AchievementId } from "@/types/game";
import StartScreen     from "./StartScreen";
import CharacterSelect from "./CharacterSelect";
import HUD             from "./HUD";
import GameOver        from "./GameOver";
import Victory         from "./Victory";
import PauseMenu       from "./PauseMenu";
import HowToPlay       from "./HowToPlay";
import CreditsScreen   from "./CreditsScreen";
import styles          from "./GameCanvas.module.css";

const CANVAS_W = 800;
const CANVAS_H = 480;
const GAME_TRACKS = [
  {
    src: "/audio/ACDC - Back In Black (Official Video).mp3",
    start: 16,
    end: 112,
  },
  {
    src: "/audio/ACDC - Highway to Hell (Official Video).mp3",
    start: 35,
    end: 126,
  },
  {
    src: "/audio/ACDC - Thunderstruck (Official Video).mp3",
    start: 33,
    end: 138,
  },
];

export default function GameCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const menuAudioRef = useRef<HTMLAudioElement>(null);
  const gameAudioRef = useRef<HTMLAudioElement>(null);
  const onAchievement = useCallback((id: AchievementId) => {
    const def = ACHIEVEMENT_DEFS.find((a) => a.id === id);
    if (def) setToastQueue((q) => [...q, def]);
  }, []);

  const {
    gameState,
    hud,
    levelStats,
    startGame,
    triggerSpecial,
    pressControl,
    releaseControl,
    pauseGame,
    resumeGame,
    goToMenu,
    goToCharacterSelect,
  } = useGameEngine(canvasRef, onAchievement);

  const [showHow,        setShowHow]        = useState(false);
  const [showCredits,    setShowCredits]    = useState(false);
  const [lastCreature,   setLastCreature]   = useState<CreatureData | null>(null);
  const [currentLevel,   setCurrentLevel]   = useState(0);
  const [gameTrackIndex, setGameTrackIndex] = useState(0);
  const [menuMusicOn,    setMenuMusicOn]    = useState(false);
  const [gameMusicMuted, setGameMusicMuted] = useState(false);
  const [difficulty,     setDifficulty]     = useState<Difficulty>("normal");
  const [toastQueue,     setToastQueue]     = useState<AchievementDef[]>([]);

  // Volume state (0–1); affects SFX engine and HTML audio element
  const [sfxVolume,   setSfxVolume]   = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);

  useEffect(() => {
    sfx.stopBGM();
    return () => sfx.stopBGM();
  }, []);

  // ── SFX volume ──────────────────────────────────────────────────────────────
  const handleSfxVolume = useCallback((v: number) => {
    setSfxVolume(v);
    sfx.setSfxVolume(v);
  }, []);

  // ── Music volume ────────────────────────────────────────────────────────────
  const handleMusicVolume = useCallback((v: number) => {
    setMusicVolume(v);
    const audio = gameAudioRef.current;
    if (audio) audio.volume = v * 0.34;
    const menuAudio = menuAudioRef.current;
    if (menuAudio) menuAudio.volume = v * 0.55;
  }, []);

  // ── Menu audio ──────────────────────────────────────────────────────────────
  const playMenuMusic = useCallback(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;
    sfx.stopBGM();
    const gameAudio = gameAudioRef.current;
    if (gameAudio) { gameAudio.pause(); gameAudio.currentTime = 0; }
    audio.volume = musicVolume * 0.55;
    audio.play()
      .then(() => setMenuMusicOn(true))
      .catch(() => setMenuMusicOn(false));
  }, [musicVolume]);

  const pauseMenuMusic = useCallback(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;
    audio.pause();
    setMenuMusicOn(false);
  }, []);

  // ── Game audio ──────────────────────────────────────────────────────────────
  const playGameMusic = useCallback(() => {
    const audio = gameAudioRef.current;
    if (!audio) return;
    sfx.stopBGM();
    pauseMenuMusic();
    audio.volume = musicVolume * 0.34;
    const track = GAME_TRACKS[gameTrackIndex];
    if (audio.currentTime < track.start || audio.currentTime >= track.end) {
      audio.currentTime = track.start;
    }
    audio.play().catch(() => {});
  }, [gameTrackIndex, musicVolume, pauseMenuMusic]);

  const pauseGameMusic = useCallback((reset = false) => {
    const audio = gameAudioRef.current;
    if (!audio) return;
    audio.pause();
    if (reset) audio.currentTime = 0;
  }, []);

  const toggleMenuMusic = useCallback(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;
    if (audio.paused) playMenuMusic();
    else pauseMenuMusic();
  }, [pauseMenuMusic, playMenuMusic]);

  // ── Level handlers ──────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (creature: CreatureData) => {
      pauseMenuMusic();
      setGameMusicMuted(false);
      setGameTrackIndex(0);
      playGameMusic();
      setLastCreature(creature);
      setCurrentLevel(0);
      startGame(creature, 0, difficulty);
    },
    [pauseMenuMusic, playGameMusic, startGame, difficulty]
  );

  const handleRetry = useCallback(() => {
    if (lastCreature) {
      setGameMusicMuted(false);
      playGameMusic();
      startGame(lastCreature, currentLevel, difficulty);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame, difficulty]);

  const handleNextLevel = useCallback(() => {
    if (lastCreature) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setGameMusicMuted(false);
      setGameTrackIndex(next % GAME_TRACKS.length);
      playGameMusic();
      startGame(lastCreature, next, difficulty);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame, difficulty]);

  // Pause menu: resume resumes game music too
  const handleResume = useCallback(() => {
    resumeGame();
    if (!gameMusicMuted) playGameMusic();
  }, [resumeGame, gameMusicMuted, playGameMusic]);

  const handlePauseRetry = useCallback(() => {
    if (lastCreature) {
      setGameMusicMuted(false);
      playGameMusic();
      startGame(lastCreature, currentLevel, difficulty);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame, difficulty]);

  // Focus canvas while playing so keyboard works in all browsers
  useEffect(() => {
    if (gameState === "playing") canvasRef.current?.focus();
  }, [gameState]);

  // Pause game music when paused
  useEffect(() => {
    if (gameState === "paused") pauseGameMusic();
  }, [gameState, pauseGameMusic]);

  const isInGame =
    gameState === "playing" || gameState === "paused" ||
    gameState === "game-over" || gameState === "victory";
  const shouldPlayMenuMusic = gameState === "menu" || gameState === "character-select";

  useEffect(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;
    audio.volume = musicVolume * 0.55;
    if (!shouldPlayMenuMusic) {
      pauseMenuMusic();
      audio.currentTime = 0;
      return;
    }
    playMenuMusic();
    window.addEventListener("pointerdown", playMenuMusic, { once: true });
    window.addEventListener("keydown",     playMenuMusic, { once: true });
    return () => {
      window.removeEventListener("pointerdown", playMenuMusic);
      window.removeEventListener("keydown",     playMenuMusic);
    };
  }, [pauseMenuMusic, playMenuMusic, shouldPlayMenuMusic, musicVolume]);

  useEffect(() => {
    if (gameState === "playing" && !gameMusicMuted) {
      playGameMusic();
      return;
    }
    if (gameState !== "paused") pauseGameMusic(gameState !== "playing");
  }, [gameMusicMuted, gameState, pauseGameMusic, playGameMusic]);

  useEffect(() => {
    const audio = gameAudioRef.current;
    if (!audio) return;

    const track = GAME_TRACKS[gameTrackIndex];
    const nextSrc = track.src;
    const wasPlaying = !audio.paused;
    if (audio.getAttribute("src") !== nextSrc) {
      audio.src = nextSrc;
      audio.load();
    }
    audio.currentTime = track.start;
    audio.volume = musicVolume * 0.34;
    if (wasPlaying) audio.play().catch(() => {});
  }, [gameTrackIndex, musicVolume]);

  const handleGameTrackEnded = useCallback(() => {
    setGameTrackIndex((i) => (i + 1) % GAME_TRACKS.length);
  }, []);

  const handleGameTrackTimeUpdate = useCallback(() => {
    const audio = gameAudioRef.current;
    if (!audio) return;
    if (audio.currentTime >= GAME_TRACKS[gameTrackIndex].end) {
      setGameTrackIndex((i) => (i + 1) % GAME_TRACKS.length);
    }
  }, [gameTrackIndex]);

  const toggleGameAudio = useCallback(() => {
    const soundOn = sfx.toggle();
    sfx.stopBGM();
    setGameMusicMuted(!soundOn);
    if (soundOn) playGameMusic();
    else pauseGameMusic();
  }, [pauseGameMusic, playGameMusic]);


  return (
    <div className={styles.root}>
      <audio ref={menuAudioRef} src="/audio/pokemon-intro.mp3" loop preload="auto" />
      <audio
        ref={gameAudioRef}
        src={GAME_TRACKS[gameTrackIndex].src}
        preload="auto"
        onEnded={handleGameTrackEnded}
        onTimeUpdate={handleGameTrackTimeUpdate}
      />

      {/* Game canvas — always mounted, hidden via class when not in-game */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className={isInGame ? styles.canvas : styles.canvasHidden}
        tabIndex={0}
      />

      {/* Dark background for non-game screens */}
      {!isInGame && <div className={styles.idleBg} />}

      {/* ── UI overlays ─────────────────────────────────────────────────────── */}

      {gameState === "menu" && !showHow && !showCredits && (
        <StartScreen
          onPlay={() => { playMenuMusic(); goToCharacterSelect(); }}
          onAbout={() => setShowHow(true)}
          onCredits={() => setShowCredits(true)}
          difficulty={difficulty}
          onDifficulty={setDifficulty}
        />
      )}

      {gameState === "character-select" && (
        <CharacterSelect onSelect={handleSelect} onBack={goToMenu} />
      )}

      {(gameState === "playing" || gameState === "paused") && <HUD hud={hud} visible />}

      {gameState === "paused" && (
        <PauseMenu
          onResume={handleResume}
          onRetry={handlePauseRetry}
          onMenu={goToMenu}
          sfxVolume={sfxVolume}
          musicVolume={musicVolume}
          onSfxVolume={handleSfxVolume}
          onMusicVolume={handleMusicVolume}
        />
      )}

      {gameState === "game-over" && (
        <>
          <HUD hud={hud} visible />
          <GameOver
            score={hud.score} level={hud.level}
            onRetry={handleRetry} onMenu={goToMenu}
          />
        </>
      )}

      {gameState === "victory" && (
        <>
          <HUD hud={hud} visible />
          <Victory
            score={hud.score} level={hud.level}
            hasNextLevel={currentLevel + 1 < LEVELS.length}
            stats={levelStats}
            onNext={handleNextLevel} onMenu={goToMenu}
          />
        </>
      )}

      {showHow     && <HowToPlay     onClose={() => setShowHow(false)} />}
      {showCredits && <CreditsScreen onClose={() => setShowCredits(false)} />}

      {/* Achievement toasts */}
      {toastQueue.length > 0 && (
        <AchievementToast
          achievement={toastQueue[0]}
          onDone={() => setToastQueue((q) => q.slice(1))}
        />
      )}

      {shouldPlayMenuMusic && (
        <button
          type="button"
          onClick={toggleMenuMusic}
          className={`${styles.menuMusicBtn} ${menuMusicOn ? styles.menuMusicBtnOn : ""}`}
          title="Activar musica de inicio"
        >
          {menuMusicOn ? "Musica ON" : "Activar musica"}
        </button>
      )}

      {/* Mute button while playing */}
      {isInGame && gameState !== "paused" && (
        <MuteButton muted={gameMusicMuted} onToggle={toggleGameAudio} />
      )}

      {/* Pause button (mobile-friendly) */}
      {gameState === "playing" && (
        <button type="button" className={styles.pauseBtn} onClick={pauseGame} title="Pausar (Esc)">
          ⏸
        </button>
      )}

      {gameState === "playing" && (
        <VoiceSpecialButton
          triggerSpecial={triggerSpecial}
          onPress={pressControl}
          onRelease={releaseControl}
        />
      )}
      {gameState === "playing" && (
        <MobileControls onPress={pressControl} onRelease={releaseControl} />
      )}
    </div>
  );
}


// ── Achievement toast ─────────────────────────────────────────────────────────

function AchievementToast({
  achievement,
  onDone,
}: {
  achievement: AchievementDef;
  onDone: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 3200);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className={styles.achieveToast}>
      <span className={styles.achieveIcon}>{achievement.icon}</span>
      <div className={styles.achieveBody}>
        <span className={styles.achieveLabel}>Logro desbloqueado</span>
        <span className={styles.achieveName}>{achievement.name}</span>
        <span className={styles.achieveDesc}>{achievement.description}</span>
      </div>
    </div>
  );
}

// ── Mute toggle ───────────────────────────────────────────────────────────────

function MuteButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={styles.muteBtn}
      title={muted ? "Activar sonido" : "Silenciar"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

function MobileControls({
  onPress,
  onRelease,
}: {
  onPress: (key: string) => void;
  onRelease: (key: string) => void;
}) {
  const bindControl = (key: string) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onPress(key);
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.releasePointerCapture(event.pointerId);
      onRelease(key);
    },
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onRelease(key);
    },
  });

  return (
    <div className={styles.mobileControls} aria-label="Controles moviles">
      <div className={styles.movePad}>
        <button
          type="button"
          className={styles.mobileControlBtn}
          aria-label="Mover izquierda"
          {...bindControl("ArrowLeft")}
        >
          IZQ
        </button>
        <button
          type="button"
          className={styles.mobileControlBtn}
          aria-label="Mover derecha"
          {...bindControl("ArrowRight")}
        >
          DER
        </button>
      </div>
      <button
        type="button"
        className={`${styles.mobileControlBtn} ${styles.jumpBtn}`}
        aria-label="Saltar"
        {...bindControl("ArrowUp")}
      >
        SALTO
      </button>
    </div>
  );
}

type SpeechRecognitionResultEvent = Event & {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechGrammarListConstructor = new () => SpeechGrammarList;

type SpeechGrammarList = {
  addFromString: (grammar: string, weight?: number) => void;
};

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  grammars: SpeechGrammarList;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechGrammarList?: SpeechGrammarListConstructor;
    webkitSpeechGrammarList?: SpeechGrammarListConstructor;
  }
}

// ── Cooldowns per command type (ms) ──────────────────────────────────────────
const CD_JUMP    = 220;   // reducido: respuesta más rápida al salto
const CD_SPECIAL = 500;   // reducido: habilidad especial
const DIR_HOLD   = 1600;  // ampliado: mantiene dirección más tiempo ante silencio

function VoiceSpecialButton({
  triggerSpecial,
  onPress,
  onRelease,
}: {
  triggerSpecial: () => void;
  onPress:  (key: string) => void;
  onRelease: (key: string) => void;
}) {
  const recognitionRef  = useRef<SpeechRecognition | null>(null);
  const enabledRef      = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const lastIndexRef    = useRef(-1);

  // Per-command cooldown timestamps
  const cdRef = useRef<Record<string, number>>({});

  // Stateful direction tracking
  const currentDirRef  = useRef<string | null>(null);
  const dirTimerRef    = useRef<number | null>(null);

  const [enabled,    setEnabled]    = useState(false);
  const [heard,      setHeard]      = useState("");
  const [activeDir,  setActiveDir]  = useState<"left" | "right" | null>(null);
  const [status,     setStatus]     = useState<
    "idle" | "listening" | "heard" | "unsupported" | "blocked"
  >("idle");

  // ── Direction helpers ───────────────────────────────────────────────────────

  const releaseDirKey = useCallback((key: string) => {
    onRelease(key);
    if (currentDirRef.current === key) {
      currentDirRef.current = null;
      setActiveDir(null);
    }
  }, [onRelease]);

  const pressDirKey = useCallback((key: string) => {
    // Release the opposite direction if held
    if (currentDirRef.current && currentDirRef.current !== key) {
      onRelease(currentDirRef.current);
    }
    currentDirRef.current = key;
    setActiveDir(key === "ArrowLeft" ? "left" : "right");
    onPress(key);

    // Reset auto-release timer — saying the same word again keeps you moving
    if (dirTimerRef.current) clearTimeout(dirTimerRef.current);
    dirTimerRef.current = window.setTimeout(() => releaseDirKey(key), DIR_HOLD);
  }, [onPress, onRelease, releaseDirKey]);

  const stopMoving = useCallback(() => {
    if (dirTimerRef.current) { clearTimeout(dirTimerRef.current); dirTimerRef.current = null; }
    if (currentDirRef.current) { onRelease(currentDirRef.current); currentDirRef.current = null; }
    setActiveDir(null);
  }, [onRelease]);

  // ── Command dispatcher ──────────────────────────────────────────────────────

  const dispatch = useCallback((transcript: string) => {
    const cmd = classifyVoiceCommand(transcript);
    if (!cmd) return null;

    const now = Date.now();

    if (cmd === "left")  { pressDirKey("ArrowLeft");  return "izquierda"; }
    if (cmd === "right") { pressDirKey("ArrowRight"); return "derecha"; }

    if (cmd === "stop") { stopMoving(); return "para"; }

    if (cmd === "jump") {
      if (now - (cdRef.current.jump ?? 0) < CD_JUMP) return null;
      cdRef.current.jump = now;
      onPress("ArrowUp");
      window.setTimeout(() => onRelease("ArrowUp"), 200);
      return "salta";
    }

    if (cmd === "special") {
      if (now - (cdRef.current.special ?? 0) < CD_SPECIAL) return null;
      cdRef.current.special = now;
      triggerSpecial();
      return "especial";
    }

    return null;
  }, [pressDirKey, stopMoving, onPress, onRelease, triggerSpecial]);

  // ── Speech recognition setup ────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    enabledRef.current = false;
    if (restartTimerRef.current !== null) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    stopMoving();
    setEnabled(false);
    setStatus("idle");
    setHeard("");
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, [stopMoving]);

  const startListening = useCallback(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const GrammarList = window.SpeechGrammarList ?? window.webkitSpeechGrammarList;
    if (!Recognition) { setStatus("unsupported"); return; }

    const recognition = new Recognition();

    // Bias the model toward our vocabulary
    if (GrammarList) {
      try {
        const list = new GrammarList();
        list.addFromString(VOICE_GRAMMAR, 1);
        recognition.grammars = list;
      } catch { /* not critical */ }
    }

    recognition.continuous      = true;
    recognition.interimResults  = true;  // captura palabras mientras se forman
    recognition.maxAlternatives = 5;     // más hipótesis = más chances de acertar
    // es-ES para comandos en español; Chrome también fallback a en-US si el modelo
    // no entiende la palabra — nuestros word-lists cubren ambos idiomas.
    recognition.lang = "es-ES";

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result  = event.results[i];
        const isFinal = result.isFinal;

        // For direction commands: act on interim results (faster response)
        // For special: wait for final result (avoids false positives)
        if (!isFinal && i <= lastIndexRef.current) continue;

        // Check all alternatives the browser suggests
        let fired: string | null = null;
        for (let a = 0; a < result.length && !fired; a++) {
          const alt        = result[a];
          const transcript = alt.transcript.toLowerCase().trim();
          if (!transcript) continue;

          // Confianza mínima para evitar falsos positivos.
          // Los resultados interinos no tienen score fiable → los aceptamos siempre.
          // En resultados finales filtramos sólo "special" (mayor riesgo de FP).
          const confidence = alt.confidence ?? 1;
          if (isFinal && confidence < 0.15) continue;

          // Dirección / salto / stop: interino para mínima latencia
          const cmd = classifyVoiceCommand(transcript);
          if (cmd === "left" || cmd === "right" || cmd === "jump" || cmd === "stop") {
            fired = dispatch(transcript);
          }
          // Especial: sólo en resultado final con confianza decente
          if (cmd === "special" && isFinal && confidence >= 0.2) {
            fired = dispatch(transcript);
          }
        }

        if (fired) {
          if (isFinal) lastIndexRef.current = i;
          setHeard(fired);
          setStatus("heard");
          window.setTimeout(() => {
            if (enabledRef.current) setStatus("listening");
          }, 700);
          break;
        }
      }
    };

    recognition.onstart = () => { if (enabledRef.current) setStatus("listening"); };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        enabledRef.current = false;
        setEnabled(false);
        setStatus("blocked");
        return;
      }
      // Any other error: keep trying
      if (enabledRef.current) setStatus("listening");
    };

    recognition.onend = () => {
      if (!enabledRef.current) return;
      // Reset index so interim results aren't blocked in the new session
      lastIndexRef.current = -1;
      // Auto-restart after short pause (browser stops after silence)
      restartTimerRef.current = window.setTimeout(() => {
        if (!enabledRef.current) return;
        try { recognition.start(); } catch { /* already started */ }
      }, 200);
    };

    recognitionRef.current = recognition;
    enabledRef.current     = true;
    lastIndexRef.current   = -1;
    setEnabled(true);
    setStatus("listening");
    try { recognition.start(); } catch { setStatus("listening"); }
  }, [dispatch, stopListening]);

  // Clean up on unmount / game state change
  useEffect(() => () => stopListening(), [stopListening]);

  // ── UI ───────────────────────────────────────────────────────────────────────

  const dirLabel = activeDir === "left" ? "◀" : activeDir === "right" ? "▶" : null;

  const label =
    status === "unsupported" ? "Voz no disponible" :
    status === "blocked"     ? "Permite microfono" :
    status === "heard"       ? `¡${heard}!` :
    dirLabel                 ? `Mov ${dirLabel}` :
    enabled                  ? "Voz activa" : "Voz";

  return (
    <button
      type="button"
      onClick={enabled ? stopListening : startListening}
      className={`${styles.voiceBtn} ${enabled ? styles.voiceBtnActive : ""} ${activeDir ? styles.voiceBtnMoving : ""}`}
      title="Di: derecha, izquierda, salta, para, o habilidad"
    >
      <span className={styles.voiceDot} />
      <span>{label}</span>
    </button>
  );
}
