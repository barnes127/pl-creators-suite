import { createSimulationBody2D, type SimulationBody2D } from "../world2d";
import { physicsVec2 } from "../vector2";

export type PhysicsGameEntityInput = {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
};

export type GamePhysicsAdapterOptions = {
  defaultSize?: number;
  defaultMass?: number;
  staticTypes?: string[];
};

function readNumberProperty(
  properties: Record<string, unknown>,
  key: string,
  fallback: number
): number {
  const value = properties[key];

  if (typeof value === "number" && Number.isFinite(value)) return value;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function gameEntityToPhysicsBody2D(
  entity: PhysicsGameEntityInput,
  options: GamePhysicsAdapterOptions = {}
): SimulationBody2D {
  const defaultSize = options.defaultSize ?? 4;
  const defaultMass = options.defaultMass ?? 1;
  const staticTypes = options.staticTypes ?? ["object", "wall", "floor"];

  const width = readNumberProperty(entity.properties, "width", defaultSize);
  const height = readNumberProperty(entity.properties, "height", defaultSize);
  const mass = readNumberProperty(entity.properties, "mass", defaultMass);

  return {
    ...createSimulationBody2D(
      entity.id,
      entity.name,
      physicsVec2(entity.x, entity.y),
      physicsVec2(width, height)
    ),
    mass,
    isStatic: staticTypes.includes(entity.type),
  };
}

export function gameEntitiesToPhysicsBodies2D(
  entities: PhysicsGameEntityInput[],
  options: GamePhysicsAdapterOptions = {}
): SimulationBody2D[] {
  return entities.map((entity) => gameEntityToPhysicsBody2D(entity, options));
}
