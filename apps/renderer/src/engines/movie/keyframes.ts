import {
  physicsVec2,
  sampleNumericKeyframes,
  sampleVec2Keyframes,
  type EasingType,
  type NumericKeyframe,
  type PhysicsVec2,
  type Vec2Keyframe,
} from "../physics";

export type MovieKeyframeValueType = "number" | "vec2";

export type MovieNumericProperty =
  | "opacity"
  | "rotation"
  | "volume"
  | "blur"
  | "brightness";

export type MovieVec2Property =
  | "position"
  | "scale"
  | "anchor"
  | "cropStart"
  | "cropEnd";

export type MovieNumericKeyframe = NumericKeyframe & {
  property: MovieNumericProperty;
};

export type MovieVec2Keyframe = Vec2Keyframe & {
  property: MovieVec2Property;
};

export type MovieClipAnimationChannels = {
  numeric: MovieNumericKeyframe[];
  vec2: MovieVec2Keyframe[];
};

export type MovieTransformSample2D = {
  time: number;
  position: PhysicsVec2;
  scale: PhysicsVec2;
  anchor: PhysicsVec2;
  cropStart: PhysicsVec2;
  cropEnd: PhysicsVec2;
  opacity: number;
  rotation: number;
  volume: number;
  blur: number;
  brightness: number;
};

export function createMovieNumericKeyframe(
  id: string,
  property: MovieNumericProperty,
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
  property: MovieVec2Property,
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

export function createEmptyMovieAnimationChannels(): MovieClipAnimationChannels {
  return {
    numeric: [],
    vec2: [],
  };
}

export function getNumericKeyframesForProperty(
  channels: MovieClipAnimationChannels,
  property: MovieNumericProperty
): MovieNumericKeyframe[] {
  return channels.numeric.filter((keyframe) => keyframe.property === property);
}

export function getVec2KeyframesForProperty(
  channels: MovieClipAnimationChannels,
  property: MovieVec2Property
): MovieVec2Keyframe[] {
  return channels.vec2.filter((keyframe) => keyframe.property === property);
}

export function sampleMovieNumericProperty(
  channels: MovieClipAnimationChannels,
  property: MovieNumericProperty,
  time: number,
  fallback: number
): number {
  const keyframes = getNumericKeyframesForProperty(channels, property);

  if (keyframes.length === 0) return fallback;

  return sampleNumericKeyframes(keyframes, time);
}

export function sampleMovieVec2Property(
  channels: MovieClipAnimationChannels,
  property: MovieVec2Property,
  time: number,
  fallback: PhysicsVec2
): PhysicsVec2 {
  const keyframes = getVec2KeyframesForProperty(channels, property);

  if (keyframes.length === 0) return fallback;

  return sampleVec2Keyframes(keyframes, time);
}

export function sampleMovieTransform2D(
  time: number,
  positionKeyframes: MovieVec2Keyframe[],
  opacityKeyframes: MovieNumericKeyframe[],
  scaleKeyframes: MovieVec2Keyframe[]
): MovieTransformSample2D {
  return sampleMovieAnimationChannels(
    {
      numeric: opacityKeyframes,
      vec2: [...positionKeyframes, ...scaleKeyframes],
    },
    time
  );
}

export function sampleMovieAnimationChannels(
  channels: MovieClipAnimationChannels,
  time: number
): MovieTransformSample2D {
  return {
    time,
    position: sampleMovieVec2Property(
      channels,
      "position",
      time,
      physicsVec2(0, 0)
    ),
    scale: sampleMovieVec2Property(channels, "scale", time, physicsVec2(1, 1)),
    anchor: sampleMovieVec2Property(channels, "anchor", time, physicsVec2(0.5, 0.5)),
    cropStart: sampleMovieVec2Property(
      channels,
      "cropStart",
      time,
      physicsVec2(0, 0)
    ),
    cropEnd: sampleMovieVec2Property(channels, "cropEnd", time, physicsVec2(1, 1)),
    opacity: sampleMovieNumericProperty(channels, "opacity", time, 1),
    rotation: sampleMovieNumericProperty(channels, "rotation", time, 0),
    volume: sampleMovieNumericProperty(channels, "volume", time, 1),
    blur: sampleMovieNumericProperty(channels, "blur", time, 0),
    brightness: sampleMovieNumericProperty(channels, "brightness", time, 1),
  };
}

export function createDemoMovieAnimationChannels(): MovieClipAnimationChannels {
  return {
    numeric: [
      createMovieNumericKeyframe("opacity-a", "opacity", 0, 0, "linear"),
      createMovieNumericKeyframe("opacity-b", "opacity", 1, 1, "easeOut"),
      createMovieNumericKeyframe("rotation-a", "rotation", 0, 0, "linear"),
      createMovieNumericKeyframe("rotation-b", "rotation", 2, 45, "easeInOut"),
      createMovieNumericKeyframe("brightness-a", "brightness", 0, 0.8, "linear"),
      createMovieNumericKeyframe("brightness-b", "brightness", 2, 1.2, "linear"),
    ],
    vec2: [
      createMovieVec2Keyframe(
        "position-a",
        "position",
        0,
        physicsVec2(0, 0),
        "easeInOut"
      ),
      createMovieVec2Keyframe(
        "position-b",
        "position",
        2,
        physicsVec2(120, 60),
        "linear"
      ),
      createMovieVec2Keyframe(
        "scale-a",
        "scale",
        0,
        physicsVec2(1, 1),
        "linear"
      ),
      createMovieVec2Keyframe(
        "scale-b",
        "scale",
        2,
        physicsVec2(1.5, 1.5),
        "easeOut"
      ),
    ],
  };
}
