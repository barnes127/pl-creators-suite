import {
  physicsVec3,
  type PhysicsVec3,
} from "../physics";

import type { ModelingCamera } from "./types";

export function createModelingCamera(
  id = "main-camera",
  name = "Main Camera"
): ModelingCamera {
  return {
    id,
    name,
    mode: "perspective",
    position: physicsVec3(0, 0, 12),
    target: physicsVec3(0, 0, 0),
    zoom: 1,
    fovDegrees: 60,
  };
}

export function setModelingCameraPosition(
  camera: ModelingCamera,
  position: PhysicsVec3
): ModelingCamera {
  return {
    ...camera,
    position,
  };
}

export function setModelingCameraTarget(
  camera: ModelingCamera,
  target: PhysicsVec3
): ModelingCamera {
  return {
    ...camera,
    target,
  };
}

export function setModelingCameraZoom(
  camera: ModelingCamera,
  zoom: number
): ModelingCamera {
  return {
    ...camera,
    zoom: Math.max(0.1, zoom),
  };
}

export function toggleModelingCameraMode(
  camera: ModelingCamera
): ModelingCamera {
  return {
    ...camera,
    mode: camera.mode === "perspective" ? "orthographic" : "perspective",
  };
}
