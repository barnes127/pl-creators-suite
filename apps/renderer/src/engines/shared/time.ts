export type TimeSeconds = number;
export type FrameNumber = number;

export type PlaybackState = {
  isPlaying: boolean;
  currentTime: TimeSeconds;
  duration: TimeSeconds;
  playbackRate: number;
};

export function clampTime(
  value: TimeSeconds,
  min: TimeSeconds,
  max: TimeSeconds
): TimeSeconds {
  return Math.min(Math.max(value, min), max);
}

export function secondsToFrame(
  seconds: TimeSeconds,
  fps: number
): FrameNumber {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 24;

  return Math.round(seconds * safeFps);
}

export function frameToSeconds(
  frame: FrameNumber,
  fps: number
): TimeSeconds {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 24;

  return frame / safeFps;
}

export function createPlaybackState(duration = 0): PlaybackState {
  return {
    isPlaying: false,
    currentTime: 0,
    duration: Math.max(0, duration),
    playbackRate: 1,
  };
}

export function advancePlayback(
  state: PlaybackState,
  deltaSeconds: TimeSeconds
): PlaybackState {
  if (!state.isPlaying) return state;

  const nextTime = clampTime(
    state.currentTime + deltaSeconds * state.playbackRate,
    0,
    state.duration
  );

  return {
    ...state,
    currentTime: nextTime,
    isPlaying: nextTime < state.duration,
  };
}
