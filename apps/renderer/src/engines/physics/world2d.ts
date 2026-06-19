import {
  addPhysicsVec2,
  physicsVec2,
  scalePhysicsVec2,
  type PhysicsVec2,
} from "./vector2";
import {
  findAabbCollisions2D,
  type Aabb2D,
  type Collision2D,
} from "./collision2d";
import { resolveWorldCollisions2D } from "./rigidBody2d";

export type SimulationBody2D = {
  id: string;
  name: string;
  position: PhysicsVec2;
  velocity: PhysicsVec2;
  acceleration: PhysicsVec2;
  size: PhysicsVec2;
  mass: number;
  isStatic: boolean;
  restitution: number;
  friction: number;
};

export type SimulationWorld2DSettings = {
  gravity: PhysicsVec2;
  gravityEnabled: boolean;
  fixedDeltaSeconds: number;
};

export type SimulationWorld2D = {
  id: string;
  name: string;
  timeSeconds: number;
  accumulator: number;
  bodies: SimulationBody2D[];
  collisions: Collision2D[];
  settings: SimulationWorld2DSettings;
};

export function createSimulationBody2D(
  id: string,
  name: string,
  position = physicsVec2(),
  size = physicsVec2(1, 1)
): SimulationBody2D {
  return {
    id,
    name,
    position,
    velocity: physicsVec2(),
    acceleration: physicsVec2(),
    size,
    mass: 1,
    isStatic: false,
    restitution: 0.2,
    friction: 0.5,
  };
}

export function createSimulationWorld2D(
  id = "world-2d",
  name = "2D Simulation World"
): SimulationWorld2D {
  return {
    id,
    name,
    timeSeconds: 0,
    accumulator: 0,
    bodies: [],
    collisions: [],
    settings: {
      gravity: physicsVec2(0, 9.80665),
      gravityEnabled: true,
      fixedDeltaSeconds: 1 / 60,
    },
  };
}

export function addBodyToWorld2D(
  world: SimulationWorld2D,
  body: SimulationBody2D
): SimulationWorld2D {
  const existingIndex = world.bodies.findIndex((item) => item.id === body.id);

  if (existingIndex >= 0) {
    return {
      ...world,
      bodies: world.bodies.map((item) => (item.id === body.id ? body : item)),
    };
  }

  return {
    ...world,
    bodies: [...world.bodies, body],
  };
}

export function removeBodyFromWorld2D(
  world: SimulationWorld2D,
  bodyId: string
): SimulationWorld2D {
  return {
    ...world,
    bodies: world.bodies.filter((body) => body.id !== bodyId),
    collisions: world.collisions.filter(
      (collision) => collision.aId !== bodyId && collision.bId !== bodyId
    ),
  };
}

export function clearWorldForces2D(world: SimulationWorld2D): SimulationWorld2D {
  return {
    ...world,
    bodies: world.bodies.map((body) => ({
      ...body,
      acceleration: physicsVec2(),
    })),
  };
}

export function resetWorld2D(world: SimulationWorld2D): SimulationWorld2D {
  return {
    ...world,
    timeSeconds: 0,
    accumulator: 0,
    collisions: [],
    bodies: world.bodies.map((body) => ({
      ...body,
      velocity: physicsVec2(),
      acceleration: physicsVec2(),
    })),
  };
}

export function applyWorldGravity2D(world: SimulationWorld2D): SimulationWorld2D {
  if (!world.settings.gravityEnabled) return world;

  return {
    ...world,
    bodies: world.bodies.map((body) => {
      if (body.isStatic) return body;

      return {
        ...body,
        acceleration: addPhysicsVec2(body.acceleration, world.settings.gravity),
      };
    }),
  };
}

export function stepBody2D(
  body: SimulationBody2D,
  deltaSeconds: number
): SimulationBody2D {
  if (body.isStatic) return body;

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

export function bodiesToAabbs2D(bodies: SimulationBody2D[]): Aabb2D[] {
  return bodies.map((body) => ({
    id: body.id,
    position: body.position,
    size: body.size,
  }));
}

export function detectWorldCollisions2D(
  world: SimulationWorld2D
): Collision2D[] {
  return findAabbCollisions2D(bodiesToAabbs2D(world.bodies));
}

export function stepWorldOnce2D(
  world: SimulationWorld2D,
  deltaSeconds = world.settings.fixedDeltaSeconds
): SimulationWorld2D {
  const worldWithGravity = applyWorldGravity2D(world);

  const steppedBodies = worldWithGravity.bodies.map((body) =>
    stepBody2D(body, deltaSeconds)
  );

  const nextWorld: SimulationWorld2D = {
    ...worldWithGravity,
    timeSeconds: worldWithGravity.timeSeconds + deltaSeconds,
    bodies: steppedBodies.map((body) => ({
      ...body,
      acceleration: physicsVec2(),
    })),
    collisions: [],
  };

    const worldWithCollisions = {
    ...nextWorld,
    collisions: detectWorldCollisions2D(nextWorld),
  };

  return resolveWorldCollisions2D(worldWithCollisions);
}

export function stepWorldFixed2D(
  world: SimulationWorld2D,
  frameDeltaSeconds: number,
  maxSubsteps = 5
): SimulationWorld2D {
  const fixedDeltaSeconds =
    world.settings.fixedDeltaSeconds > 0 ? world.settings.fixedDeltaSeconds : 1 / 60;

  let nextWorld = {
    ...world,
    accumulator: world.accumulator + Math.max(0, frameDeltaSeconds),
  };

  let stepsRun = 0;

  while (
    nextWorld.accumulator >= fixedDeltaSeconds &&
    stepsRun < Math.max(1, maxSubsteps)
  ) {
    nextWorld = stepWorldOnce2D(
      {
        ...nextWorld,
        accumulator: nextWorld.accumulator - fixedDeltaSeconds,
      },
      fixedDeltaSeconds
    );

    stepsRun += 1;
  }

  return nextWorld;
}

export function setWorldGravityEnabled2D(
  world: SimulationWorld2D,
  gravityEnabled: boolean
): SimulationWorld2D {
  return {
    ...world,
    settings: {
      ...world.settings,
      gravityEnabled,
    },
  };
}

export function setWorldGravity2D(
  world: SimulationWorld2D,
  gravity: PhysicsVec2
): SimulationWorld2D {
  return {
    ...world,
    settings: {
      ...world.settings,
      gravity,
    },
  };
}
