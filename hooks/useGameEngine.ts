"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine } from "@/game/GameEngine";
import { CreatureData, GameState, HUDState } from "@/types/game";

const DEFAULT_HUD: HUDState = {
  hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, score: 0, level: 1,
  creatureName: "", element: "fire",
  colors: { primary: "#FF4500", secondary: "#FF8C00", accent: "#FFD700" },
};

function stopEngine(engine: GameEngine | null) {
  if (!engine) return;

  try {
    if (typeof engine.stop === "function") {
      engine.stop();
      return;
    }

    engine.destroy();
  } catch (error) {
    console.warn("Unable to stop game engine before navigation.", error);
  }
}

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const engineRef  = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [hud,       setHud]       = useState<HUDState>(DEFAULT_HUD);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      onStateChange: (state) => setGameState(state),
      onHUDUpdate:   (h)     => setHud(h),
    });
    engineRef.current = engine;

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))
        e.preventDefault();
      engine.handleKeyDown(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e.key);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    return () => {
      engine.destroy();
      engineRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
    };
  }, [canvasRef]);

  const startGame = useCallback((creature: CreatureData, levelIndex = 0) => {
    setGameState("playing");
    engineRef.current?.startLevel(creature, levelIndex);
  }, []);

  const triggerSpecial = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.handleKeyDown("k");
    engine.handleKeyUp("k");
  }, []);

  // Stop the engine loop before navigating away from an active game
  const goToMenu = useCallback(() => {
    stopEngine(engineRef.current);
    setGameState("menu");
  }, []);

  const goToCharacterSelect = useCallback(() => {
    stopEngine(engineRef.current);
    setGameState("character-select");
  }, []);

  return { gameState, hud, startGame, triggerSpecial, goToMenu, goToCharacterSelect };
}
