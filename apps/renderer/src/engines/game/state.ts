import type {
  GameComponent,
  GameRuntimeClock,
  GameRuntimeDiagnostics,
  GameRuntimeEntity,
  GameRuntimeProject,
  GameRuntimeScene,
  GameRuntimeState,
} from "./types";

export type CreateGameRuntimeProjectInput = {
  id: string;
  title: string;
  targetPlatform: string;
  genre: string;
  scenes?: GameRuntimeScene[];
};

export function createGameRuntimeClock(): GameRuntimeClock {
  return {
    status: "stopped",
    mode: "edit",
    currentTimeSeconds: 0,
    deltaSeconds: 0,
    fixedDeltaSeconds: 1 / 60,
    frame: 0,
    timeScale: 1,
  };
}

export function createGameRuntimeProject(
  input: CreateGameRuntimeProjectInput
): GameRuntimeProject {
  return {
    id: input.id,
    title: input.title,
    targetPlatform: input.targetPlatform,
    genre: input.genre,
    scenes: input.scenes ?? [],
  };
}

export function createGameRuntimeState(
  project: GameRuntimeProject,
  activeSceneId = project.scenes[0]?.id ?? null
): GameRuntimeState {
  return {
    project,
    activeSceneId,
    clock: createGameRuntimeClock(),
    selection: {
      sceneId: activeSceneId,
      entityId: null,
    },
    diagnostics: calculateGameRuntimeDiagnostics(project),
  };
}

export function getRuntimeSceneById(
  project: GameRuntimeProject,
  sceneId: string | null
): GameRuntimeScene | null {
  if (!sceneId) return null;

  return project.scenes.find((scene) => scene.id === sceneId) ?? null;
}

export function getActiveGameScene(
  state: GameRuntimeState
): GameRuntimeScene | null {
  return getRuntimeSceneById(state.project, state.activeSceneId);
}

export function getSceneEntities(
  scene: GameRuntimeScene | null
): GameRuntimeEntity[] {
  return scene?.entities ?? [];
}

export function getEntityComponents(
  entity: GameRuntimeEntity | null
): GameComponent[] {
  return entity?.components ?? [];
}

export function calculateGameRuntimeDiagnostics(
  project: GameRuntimeProject
): GameRuntimeDiagnostics {
  const warnings: string[] = [];
  const scenes = project.scenes;
  const entities = scenes.flatMap((scene) => scene.entities);
  const components = entities.flatMap((entity) => entity.components);

  if (scenes.length === 0) {
    warnings.push("Runtime project has no scenes.");
  }

  for (const scene of scenes) {
    if (scene.entities.length === 0) {
      warnings.push(`Scene "${scene.name}" has no entities.`);
    }
  }

  for (const entity of entities) {
    const hasTransform = entity.components.some(
      (component) => component.kind === "transform2d"
    );

    if (!hasTransform) {
      warnings.push(
        `Entity "${entity.name}" is missing a transform2d component.`
      );
    }
  }

  return {
    sceneCount: scenes.length,
    entityCount: entities.length,
    activeEntityCount: entities.filter((entity) => entity.active).length,
    componentCount: components.length,
    enabledComponentCount: components.filter((component) => component.enabled)
      .length,
    warnings,
  };
}

export function refreshGameRuntimeDiagnostics(
  state: GameRuntimeState
): GameRuntimeState {
  return {
    ...state,
    diagnostics: calculateGameRuntimeDiagnostics(state.project),
  };
}
