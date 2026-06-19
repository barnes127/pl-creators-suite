import {
  addPhysicsVec2,
  physicsVec2,
  scalePhysicsVec2,
  type PhysicsVec2,
} from "./vector2";

import {
  addPhysicsVec3,
  physicsVec3,
  scalePhysicsVec3,
  type PhysicsVec3,
} from "./vector3";

import type { KinematicBody2D, KinematicBody3D } from "./kinematics";

export const EARTH_GRAVITY_2D: PhysicsVec2 = physicsVec2(0, 9.80665);
export const EARTH_GRAVITY_3D: PhysicsVec3 = physicsVec3(0, -9.80665, 0);

export function forceToAcceleration2D(force: PhysicsVec2, mass: number): PhysicsVec2 {
  const safeMass = mass > 0 ? mass : 1;

  return scalePhysicsVec2(force, 1 / safeMass);
}

export function forceToAcceleration3D(force: PhysicsVec3, mass: number): PhysicsVec3 {
  const safeMass = mass > 0 ? mass : 1;

  return scalePhysicsVec3(force, 1 / safeMass);
}

export function applyForce2D(
  body: KinematicBody2D,
  force: PhysicsVec2
): KinematicBody2D {
  return {
    ...body,
    acceleration: addPhysicsVec2(
      body.acceleration,
      forceToAcceleration2D(force, body.mass)
    ),
  };
}

export function applyForce3D(
  body: KinematicBody3D,
  force: PhysicsVec3
): KinematicBody3D {
  return {
    ...body,
    acceleration: addPhysicsVec3(
      body.acceleration,
      forceToAcceleration3D(force, body.mass)
    ),
  };
}

export function applyGravity2D(
  body: KinematicBody2D,
  gravity = EARTH_GRAVITY_2D
): KinematicBody2D {
  return {
    ...body,
    acceleration: addPhysicsVec2(body.acceleration, gravity),
  };
}

export function applyGravity3D(
  body: KinematicBody3D,
  gravity = EARTH_GRAVITY_3D
): KinematicBody3D {
  return {
    ...body,
    acceleration: addPhysicsVec3(body.acceleration, gravity),
  };
}

export function clearForces2D(body: KinematicBody2D): KinematicBody2D {
  return {
    ...body,
    acceleration: physicsVec2(),
  };
}

export function clearForces3D(body: KinematicBody3D): KinematicBody3D {
  return {
    ...body,
    acceleration: physicsVec3(),
  };
}
