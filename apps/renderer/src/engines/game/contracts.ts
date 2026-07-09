import type {
  GameRuntimeMode,
  GameRuntimeScene,
  GameRuntimeState,
  GameRuntimeStatus,
} from "./types";

export type GameRuntimeStepInput = {
  deltaSeconds: number;
};

export type GameRuntimeLoadSceneInput = {
  sceneId: string;
};

export type GameRuntimeSelectEntityInput = {
  sceneId: string;
  entityId: string | null;
};

export type GameRuntimeSetStatusInput = {
  status: GameRuntimeStatus;
};

export type GameRuntimeSetModeInput = {
  mode: GameRuntimeMode;
};

export type GameRuntimeEngine = {
  getState(): GameRuntimeState;
  getActiveScene(): GameRuntimeScene | null;
  setStatus(input: GameRuntimeSetStatusInput): GameRuntimeState;
  setMode(input: GameRuntimeSetModeInput): GameRuntimeState;
  loadScene(input: GameRuntimeLoadSceneInput): GameRuntimeState;
  selectEntity(input: GameRuntimeSelectEntityInput): GameRuntimeState;
  step(input: GameRuntimeStepInput): GameRuntimeState;
  reset(): GameRuntimeState;
};
