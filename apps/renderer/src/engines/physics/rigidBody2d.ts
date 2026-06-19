import {
  addPhysicsVec2,
  physicsVec2,
  scalePhysicsVec2,
  subtractPhysicsVec2,
  type PhysicsVec2,
} from "./vector2";

import type { Collision2D } from "./collision2d";
import type { SimulationBody2D, SimulationWorld2D } from "./world2d";

export type CollisionResolution2D = {
  collision: Collision2D;
  resolvedA: SimulationBody2D;
  resolvedB: SimulationBody2D;
};

export function applyImpulse2D(
  body: SimulationBody2D,
  impulse: PhysicsVec2
): SimulationBody2D {
  if (body.isStatic) return body;

  const safeMass = body.mass > 0 ? body.mass : 1;

  return {
    ...body,
    velocity: addPhysicsVec2(body.velocity, scalePhysicsVec2(impulse, 1 / safeMass)),
  };
}

export function applyLinearDamping2D(
  body: SimulationBody2D,
  damping: number
): SimulationBody2D {
  if (body.isStatic) return body;

  const safeDamping = Math.min(Math.max(damping, 0), 1);

  return {
    ...body,
    velocity: scalePhysicsVec2(body.velocity, 1 - safeDamping),
  };
}

export function inverseMass2D(body: SimulationBody2D): number {
  if (body.isStatic) return 0;

  return body.mass > 0 ? 1 / body.mass : 1;
}

function chooseResolutionAxis(collision: Collision2D): "x" | "y" {
  return collision.overlapX < collision.overlapY ? "x" : "y";
}

function bodyCenter2D(body: SimulationBody2D): PhysicsVec2 {
  return {
    x: body.position.x + body.size.x / 2,
    y: body.position.y + body.size.y / 2,
  };
}

function resolvePairPositions2D(
  a: SimulationBody2D,
  b: SimulationBody2D,
  collision: Collision2D
): [SimulationBody2D, SimulationBody2D] {
  const axis = chooseResolutionAxis(collision);
  const aInvMass = inverseMass2D(a);
  const bInvMass = inverseMass2D(b);
  const totalInvMass = aInvMass + bInvMass;

  if (totalInvMass === 0) return [a, b];

  const aCenter = bodyCenter2D(a);
  const bCenter = bodyCenter2D(b);

  const direction =
    axis === "x"
      ? aCenter.x < bCenter.x
        ? -1
        : 1
      : aCenter.y < bCenter.y
        ? -1
        : 1;

  const penetration = axis === "x" ? collision.overlapX : collision.overlapY;

  const aMove = (penetration * aInvMass) / totalInvMass;
  const bMove = (penetration * bInvMass) / totalInvMass;

  const nextA = a.isStatic
    ? a
    : {
        ...a,
        position:
          axis === "x"
            ? {
                ...a.position,
                x: a.position.x + direction * aMove,
              }
            : {
                ...a.position,
                y: a.position.y + direction * aMove,
              },
      };

  const nextB = b.isStatic
    ? b
    : {
        ...b,
        position:
          axis === "x"
            ? {
                ...b.position,
                x: b.position.x - direction * bMove,
              }
            : {
                ...b.position,
                y: b.position.y - direction * bMove,
              },
      };

  return [nextA, nextB];
}

function resolvePairVelocity2D(
  a: SimulationBody2D,
  b: SimulationBody2D,
  collision: Collision2D
): [SimulationBody2D, SimulationBody2D] {
  const axis = chooseResolutionAxis(collision);

  const normal =
    axis === "x"
      ? physicsVec2(bodyCenter2D(a).x < bodyCenter2D(b).x ? -1 : 1, 0)
      : physicsVec2(0, bodyCenter2D(a).y < bodyCenter2D(b).y ? -1 : 1);

  const relativeVelocity = subtractPhysicsVec2(a.velocity, b.velocity);
  const velocityAlongNormal =
    relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

  if (velocityAlongNormal > 0) {
    return [a, b];
  }

  const restitution = Math.min(a.restitution, b.restitution);
  const aInvMass = inverseMass2D(a);
  const bInvMass = inverseMass2D(b);
  const totalInvMass = aInvMass + bInvMass;

  if (totalInvMass === 0) return [a, b];

  const impulseMagnitude = (-(1 + restitution) * velocityAlongNormal) / totalInvMass;
  const impulse = scalePhysicsVec2(normal, impulseMagnitude);

  const nextA = a.isStatic
    ? a
    : {
        ...a,
        velocity: addPhysicsVec2(a.velocity, scalePhysicsVec2(impulse, aInvMass)),
      };

  const nextB = b.isStatic
    ? b
    : {
        ...b,
        velocity: subtractPhysicsVec2(b.velocity, scalePhysicsVec2(impulse, bInvMass)),
      };

  return [nextA, nextB];
}

export function resolveCollision2D(
  a: SimulationBody2D,
  b: SimulationBody2D,
  collision: Collision2D
): CollisionResolution2D {
  const [positionA, positionB] = resolvePairPositions2D(a, b, collision);
  const [velocityA, velocityB] = resolvePairVelocity2D(positionA, positionB, collision);

  return {
    collision,
    resolvedA: applyLinearDamping2D(velocityA, velocityA.friction * 0.02),
    resolvedB: applyLinearDamping2D(velocityB, velocityB.friction * 0.02),
  };
}

export function resolveWorldCollisions2D(world: SimulationWorld2D): SimulationWorld2D {
  let nextBodies = world.bodies;

  for (const collision of world.collisions) {
    const a = nextBodies.find((body) => body.id === collision.aId);
    const b = nextBodies.find((body) => body.id === collision.bId);

    if (!a || !b) continue;

    const resolution = resolveCollision2D(a, b, collision);

    nextBodies = nextBodies.map((body) => {
      if (body.id === resolution.resolvedA.id) return resolution.resolvedA;
      if (body.id === resolution.resolvedB.id) return resolution.resolvedB;

      return body;
    });
  }

  return {
    ...world,
    bodies: nextBodies,
  };
}
