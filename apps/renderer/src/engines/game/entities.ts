import {
  createSprite2DComponent,
  createTransform2DComponent,
  removeComponent,
  upsertComponent,
} from "./components";
import type {
  GameComponent,
  GameComponentKind,
  GameRuntimeEntity,
  GameRuntimeScene,
} from "./types";

export type CreateGameRuntimeEntityInput = {
  id?: string;
  name: string;
  type?: string;
  active?: boolean;
  tags?: string[];
  layer?: string;
  components?: GameComponent[];
};

export function createGameRuntimeEntity(
  input: CreateGameRuntimeEntityInput
): GameRuntimeEntity {
  return {
    id: input.id ?? `entity-${Date.now()}`,
    name: input.name,
    type: input.type ?? "object",
    active: input.active ?? true,
    tags: input.tags ?? [],
    layer: input.layer ?? "default",
    components: input.components ?? [
      createTransform2DComponent(),
      createSprite2DComponent(),
    ],
  };
}

export function createEmptyGameRuntimeEntity(
  input: CreateGameRuntimeEntityInput
): GameRuntimeEntity {
  return {
    id: input.id ?? `entity-${Date.now()}`,
    name: input.name,
    type: input.type ?? "object",
    active: input.active ?? true,
    tags: input.tags ?? [],
    layer: input.layer ?? "default",
    components: input.components ?? [],
  };
}

export function getEntityById(
  scene: GameRuntimeScene | null,
  entityId: string | null
): GameRuntimeEntity | null {
  if (!scene || !entityId) return null;

  return scene.entities.find((entity) => entity.id === entityId) ?? null;
}

export function getEntityComponent(
  entity: GameRuntimeEntity | null,
  kind: GameComponentKind
): GameComponent | null {
  if (!entity) return null;

  return entity.components.find((component) => component.kind === kind) ?? null;
}

export function addEntityToScene(
  scene: GameRuntimeScene,
  entity: GameRuntimeEntity
): GameRuntimeScene {
  return {
    ...scene,
    entities: [...scene.entities, entity],
  };
}

export function removeEntityFromScene(
  scene: GameRuntimeScene,
  entityId: string
): GameRuntimeScene {
  return {
    ...scene,
    entities: scene.entities.filter((entity) => entity.id !== entityId),
  };
}

export function updateEntityInScene(
  scene: GameRuntimeScene,
  entity: GameRuntimeEntity
): GameRuntimeScene {
  return {
    ...scene,
    entities: scene.entities.map((current) =>
      current.id === entity.id ? entity : current
    ),
  };
}

export function setEntityActive(
  entity: GameRuntimeEntity,
  active: boolean
): GameRuntimeEntity {
  return {
    ...entity,
    active,
  };
}

export function setEntityLayer(
  entity: GameRuntimeEntity,
  layer: string
): GameRuntimeEntity {
  return {
    ...entity,
    layer,
  };
}

export function addEntityTag(
  entity: GameRuntimeEntity,
  tag: string
): GameRuntimeEntity {
  if (entity.tags.includes(tag)) {
    return entity;
  }

  return {
    ...entity,
    tags: [...entity.tags, tag],
  };
}

export function removeEntityTag(
  entity: GameRuntimeEntity,
  tag: string
): GameRuntimeEntity {
  return {
    ...entity,
    tags: entity.tags.filter((currentTag) => currentTag !== tag),
  };
}

export function upsertEntityComponent(
  entity: GameRuntimeEntity,
  component: GameComponent
): GameRuntimeEntity {
  return {
    ...entity,
    components: upsertComponent(entity.components, component),
  };
}

export function removeEntityComponent(
  entity: GameRuntimeEntity,
  componentId: string
): GameRuntimeEntity {
  return {
    ...entity,
    components: removeComponent(entity.components, componentId),
  };
}
