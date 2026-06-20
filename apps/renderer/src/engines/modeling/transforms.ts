import {
  addPhysicsVec3,
  physicsVec3,
  scalePhysicsVec3,
  subtractPhysicsVec3,
  type PhysicsVec3,
} from "../physics";

import type { ModelingTransform3D } from "./types";

export function createModelingTransform3D(
  position: PhysicsVec3 = physicsVec3(0, 0, 0),
  rotation: PhysicsVec3 = physicsVec3(0, 0, 0),
  scale: PhysicsVec3 = physicsVec3(1, 1, 1)
): ModelingTransform3D {
  return {
    position,
    rotation,
    scale,
  };
}

export function translateModelingTransform3D(
  transform: ModelingTransform3D,
  offset: PhysicsVec3
): ModelingTransform3D {
  return {
    ...transform,
    position: addPhysicsVec3(transform.position, offset),
  };
}

export function rotateModelingTransform3D(
  transform: ModelingTransform3D,
  rotationOffset: PhysicsVec3
): ModelingTransform3D {
  return {
    ...transform,
    rotation: addPhysicsVec3(transform.rotation, rotationOffset),
  };
}

export function scaleModelingTransform3D(
  transform: ModelingTransform3D,
  scaleFactor: number
): ModelingTransform3D {
  return {
    ...transform,
    scale: scalePhysicsVec3(transform.scale, scaleFactor),
  };
}

export function getModelingObjectCenter(
  transform: ModelingTransform3D
): PhysicsVec3 {
  return transform.position;
}

export function getModelingObjectMinBounds(
  transform: ModelingTransform3D
): PhysicsVec3 {
  return subtractPhysicsVec3(
    transform.position,
    scalePhysicsVec3(transform.scale, 0.5)
  );
}

export function getModelingObjectMaxBounds(
  transform: ModelingTransform3D
): PhysicsVec3 {
  return addPhysicsVec3(
    transform.position,
    scalePhysicsVec3(transform.scale, 0.5)
  );
}
