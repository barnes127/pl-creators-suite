export type GameRuntimeStatus = "stopped" | "playing" | "paused";

export type GameRuntimeMode = "edit" | "preview" | "play";

export type GameVec2 = {
  x: number;
  y: number;
};

export type GameTransform2D = {
  position: GameVec2;
  rotationDegrees: number;
  scale: GameVec2;
};

export type GameComponentKind =
  | "transform2d"
  | "sprite2d"
  | "collider2d"
  | "rigidbody2d"
  | "script"
  | "camera2d"
  | "audio"
  | "custom";

export type GameComponentBase = {
  id: string;
  kind: GameComponentKind;
  enabled: boolean;
};

export type GameTransform2DComponent = GameComponentBase & {
  kind: "transform2d";
  transform: GameTransform2D;
};

export type GameSprite2DComponent = GameComponentBase & {
  kind: "sprite2d";
  assetId?: string;
  color: string;
  width: number;
  height: number;
  visible: boolean;
};

export type GameCollider2DShape = "box" | "circle";

export type GameCollider2DComponent = GameComponentBase & {
  kind: "collider2d";
  shape: GameCollider2DShape;
  size: GameVec2;
  radius: number;
  isTrigger: boolean;
};

export type GameRigidbody2DComponent = GameComponentBase & {
  kind: "rigidbody2d";
  bodyType: "static" | "kinematic" | "dynamic";
  velocity: GameVec2;
  mass: number;
  gravityScale: number;
};

export type GameScriptComponent = GameComponentBase & {
  kind: "script";
  scriptId?: string;
  properties: Record<string, unknown>;
};

export type GameCamera2DComponent = GameComponentBase & {
  kind: "camera2d";
  size: number;
  active: boolean;
};

export type GameAudioComponent = GameComponentBase & {
  kind: "audio";
  assetId?: string;
  volume: number;
  loop: boolean;
  autoplay: boolean;
};

export type GameCustomComponent = GameComponentBase & {
  kind: "custom";
  type: string;
  data: Record<string, unknown>;
};

export type GameComponent =
  | GameTransform2DComponent
  | GameSprite2DComponent
  | GameCollider2DComponent
  | GameRigidbody2DComponent
  | GameScriptComponent
  | GameCamera2DComponent
  | GameAudioComponent
  | GameCustomComponent;

export type GameRuntimeEntity = {
  id: string;
  name: string;
  type: string;
  active: boolean;
  tags: string[];
  layer: string;
  components: GameComponent[];
};

export type GameRuntimeScene = {
  id: string;
  name: string;
  entities: GameRuntimeEntity[];
};

export type GameRuntimeProject = {
  id: string;
  title: string;
  targetPlatform: string;
  genre: string;
  scenes: GameRuntimeScene[];
};

export type GameRuntimeClock = {
  status: GameRuntimeStatus;
  mode: GameRuntimeMode;
  currentTimeSeconds: number;
  deltaSeconds: number;
  fixedDeltaSeconds: number;
  frame: number;
  timeScale: number;
};

export type GameRuntimeSelection = {
  sceneId: string | null;
  entityId: string | null;
};

export type GameRuntimeDiagnostics = {
  sceneCount: number;
  entityCount: number;
  activeEntityCount: number;
  componentCount: number;
  enabledComponentCount: number;
  warnings: string[];
};

export type GameRuntimeState = {
  project: GameRuntimeProject;
  activeSceneId: string | null;
  clock: GameRuntimeClock;
  selection: GameRuntimeSelection;
  diagnostics: GameRuntimeDiagnostics;
};
