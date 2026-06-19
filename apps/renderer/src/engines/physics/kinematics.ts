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

export type KinematicBody2D = {
  id: string;
  position: PhysicsVec2;
  velocity: PhysicsVec2;
  acceleration: PhysicsVec2;
  mass: number;
};

export type KinematicBody3D = {
  id: string;
  position: PhysicsVec3;
  velocity: PhysicsVec3;
  acceleration: PhysicsVec3;
  mass: number;
};

export function createKinematicBody2D(
  id: string,
  position = physicsVec2()
): KinematicBody2D {
  return {
    id,
    position,
    velocity: physicsVec2(),
    acceleration: physicsVec2(),
    mass: 1,
  };
}

export function createKinematicBody3D(
  id: string,
  position = physicsVec3()
): KinematicBody3D {
  return {
    id,
    position,
    velocity: physicsVec3(),
    acceleration: physicsVec3(),
    mass: 1,
  };
}

export function stepKinematicBody2D(
  body: KinematicBody2D,
  deltaSeconds: number
): KinematicBody2D {
  const nextVelocity = addPhysicsVec2(
    body.velocity,
    scalePhysicsVec2(body.acceleration, deltaSeconds)
  );

  const nextPosition = addPhysicsVec2(
    body.position,
    scalePhysicsVec2(nextVelocity, deltaSeconds)
  );

  return {
    ...body,
    position: nextPosition,
    velocity: nextVelocity,
  };
}

export function stepKinematicBody3D(
  body: KinematicBody3D,
  deltaSeconds: number
): KinematicBody3D {
  const nextVelocity = addPhysicsVec3(
    body.velocity,
    scalePhysicsVec3(body.acceleration, deltaSeconds)
  );

  const nextPosition = addPhysicsVec3(
    body.position,
    scalePhysicsVec3(nextVelocity, deltaSeconds)
  );

  return {
    ...body,
    position: nextPosition,
    velocity: nextVelocity,
  };
}
