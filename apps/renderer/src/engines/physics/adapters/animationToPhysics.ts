import {
  sampleNumericKeyframes,
  sampleVec2Keyframes,
  type EasingType,
  type NumericKeyframe,
  type Vec2Keyframe,
} from "../motionCurves";
import { physicsVec2, type PhysicsVec2 } from "../vector2";

export type AnimationScalarKeyframeInput = {
  id: string;
  time: number;
  value: number;
  easing?: EasingType;
};

export type AnimationPositionKeyframeInput = {
  id: string;
  time: number;
  x: number;
  y: number;
  easing?: EasingType;
};

export type SampledAnimationMotion2D = {
  time: number;
  position: PhysicsVec2;
  opacity: number;
};

export function normalizeScalarKeyframes(
  keyframes: AnimationScalarKeyframeInput[]
): NumericKeyframe[] {
  return keyframes.map((keyframe) => ({
    id: keyframe.id,
    time: keyframe.time,
    value: keyframe.value,
    easing: keyframe.easing ?? "linear",
  }));
}

export function normalizePositionKeyframes(
  keyframes: AnimationPositionKeyframeInput[]
): Vec2Keyframe[] {
  return keyframes.map((keyframe) => ({
    id: keyframe.id,
    time: keyframe.time,
    value: physicsVec2(keyframe.x, keyframe.y),
    easing: keyframe.easing ?? "linear",
  }));
}

export function sampleAnimationMotion2D(
  positionKeyframes: AnimationPositionKeyframeInput[],
  opacityKeyframes: AnimationScalarKeyframeInput[],
  time: number
): SampledAnimationMotion2D {
  return {
    time,
    position: sampleVec2Keyframes(normalizePositionKeyframes(positionKeyframes), time),
    opacity: sampleNumericKeyframes(normalizeScalarKeyframes(opacityKeyframes), time),
  };
}
