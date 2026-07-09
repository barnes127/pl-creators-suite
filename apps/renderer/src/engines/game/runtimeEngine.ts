import type {
  GameRuntimeEngine,
  GameRuntimeLoadSceneInput,
  GameRuntimeSelectEntityInput,
  GameRuntimeSetModeInput,
  GameRuntimeSetStatusInput,
  GameRuntimeStepInput,
} from "./contracts";
import {
  createGameRuntimeState,
  getActiveGameScene,
  getRuntimeSceneById,
  refreshGameRuntimeDiagnostics,
} from "./state";
import type {
  GameRuntimeProject,
  GameRuntimeScene,
  GameRuntimeState,
} from "./types";

export function createGameRuntimeEngine(
  project: GameRuntimeProject,
  activeSceneId = project.scenes[0]?.id ?? null
): GameRuntimeEngine {
  const initialState = createGameRuntimeState(project, activeSceneId);
  let state = initialState;

  function setState(nextState: GameRuntimeState): GameRuntimeState {
    state = refreshGameRuntimeDiagnostics(nextState);
    return state;
  }

  return {
    getState(): GameRuntimeState {
      return state;
    },

    getActiveScene(): GameRuntimeScene | null {
      return getActiveGameScene(state);
    },

    setStatus(input: GameRuntimeSetStatusInput): GameRuntimeState {
      return setState({
        ...state,
        clock: {
          ...state.clock,
          status: input.status,
        },
      });
    },

    setMode(input: GameRuntimeSetModeInput): GameRuntimeState {
      return setState({
        ...state,
        clock: {
          ...state.clock,
          mode: input.mode,
        },
      });
    },

    loadScene(input: GameRuntimeLoadSceneInput): GameRuntimeState {
      const nextScene = getRuntimeSceneById(state.project, input.sceneId);

      if (!nextScene) {
        return setState({
          ...state,
          diagnostics: {
            ...state.diagnostics,
            warnings: [
              ...state.diagnostics.warnings,
              `Scene "${input.sceneId}" was not found.`,
            ],
          },
        });
      }

      return setState({
        ...state,
        activeSceneId: nextScene.id,
        selection: {
          sceneId: nextScene.id,
          entityId: null,
        },
      });
    },

    selectEntity(input: GameRuntimeSelectEntityInput): GameRuntimeState {
      const scene = getRuntimeSceneById(state.project, input.sceneId);

      if (!scene) {
        return setState({
          ...state,
          selection: {
            sceneId: null,
            entityId: null,
          },
          diagnostics: {
            ...state.diagnostics,
            warnings: [
              ...state.diagnostics.warnings,
              `Scene "${input.sceneId}" was not found while selecting an entity.`,
            ],
          },
        });
      }

      const entityExists =
        input.entityId === null ||
        scene.entities.some((entity) => entity.id === input.entityId);

      if (!entityExists) {
        return setState({
          ...state,
          selection: {
            sceneId: scene.id,
            entityId: null,
          },
          diagnostics: {
            ...state.diagnostics,
            warnings: [
              ...state.diagnostics.warnings,
              `Entity "${input.entityId}" was not found in scene "${scene.name}".`,
            ],
          },
        });
      }

      return setState({
        ...state,
        selection: {
          sceneId: scene.id,
          entityId: input.entityId,
        },
      });
    },

    step(input: GameRuntimeStepInput): GameRuntimeState {
      const safeDeltaSeconds = Number.isFinite(input.deltaSeconds)
        ? Math.max(0, input.deltaSeconds)
        : 0;

      const scaledDeltaSeconds =
        state.clock.status === "playing"
          ? safeDeltaSeconds * state.clock.timeScale
          : 0;

      return setState({
        ...state,
        clock: {
          ...state.clock,
          deltaSeconds: scaledDeltaSeconds,
          currentTimeSeconds:
            state.clock.currentTimeSeconds + scaledDeltaSeconds,
          frame:
            state.clock.status === "playing"
              ? state.clock.frame + 1
              : state.clock.frame,
        },
      });
    },

    reset(): GameRuntimeState {
      state = initialState;
      return state;
    },
  };
}
