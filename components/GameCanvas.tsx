"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { PointerEvent } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CreatureData } from "@/types/game";
import { LEVELS } from "@/game/data/levels";
import { sfx } from "@/game/SoundEngine";

import StartScreen     from "./StartScreen";
import CharacterSelect from "./CharacterSelect";
import HUD             from "./HUD";
import GameOver        from "./GameOver";
import Victory         from "./Victory";
import HowToPlay       from "./HowToPlay";
import styles          from "./GameCanvas.module.css";

const CANVAS_W = 800;
const CANVAS_H = 480;

export default function GameCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const menuAudioRef = useRef<HTMLAudioElement>(null);
  const gameAudioRef = useRef<HTMLAudioElement>(null);
  const {
    gameState,
    hud,
    startGame,
    triggerSpecial,
    pressControl,
    releaseControl,
    goToMenu,
    goToCharacterSelect,
  } =
    useGameEngine(canvasRef);

  const [showHow,      setShowHow]      = useState(false);
  const [lastCreature, setLastCreature] = useState<CreatureData | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [menuMusicOn, setMenuMusicOn] = useState(false);
  const [gameMusicMuted, setGameMusicMuted] = useState(false);

  useEffect(() => {
    sfx.stopBGM();
    return () => sfx.stopBGM();
  }, []);

  const playMenuMusic = useCallback(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;

    sfx.stopBGM();
    const gameAudio = gameAudioRef.current;
    if (gameAudio) {
      gameAudio.pause();
      gameAudio.currentTime = 0;
    }
    audio.volume = 0.55;
    audio.play()
      .then(() => setMenuMusicOn(true))
      .catch(() => setMenuMusicOn(false));
  }, []);

  const pauseMenuMusic = useCallback(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;

    audio.pause();
    setMenuMusicOn(false);
  }, []);

  const playGameMusic = useCallback(() => {
    const audio = gameAudioRef.current;
    if (!audio) return;

    sfx.stopBGM();
    pauseMenuMusic();
    audio.volume = 0.34;
    audio.play().catch(() => {});
  }, [pauseMenuMusic]);

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

  const handleSelect = useCallback(
    (creature: CreatureData) => {
      pauseMenuMusic();
      setGameMusicMuted(false);
      playGameMusic();
      setLastCreature(creature);
      setCurrentLevel(0);
      startGame(creature, 0);
    },
    [pauseMenuMusic, playGameMusic, startGame]
  );

  const handleRetry = useCallback(() => {
    if (lastCreature) {
      setGameMusicMuted(false);
      playGameMusic();
      startGame(lastCreature, currentLevel);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame]);

  const handleNextLevel = useCallback(() => {
    if (lastCreature) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      setGameMusicMuted(false);
      playGameMusic();
      startGame(lastCreature, next);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame]);

  // Focus canvas while playing so keyboard works in all browsers
  useEffect(() => {
    if (gameState === "playing") canvasRef.current?.focus();
  }, [gameState]);

  const isInGame =
    gameState === "playing" || gameState === "game-over" || gameState === "victory";
  const shouldPlayMenuMusic = gameState === "menu" || gameState === "character-select";

  useEffect(() => {
    const audio = menuAudioRef.current;
    if (!audio) return;

    audio.volume = 0.55;

    if (!shouldPlayMenuMusic) {
      pauseMenuMusic();
      audio.currentTime = 0;
      return;
    }

    playMenuMusic();
    window.addEventListener("pointerdown", playMenuMusic, { once: true });
    window.addEventListener("keydown", playMenuMusic, { once: true });

    return () => {
      window.removeEventListener("pointerdown", playMenuMusic);
      window.removeEventListener("keydown", playMenuMusic);
    };
  }, [pauseMenuMusic, playMenuMusic, shouldPlayMenuMusic]);

  useEffect(() => {
    if (gameState === "playing" && !gameMusicMuted) {
      playGameMusic();
      return;
    }

    pauseGameMusic(gameState !== "playing");
  }, [gameMusicMuted, gameState, pauseGameMusic, playGameMusic]);

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
      <audio ref={gameAudioRef} src="/audio/musicajuego.mp3" loop preload="auto" />
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

      {/* ── UI overlays ────────────────────────────────────────── */}

      {gameState === "menu" && !showHow && (
        <StartScreen
          onPlay={() => {
            playMenuMusic();
            goToCharacterSelect();
          }}
          onAbout={() => setShowHow(true)}
        />
      )}

      {gameState === "character-select" && (
        <CharacterSelect onSelect={handleSelect} onBack={goToMenu} />
      )}

      {gameState === "playing" && <HUD hud={hud} visible />}

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
            onNext={handleNextLevel} onMenu={goToMenu}
          />
        </>
      )}

      {showHow && <HowToPlay onClose={() => setShowHow(false)} />}

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
      {isInGame && <MuteButton muted={gameMusicMuted} onToggle={toggleGameAudio} />}
      {gameState === "playing" && <VoiceSpecialButton onSpecial={triggerSpecial} />}
      {gameState === "playing" && (
        <MobileControls onPress={pressControl} onRelease={releaseControl} />
      )}
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
    onPointerLeave: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.buttons === 0) return;
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

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function VoiceSpecialButton({ onSpecial }: { onSpecial: () => void }) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const enabledRef = useRef(false);
  const lastTriggerRef = useRef(0);
  const restartTimerRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "heard" | "unsupported" | "blocked">("idle");

  const stopListening = useCallback(() => {
    enabledRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    setEnabled(false);
    setStatus("idle");
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setStatus("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language?.toLowerCase().startsWith("es")
      ? navigator.language
      : "es-PE";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript ?? "";
      }

      const commandHeard = isSpecialVoiceCommand(transcript);
      const now = Date.now();

      if (commandHeard && now - lastTriggerRef.current > 1200) {
        lastTriggerRef.current = now;
        setStatus("heard");
        onSpecial();
        window.setTimeout(() => {
          if (enabledRef.current) setStatus("listening");
        }, 450);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        enabledRef.current = false;
        setEnabled(false);
        setStatus("blocked");
        return;
      }

      if (enabledRef.current) {
        setStatus("listening");
      }
    };

    recognition.onend = () => {
      if (!enabledRef.current) return;

      restartTimerRef.current = window.setTimeout(() => {
        if (!enabledRef.current) return;

        try {
          recognition.start();
        } catch {
          setStatus("listening");
        }
      }, 180);
    };

    recognitionRef.current = recognition;
    enabledRef.current = true;
    setEnabled(true);
    setStatus("listening");

    try {
      recognition.start();
    } catch {
      setStatus("listening");
    }
  }, [onSpecial]);

  useEffect(() => stopListening, [stopListening]);

  const label =
    status === "unsupported" ? "Voz no disponible" :
    status === "blocked" ? "Permite microfono" :
    status === "heard" ? "Habilidad!" :
    enabled ? "Voz activa" : "Voz";

  return (
    <button
      type="button"
      onClick={enabled ? stopListening : startListening}
      className={`${styles.voiceBtn} ${enabled ? styles.voiceBtnActive : ""}`}
      title="Activa el microfono y di: habilidad, especial o poder"
    >
      <span className={styles.voiceDot} />
      <span>{label}</span>
    </button>
  );
}

function normalizeVoiceText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpecialVoiceCommand(transcript: string) {
  const text = normalizeVoiceText(transcript);
  if (!text) return false;

  return [
    "habilidad",
    "habilidad especial",
    "especial",
    "poder",
    "super",
    "ataque especial",
    "usa habilidad",
    "usar habilidad",
    "activa habilidad",
    "activar habilidad",
    "lanza poder",
  ].some((command) => new RegExp(`(^|\\s)${command}(\\s|$)`).test(text));
}
