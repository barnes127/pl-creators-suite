import {
  sampleNumericKeyframes,
  sampleVec2Keyframes,
  type EasingType,
  type NumericKeyframe,
  type Vec2Keyframe,
} from "../physics";

import { physicsVec2, type PhysicsVec2 } from "../physics";

export type MovieKeyframeValueType = "number" | "vec2";

export type MovieNumericKeyframe = NumericKeyframe & {
  property: string;
};

export type MovieVec2Keyframe = Vec2Keyframe & {
  property: string;
};

export type MovieTransformSample2D = {
  time: number;
  position: PhysicsVec2;
  opacity: number;
  scale: PhysicsVec2;
};

export function createMovieNumericKeyframe(
  id: string,
  property: string,
  time: number,
  value: number,
  easing: EasingType = "linear"
): MovieNumericKeyframe {
  return {
    id,
    property,
    time,
    value,
    easing,
  };
}

export function createMovieVec2Keyframe(
  id: string,
  property: string,
  time: number,
  value: PhysicsVec2,
  easing: EasingType = "linear"
): MovieVec2Keyframe {
  return {
    id,
    property,
    time,
    value,
    easing,
  };
}

export function sampleMovieTransform2D(
  time: number,
  positionKeyframes: MovieVec2Keyframe[],
  opacityKeyframes: MovieNumericKeyframe[],
  scaleKeyframes: MovieVec2Keyframe[]
): MovieTransformSample2D {
  return {
    time,
    position: sampleVec2Keyframes(positionKeyframes, time),
    opacity:
      opacityKeyframes.length > 0
        ? sampleNumericKeyframes(opacityKeyframes, time)
        : 1,
    scale:
      scaleKeyframes.length > 0
        ? sampleVec2Keyframes(scaleKeyframes, time)
        : physicsVec2(1, 1),
  };
}
