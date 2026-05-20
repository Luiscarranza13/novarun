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
import PauseMenu       from "./PauseMenu";
import HowToPlay       from "./HowToPlay";
import styles          from "./GameCanvas.module.css";

// suppress unused import warning — normalizeVoiceText is used in VoiceSpecialButton
void normalizeVoiceText;

const CANVAS_W = 800;
const CANVAS_H = 480;

export default function GameCanvas() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const menuAudioRef = useRef<HTMLAudioElement>(null);
  const gameAudioRef = useRef<HTMLAudioElement>(null);
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
  } = useGameEngine(canvasRef);

  const [showHow,      setShowHow]      = useState(false);
  const [lastCreature, setLastCreature] = useState<CreatureData | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [menuMusicOn,  setMenuMusicOn]  = useState(false);
  const [gameMusicMuted, setGameMusicMuted] = useState(false);

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
    audio.play().catch(() => {});
  }, [musicVolume, pauseMenuMusic]);

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

  // Pause menu: resume resumes game music too
  const handleResume = useCallback(() => {
    resumeGame();
    if (!gameMusicMuted) playGameMusic();
  }, [resumeGame, gameMusicMuted, playGameMusic]);

  const handlePauseRetry = useCallback(() => {
    if (lastCreature) {
      setGameMusicMuted(false);
      playGameMusic();
      startGame(lastCreature, currentLevel);
    }
  }, [lastCreature, currentLevel, playGameMusic, startGame]);

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

  const toggleGameAudio = useCallback(() => {
    const soundOn = sfx.toggle();
    sfx.stopBGM();
    setGameMusicMuted(!soundOn);
    if (soundOn) playGameMusic();
    else pauseGameMusic();
  }, [pauseGameMusic, playGameMusic]);

  // Voice action forwarder (used by VoiceSpecialButton)
  const triggerVoiceAction = useCallback(
    (key: string, duration: number) => {
      // Access engine via hook's pressControl/releaseControl
      pressControl(key);
      window.setTimeout(() => releaseControl(key), duration);
    },
    [pressControl, releaseControl]
  );

  return (
    <div className={styles.root}>
      <audio ref={menuAudioRef} src="/audio/pokemon-intro.mp3" loop preload="auto" />
      <audio ref={gameAudioRef} src="/audio/musicajuego.mp3"   loop preload="auto" />

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

      {gameState === "menu" && !showHow && (
        <StartScreen
          onPlay={() => { playMenuMusic(); goToCharacterSelect(); }}
          onAbout={() => setShowHow(true)}
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
          onSpecial={() => { /* triggerSpecial via engine */ }}
          onAction={triggerVoiceAction}
          triggerSpecial={triggerSpecial}
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

function VoiceSpecialButton({
  onSpecial,
  onAction,
  triggerSpecial,
}: {
  onSpecial: () => void;
  onAction: (key: string, duration: number) => void;
  triggerSpecial: () => void;
}) {
  void onSpecial;
  const recognitionRef   = useRef<SpeechRecognition | null>(null);
  const enabledRef       = useRef(false);
  const lastTriggerRef   = useRef(0);
  const lastIndexRef     = useRef(-1);
  const restartTimerRef  = useRef<number | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [heard,   setHeard]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "listening" | "heard" | "unsupported" | "blocked">("idle");

  const stopListening = useCallback(() => {
    enabledRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    setEnabled(false);
    setStatus("idle");
    setHeard("");
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const startListening = useCallback(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const GrammarList = window.SpeechGrammarList ?? window.webkitSpeechGrammarList;

    if (!Recognition) { setStatus("unsupported"); return; }

    const recognition = new Recognition();

    if (GrammarList) {
      const grammar = "#JSGF V1.0; grammar commands; public <command> = uno | dos | tres | cuatro | 1 | 2 | 3 | 4 | izquierda | derecha | salta | saltar | habilidad | especial | poder | ataque | fuego | trueno | magia | arriba | sube | avanza | retrocede ;";
      const list = new GrammarList();
      list.addFromString(grammar, 1);
      recognition.grammars = list;
    }

    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "es-ES";

    recognition.onresult = (event) => {
      const now = Date.now();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result     = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        if (!transcript) continue;
        if (i <= lastIndexRef.current && !result.isFinal) continue;

        const moveKey = getMovementVoiceKey(transcript);
        const special = isSpecialVoiceCommand(transcript);

        if (moveKey || special) {
          if (now - lastTriggerRef.current < 400) continue;
          lastTriggerRef.current = now;
          lastIndexRef.current   = i;

          const word = transcript.split(" ").pop() || transcript;
          setHeard(word.substring(0, 10));
          setStatus("heard");

          if (moveKey) {
            const duration = moveKey === "ArrowUp" ? 250 : 800;
            onAction(moveKey, duration);
          } else {
            triggerSpecial();
          }

          window.setTimeout(() => {
            if (enabledRef.current) { setStatus("listening"); setHeard(""); }
          }, 900);
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
      if (enabledRef.current) setStatus("listening");
    };

    recognition.onend = () => {
      if (!enabledRef.current) return;
      restartTimerRef.current = window.setTimeout(() => {
        if (!enabledRef.current) return;
        try { recognition.start(); } catch { setStatus("listening"); }
      }, 300);
    };

    recognitionRef.current = recognition;
    enabledRef.current     = true;
    setEnabled(true);
    lastIndexRef.current   = -1;
    setStatus("listening");
    try { recognition.start(); } catch { setStatus("listening"); }
  }, [onAction, triggerSpecial]);

  useEffect(() => stopListening, [stopListening]);

  const label =
    status === "unsupported" ? "Voz no disponible" :
    status === "blocked"     ? "Permite microfono" :
    status === "heard"       ? `¡${heard}!` :
    enabled                  ? "Voz activa" : "Voz";

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
