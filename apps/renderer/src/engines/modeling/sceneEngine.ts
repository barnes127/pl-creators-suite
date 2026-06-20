import {  createEngineId } from "../shared";
import {  physicsVec3 } from "../physics";

import { createModelingCamera } from "./camera";
import { createModelingTransform3D } from "./transforms";

import type {
  ModelingMaterial,
  ModelingObject3D,
  ModelingPrimitive,
  ModelingScene,
} from "./types";

export function createDefaultModelingMaterial(): ModelingMaterial {
  return {
    id: "default-material",
    name: "Default Material",
    color: "#8b8bff",
    roughness: 0.55,
    metallic: 0,
    opacity: 1,
  };
}

export function normalizeModelingPrimitive(
  primitive: string
): ModelingPrimitive {
  if (
    primitive === "cube" ||
    primitive === "sphere" ||
    primitive === "cylinder" ||
    primitive === "cone" ||
    primitive === "plane" ||
    primitive === "torus" ||
    primitive === "custom"
  ) {
    return primitive;
  }

  return "cube";
}

export function createModelingObject3D(
  name: string,
  primitive: ModelingPrimitive = "cube"
): ModelingObject3D {
  return {
    id: createEngineId("model-object"),
    name,
    primitive,
    transform: createModelingTransform3D(),
    materialId: "default-material",
    visible: true,
    locked: false,
  };
}

export function createModelingScene(
  id: string,
  title: string,
  units = "meters"
): ModelingScene {
  return {
    id,
    title,
    units,
    objects: [],
    materials: [createDefaultModelingMaterial()],
    camera: createModelingCamera(),
    viewport: {
      width: 960,
      height: 540,
      gridEnabled: true,
      snapEnabled: false,
      showObjectNames: true,
    },
  };
}

export function addObjectToModelingScene(
  scene: ModelingScene,
  object: ModelingObject3D
): ModelingScene {
  return {
    ...scene,
    objects: [...scene.objects, object],
  };
}

export function removeObjectFromModelingScene(
  scene: ModelingScene,
  objectId: string
): ModelingScene {
  return {
    ...scene,
    objects: scene.objects.filter((object) => object.id !== objectId),
  };
}

export function updateObjectInModelingScene(
  scene: ModelingScene,
  objectId: string,
  updater: (object: ModelingObject3D) => ModelingObject3D
): ModelingScene {
  return {
    ...scene,
    objects: scene.objects.map((object) =>
      object.id === objectId ? updater(object) : object
    ),
  };
}

export type Stage3ModelObjectInput = {
  id: string;
  name: string;
  primitive: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type Stage3ModelDataInput = {
  name: string;
  title: string;
  units: string;
  gridEnabled: boolean;
  objects: Stage3ModelObjectInput[];
};

export function stage3ModelToModelingScene(
  model: Stage3ModelDataInput
): ModelingScene {
  const scene = createModelingScene(model.name, model.title, model.units);

  return {
    ...scene,
    viewport: {
      ...scene.viewport,
      gridEnabled: model.gridEnabled,
    },
    objects: model.objects.map((object) => ({
      id: object.id,
      name: object.name,
      primitive: normalizeModelingPrimitive(object.primitive),
      transform: createModelingTransform3D(
        physicsVec3(object.position[0], object.position[1], object.position[2]),
        physicsVec3(object.rotation[0], object.rotation[1], object.rotation[2]),
        physicsVec3(object.scale[0], object.scale[1], object.scale[2])
      ),
      materialId: "default-material",
      visible: true,
      locked: false,
    })),
  };
}
