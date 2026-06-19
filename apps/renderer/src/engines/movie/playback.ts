import {
  clampTime,
  secondsToFrame,
  type FrameNumber,
  type TimeSeconds,
} from "../shared";

import type { MoviePlaybackState } from "./types";

export function createMoviePlaybackState(
  durationSeconds: TimeSeconds,
  fps = 24
): MoviePlaybackState {
  return {
    status: "stopped",
    currentTimeSeconds: 0,
    durationSeconds: Math.max(0, durationSeconds),
    fps: fps > 0 ? fps : 24,
    playbackRate: 1,
    loop: false,
  };
}

export function playMovieTimeline(
  state: MoviePlaybackState
): MoviePlaybackState {
  return {
    ...state,
    status: "playing",
  };
}

export function pauseMovieTimeline(
  state: MoviePlaybackState
): MoviePlaybackState {
  return {
    ...state,
    status: "paused",
  };
}

export function stopMovieTimeline(
  state: MoviePlaybackState
): MoviePlaybackState {
  return {
    ...state,
    status: "stopped",
    currentTimeSeconds: 0,
  };
}

export function seekMovieTimeline(
  state: MoviePlaybackState,
  timeSeconds: TimeSeconds
): MoviePlaybackState {
  return {
    ...state,
    currentTimeSeconds: clampTime(timeSeconds, 0, state.durationSeconds),
  };
}

export function setMoviePlaybackRate(
  state: MoviePlaybackState,
  playbackRate: number
): MoviePlaybackState {
  return {
    ...state,
    playbackRate: playbackRate > 0 ? playbackRate : 1,
  };
}

export function setMovieLoop(
  state: MoviePlaybackState,
  loop: boolean
): MoviePlaybackState {
  return {
    ...state,
    loop,
  };
}

export function advanceMoviePlayback(
  state: MoviePlaybackState,
  deltaSeconds: TimeSeconds
): MoviePlaybackState {
  if (state.status !== "playing") return state;

  const nextTime =
    state.currentTimeSeconds + Math.max(0, deltaSeconds) * state.playbackRate;

  if (nextTime >= state.durationSeconds) {
    if (state.loop && state.durationSeconds > 0) {
      return {
        ...state,
        currentTimeSeconds: nextTime % state.durationSeconds,
      };
    }

    return {
      ...state,
      status: "stopped",
      currentTimeSeconds: state.durationSeconds,
    };
  }

  return {
    ...state,
    currentTimeSeconds: clampTime(nextTime, 0, state.durationSeconds),
  };
}

export function getMoviePlaybackFrame(state: MoviePlaybackState): FrameNumber {
  return secondsToFrame(state.currentTimeSeconds, state.fps);
}
