import {
  physicsVec2,
  type PhysicsVec2,
} from "./vector2";

import {
  physicsVec3,
  type PhysicsVec3,
} from "./vector3";

export type EasingType =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "step";

export type NumericKeyframe = {
  id: string;
  time: number;
  value: number;
  easing: EasingType;
};

export type Vec2Keyframe = {
  id: string;
  time: number;
  value: PhysicsVec2;
  easing: EasingType;
};

export type Vec3Keyframe = {
  id: string;
  time: number;
  value: PhysicsVec3;
  easing: EasingType;
};

export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function lerpNumber(start: number, end: number, t: number): number {
  const amount = clamp01(t);

  return start + (end - start) * amount;
}

export function inverseLerpNumber(start: number, end: number, value: number): number {
  if (start === end) return 0;

  return clamp01((value - start) / (end - start));
}

export function easeValue(t: number, easing: EasingType): number {
  const amount = clamp01(t);

  switch (easing) {
    case "linear":
      return amount;

    case "easeIn":
      return amount * amount;

    case "easeOut":
      return 1 - (1 - amount) * (1 - amount);

    case "easeInOut":
      return amount < 0.5
        ? 2 * amount * amount
        : 1 - Math.pow(-2 * amount + 2, 2) / 2;

    case "step":
      return amount >= 1 ? 1 : 0;

    default:
      return amount;
  }
}

export function interpolateNumber(
  start: number,
  end: number,
  t: number,
  easing: EasingType = "linear"
): number {
  return lerpNumber(start, end, easeValue(t, easing));
}

export function interpolateVec2(
  start: PhysicsVec2,
  end: PhysicsVec2,
  t: number,
  easing: EasingType = "linear"
): PhysicsVec2 {
  const amount = easeValue(t, easing);

  return physicsVec2(
    lerpNumber(start.x, end.x, amount),
    lerpNumber(start.y, end.y, amount)
  );
}

export function interpolateVec3(
  start: PhysicsVec3,
  end: PhysicsVec3,
  t: number,
  easing: EasingType = "linear"
): PhysicsVec3 {
  const amount = easeValue(t, easing);

  return physicsVec3(
    lerpNumber(start.x, end.x, amount),
    lerpNumber(start.y, end.y, amount),
    lerpNumber(start.z, end.z, amount)
  );
}

function sortNumericKeyframes(keyframes: NumericKeyframe[]): NumericKeyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

function sortVec2Keyframes(keyframes: Vec2Keyframe[]): Vec2Keyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

function sortVec3Keyframes(keyframes: Vec3Keyframe[]): Vec3Keyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

export function sampleNumericKeyframes(
  keyframes: NumericKeyframe[],
  time: number
): number {
  if (keyframes.length === 0) return 0;

  const sorted = sortNumericKeyframes(keyframes);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (time >= current.time && time <= next.time) {
      const localT = inverseLerpNumber(current.time, next.time, time);

      return interpolateNumber(current.value, next.value, localT, current.easing);
    }
  }

  return sorted[sorted.length - 1].value;
}

export function sampleVec2Keyframes(
  keyframes: Vec2Keyframe[],
  time: number
): PhysicsVec2 {
  if (keyframes.length === 0) return physicsVec2();

  const sorted = sortVec2Keyframes(keyframes);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (time >= current.time && time <= next.time) {
      const localT = inverseLerpNumber(current.time, next.time, time);

      return interpolateVec2(current.value, next.value, localT, current.easing);
    }
  }

  return sorted[sorted.length - 1].value;
}

export function sampleVec3Keyframes(
  keyframes: Vec3Keyframe[],
  time: number
): PhysicsVec3 {
  if (keyframes.length === 0) return physicsVec3();

  const sorted = sortVec3Keyframes(keyframes);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];

    if (time >= current.time && time <= next.time) {
      const localT = inverseLerpNumber(current.time, next.time, time);

      return interpolateVec3(current.value, next.value, localT, current.easing);
    }
  }

  return sorted[sorted.length - 1].value;
}
