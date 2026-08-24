export type AppId =
  | "code"
  | "game"
  | "movie"
  | "docs"
  | "sheets"
  | "modeler";


export type AssetInfo = {
  id: string;
  name: string;
  type: string;
  relativePath: string;
  sourcePath: string;
  createdAt: string;
  updatedAt: string;
};


export type AppMetadata = {
  name: string;
  productName: string;
  version: string;
  description: string;
  appId: string;
  isPackaged: boolean;
};


export type LocalAiChatResult = {
  ok: boolean;
  message: string;
  response: string;
  model?: string;
};


export type LocalAiModel = {
  name: string;
  modifiedAt: string;
  size: number;
};


export type LocalAiStatus = {
  available: boolean;
  provider: string;
  model: string | null;
  models?: LocalAiModel[];
  reason: string;
  host?: string;
};


export type PluginInfo = {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  type: string;
  description: string;
};


export type FeatureFlags = {
  plugins: boolean;
  localAi: boolean;
  cloudSync: boolean;
  paidExtensions: boolean;
  marketplace: boolean;
};


export type NavItem = {
  id: AppId;
  label: string;
  hint: string;
};


export type DocInfo = {
  name: string;
  path: string;
};


export type CodeFileInfo = {
  name: string;
  path: string;
  language: string;
};


export type SheetInfo = {
  name: string;
  path: string;
};


export type SheetData = {
  version: number;
  name: string;
  rows: number;
  columns: number;
  cells: string[][];
  createdAt: string;
  updatedAt: string;
};


export type MovieInfo = {
  name: string;
  path: string;
};


export type MovieClip = {
  id: string;
  name: string;
  startSeconds: number;
  durationSeconds: number;
};


export type MovieTrack = {
  id: string;
  name: string;
  type: string;
  clips: MovieClip[];
};


export type MovieData = {
  version: number;
  name: string;
  title: string;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
  tracks: MovieTrack[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};


export type ModelInfo = {
  name: string;
  path: string;
};


export type ModelObject = {
  id: string;
  name: string;
  primitive: string;
  position: [
    number,
    number,
    number,
  ];
  rotation: [
    number,
    number,
    number,
  ];
  scale: [
    number,
    number,
    number,
  ];
};


export type ModelVectorField =
  | "position"
  | "rotation"
  | "scale";


export type ModelVectorAxis =
  | 0
  | 1
  | 2;


export type ModelData = {
  version: number;
  name: string;
  title: string;
  units: string;
  gridEnabled: boolean;
  objects: ModelObject[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};


export type GameInfo = {
  name: string;
  path: string;
};


export type GameEntity = {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  properties:
    Record<
      string,
      unknown
    >;
};


export type GameScene = {
  id: string;
  name: string;
  entities: GameEntity[];
};


export type GameData = {
  version: number;
  name: string;
  title: string;
  targetPlatform: string;
  genre: string;
  scenes: GameScene[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};


export type WorkflowInfo = {
  name: string;
  path: string;
};
