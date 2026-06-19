import { createSimulationBody2D, type SimulationBody2D } from "../world2d";
import { physicsVec2 } from "../vector2";

export type PhysicsModelObjectInput = {
  id: string;
  name: string;
  primitive: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type ModelPhysicsAdapterOptions = {
  pixelsPerUnit?: number;
  defaultMass?: number;
  staticPrimitives?: string[];
};

export function modelObjectToPhysicsBody2D(
  object: PhysicsModelObjectInput,
  options: ModelPhysicsAdapterOptions = {}
): SimulationBody2D {
  const pixelsPerUnit = options.pixelsPerUnit ?? 1;
  const defaultMass = options.defaultMass ?? 1;
  const staticPrimitives = options.staticPrimitives ?? ["plane"];

  const width = Math.max(1, Math.abs(object.scale[0] || 1) * pixelsPerUnit);
  const height = Math.max(1, Math.abs(object.scale[1] || 1) * pixelsPerUnit);

  return {
    ...createSimulationBody2D(
      object.id,
      object.name,
      physicsVec2(object.position[0] * pixelsPerUnit, object.position[1] * pixelsPerUnit),
      physicsVec2(width, height)
    ),
    mass: defaultMass,
    isStatic: staticPrimitives.includes(object.primitive),
  };
}

export function modelObjectsToPhysicsBodies2D(
  objects: PhysicsModelObjectInput[],
  options: ModelPhysicsAdapterOptions = {}
): SimulationBody2D[] {
  return objects.map((object) => modelObjectToPhysicsBody2D(object, options));
}
