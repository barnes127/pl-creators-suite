import type { GameRuntimeEngine } from "./contracts";
import type { GameRuntimeState } from "./types";

export type GamePreviewStepOptions = {
  deltaSeconds?: number;
};

export function startGamePreview(
  engine: GameRuntimeEngine
): GameRuntimeState {
  engine.setMode({ mode: "preview" });
  return engine.setStatus({ status: "playing" });
}

export function startGamePlayMode(
  engine: GameRuntimeEngine
): GameRuntimeState {
  engine.setMode({ mode: "play" });
  return engine.setStatus({ status: "playing" });
}

export function pauseGamePreview(
  engine: GameRuntimeEngine
): GameRuntimeState {
  return engine.setStatus({ status: "paused" });
}

export function resumeGamePreview(
  engine: GameRuntimeEngine
): GameRuntimeState {
  return engine.setStatus({ status: "playing" });
}

export function stopGamePreview(
  engine: GameRuntimeEngine
): GameRuntimeState {
  engine.setStatus({ status: "stopped" });
  engine.setMode({ mode: "edit" });
  return engine.reset();
}

export function resetGamePreview(
  engine: GameRuntimeEngine
): GameRuntimeState {
  return engine.reset();
}

export function stepGamePreviewFrame(
  engine: GameRuntimeEngine,
  options: GamePreviewStepOptions = {}
): GameRuntimeState {
  const state = engine.getState();
  const deltaSeconds = options.deltaSeconds ?? state.clock.fixedDeltaSeconds;

  return engine.step({ deltaSeconds });
}
