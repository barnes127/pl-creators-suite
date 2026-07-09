import type {
  GameAudioComponent,
  GameCamera2DComponent,
  GameCollider2DComponent,
  GameCollider2DShape,
  GameComponent,
  GameComponentKind,
  GameCustomComponent,
  GameRigidbody2DComponent,
  GameScriptComponent,
  GameSprite2DComponent,
  GameTransform2D,
  GameTransform2DComponent,
  GameVec2,
} from "./types";

export function createGameVec2(x = 0, y = 0): GameVec2 {
  return { x, y };
}

export function createGameTransform2D(
  position = createGameVec2(),
  rotationDegrees = 0,
  scale = createGameVec2(1, 1)
): GameTransform2D {
  return {
    position,
    rotationDegrees,
    scale,
  };
}

export function createTransform2DComponent(
  id = `component-transform-${Date.now()}`
): GameTransform2DComponent {
  return {
    id,
    kind: "transform2d",
    enabled: true,
    transform: createGameTransform2D(),
  };
}

export function createSprite2DComponent(
  id = `component-sprite-${Date.now()}`
): GameSprite2DComponent {
  return {
    id,
    kind: "sprite2d",
    enabled: true,
    assetId: undefined,
    color: "#7c9cff",
    width: 64,
    height: 64,
    visible: true,
  };
}

export function createCollider2DComponent(
  shape: GameCollider2DShape = "box",
  id = `component-collider-${Date.now()}`
): GameCollider2DComponent {
  return {
    id,
    kind: "collider2d",
    enabled: true,
    shape,
    size: createGameVec2(64, 64),
    radius: 32,
    isTrigger: false,
  };
}

export function createRigidbody2DComponent(
  id = `component-rigidbody-${Date.now()}`
): GameRigidbody2DComponent {
  return {
    id,
    kind: "rigidbody2d",
    enabled: true,
    bodyType: "dynamic",
    velocity: createGameVec2(),
    mass: 1,
    gravityScale: 1,
  };
}

export function createScriptComponent(
  id = `component-script-${Date.now()}`
): GameScriptComponent {
  return {
    id,
    kind: "script",
    enabled: true,
    scriptId: undefined,
    properties: {},
  };
}

export function createCamera2DComponent(
  id = `component-camera-${Date.now()}`
): GameCamera2DComponent {
  return {
    id,
    kind: "camera2d",
    enabled: true,
    size: 720,
    active: true,
  };
}

export function createAudioComponent(
  id = `component-audio-${Date.now()}`
): GameAudioComponent {
  return {
    id,
    kind: "audio",
    enabled: true,
    assetId: undefined,
    volume: 1,
    loop: false,
    autoplay: false,
  };
}

export function createCustomComponent(
  type: string,
  data: Record<string, unknown> = {},
  id = `component-custom-${Date.now()}`
): GameCustomComponent {
  return {
    id,
    kind: "custom",
    enabled: true,
    type,
    data,
  };
}

export function getComponentByKind<T extends GameComponent>(
  components: GameComponent[],
  kind: GameComponentKind
): T | null {
  return (components.find((component) => component.kind === kind) as T | undefined) ?? null;
}

export function getComponentById(
  components: GameComponent[],
  componentId: string
): GameComponent | null {
  return components.find((component) => component.id === componentId) ?? null;
}

export function hasComponentKind(
  components: GameComponent[],
  kind: GameComponentKind
): boolean {
  return components.some((component) => component.kind === kind);
}

export function upsertComponent(
  components: GameComponent[],
  component: GameComponent
): GameComponent[] {
  const existingIndex = components.findIndex(
    (current) => current.id === component.id
  );

  if (existingIndex === -1) {
    return [...components, component];
  }

  return components.map((current, index) =>
    index === existingIndex ? component : current
  );
}

export function removeComponent(
  components: GameComponent[],
  componentId: string
): GameComponent[] {
  return components.filter((component) => component.id !== componentId);
}

export function setComponentEnabled(
  component: GameComponent,
  enabled: boolean
): GameComponent {
  return {
    ...component,
    enabled,
  };
}
