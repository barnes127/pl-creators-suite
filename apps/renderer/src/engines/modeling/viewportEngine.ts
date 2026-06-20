import {
  physicsVec2,
  subtractPhysicsVec3,
} from "../physics";

import type {
  ModelingObject3D,
  ModelingProjectedObject,
  ModelingScene,
  ModelingViewportState,
} from "./types";

function projectObjectToViewport(
  object: ModelingObject3D,
  scene: ModelingScene,
  selectedObjectId: string | null
): ModelingProjectedObject {
  const viewport = scene.viewport;
  const camera = scene.camera;
  const relativePosition = subtractPhysicsVec3(
    object.transform.position,
    camera.target
  );

  const zoom = Math.max(camera.zoom, 0.1);
  const depthOffset = Math.max(1, camera.position.z - object.transform.position.z);
  const perspectiveScale =
    camera.mode === "perspective" ? Math.max(0.25, 12 / depthOffset) : 1;

  const screenX =
    viewport.width / 2 + relativePosition.x * 32 * zoom * perspectiveScale;
  const screenY =
    viewport.height / 2 - relativePosition.y * 32 * zoom * perspectiveScale;

  const screenWidth = Math.max(
    12,
    Math.abs(object.transform.scale.x) * 36 * zoom * perspectiveScale
  );

  const screenHeight = Math.max(
    12,
    Math.abs(object.transform.scale.y) * 36 * zoom * perspectiveScale
  );

  return {
    object,
    screenPosition: physicsVec2(screenX, screenY),
    screenSize: physicsVec2(screenWidth, screenHeight),
    depth: object.transform.position.z,
    selected: object.id === selectedObjectId,
  };
}

export function createModelingViewportState(
  scene: ModelingScene,
  selectedObjectId: string | null = null
): ModelingViewportState {
  return {
    sceneId: scene.id,
    title: scene.title,
    camera: scene.camera,
    viewport: scene.viewport,
    selectedObjectId,
    projectedObjects: scene.objects
      .filter((object) => object.visible)
      .map((object) => projectObjectToViewport(object, scene, selectedObjectId))
      .sort((a, b) => a.depth - b.depth),
  };
}

