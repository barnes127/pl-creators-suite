import type { PhysicsVec2, PhysicsVec3 } from "../physics";

export type ModelingPrimitive =
  | "cube"
  | "sphere"
  | "cylinder"
  | "cone"
  | "plane"
  | "torus"
  | "custom";

export type ModelingTransform3D = {
  position: PhysicsVec3;
  rotation: PhysicsVec3;
  scale: PhysicsVec3;
};

export type ModelingObject3D = {
  id: string;
  name: string;
  primitive: ModelingPrimitive;
  transform: ModelingTransform3D;
  materialId?: string;
  visible: boolean;
  locked: boolean;
};

export type ModelingMaterial = {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metallic: number;
  opacity: number;
};

export type ModelingCameraMode = "perspective" | "orthographic";

export type ModelingCamera = {
  id: string;
  name: string;
  mode: ModelingCameraMode;
  position: PhysicsVec3;
  target: PhysicsVec3;
  zoom: number;
  fovDegrees: number;
};

export type ModelingViewportSettings = {
  width: number;
  height: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
  showObjectNames: boolean;
};

export type ModelingScene = {
  id: string;
  title: string;
  units: string;
  objects: ModelingObject3D[];
  materials: ModelingMaterial[];
  camera: ModelingCamera;
  viewport: ModelingViewportSettings;
};

export type ModelingProjectedObject = {
  object: ModelingObject3D;
  screenPosition: PhysicsVec2;
  screenSize: PhysicsVec2;
  depth: number;
  selected: boolean;
};

export type ModelingViewportState = {
  sceneId: string;
  title: string;
  camera: ModelingCamera;
  viewport: ModelingViewportSettings;
  projectedObjects: ModelingProjectedObject[];
  selectedObjectId: string | null;
};
