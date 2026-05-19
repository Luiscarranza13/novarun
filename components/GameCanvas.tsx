"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { PointerEvent } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { CreatureData } from "@/types/game";
import { LEVELS } from "@/game/data/levels";
import { sfx } from "@/game/SoundEngine";

import { normalizeVoiceText, getMovementVoiceKey, isSpecialVoiceCommand } from "@/game/voiceUtils";
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
      {gameState === "playing" && (
        <VoiceSpecialButton
          onSpecial={triggerSpecial}
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

function VoiceSpecialButton({
  onSpecial,
  onPress,
  onRelease,
}: {
  onSpecial: () => void;
  onPress: (key: string) => void;
  onRelease: (key: string) => void;
}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const enabledRef = useRef(false);
  const lastTriggerRef = useRef(0);
  const lastIndexRef = useRef(-1);
  const restartTimerRef = useRef<number | null>(null);
  
  const [enabled, setEnabled] = useState(false);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "heard" | "unsupported" | "blocked">("idle");

  const stopListening = useCallback(() => {
    enabledRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    setEnabled(false);
    setStatus("idle");
    setHeard("");
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
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
    recognition.lang = "es-ES"; // Force Spanish for consistency

    recognition.onresult = (event) => {
      const now = Date.now();
      
      // Process all results from the current event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        
        if (!transcript) continue;
        
        // Debug log for the user to see in browser console
        console.log(`[Voz] He oido: "${transcript}" (Confianza: ${result[0].confidence.toFixed(2)})`);

        // If we already triggered for this index and it's not final, skip
        // This allows triggering on interim results but only once per "phrase"
        if (i <= lastIndexRef.current && !result.isFinal) continue;

        const moveKey = getMovementVoiceKey(transcript);
        const special = isSpecialVoiceCommand(transcript);

        if (moveKey || special) {
          // Debounce to prevent rapid fire of the SAME command
          if (now - lastTriggerRef.current < 450) continue;

          lastTriggerRef.current = now;
          lastIndexRef.current = i;
          
          setHeard(transcript.split(" ").pop() || transcript);
          setStatus("heard");

          if (moveKey) {
            onPress(moveKey);
            const duration = moveKey === "ArrowUp" ? 250 : 700;
            window.setTimeout(() => onRelease(moveKey), duration);
          } else {
            onSpecial();
          }

          window.setTimeout(() => {
            if (enabledRef.current) {
              setStatus("listening");
              setHeard("");
            }
          }, 800);
          
          // If we found a command in this result, we stop looking at this index
          break; 
        }
      }
    };

    recognition.onstart = () => {
      if (enabledRef.current) setStatus("listening");
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        enabledRef.current = false;
        setEnabled(false);
        setStatus("blocked");
        return;
      }
      if (enabledRef.current) setStatus("listening");
    };

    recognition.onend = () => {
      if (!enabledRef.current) return;
      // Auto-restart if it stops for some reason (silence timeout, etc)
      restartTimerRef.current = window.setTimeout(() => {
        if (!enabledRef.current) return;
        try {
          recognition.start();
        } catch {
          setStatus("listening");
        }
      }, 300);
    };

    recognitionRef.current = recognition;
    enabledRef.current = true;
    setEnabled(true);
    lastIndexRef.current = -1;
    setStatus("listening");

    try {
      recognition.start();
    } catch {
      setStatus("listening");
    }
  }, [onSpecial, onPress, onRelease]);

  useEffect(() => stopListening, [stopListening]);

  const label =
    status === "unsupported" ? "Voz no disponible" :
    status === "blocked" ? "Permite microfono" :
    status === "heard" ? `¡${heard}!` :
    enabled ? "Voz activa" : "Voz";

  return (
    <button
      type="button"
      onClick={enabled ? stopListening : startListening}
      className={`${styles.voiceBtn} ${enabled ? styles.voiceBtnActive : ""}`}
      title="Activa el microfono y di: derecha, izquierda, salta o habilidad"
    >
      <span className={styles.voiceDot} />
      <span>{label}</span>
    </button>
  );
}

function normalizeVoiceTextLocal(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

