import type {
  ActiveMovieClip,
  MovieEngineClip,
  MovieEngineTimeline,
  MovieEngineTrack,
} from "./types";

import {
  getActiveMovieClips,
  getClipEndSeconds,
  getClipProgress,
  isClipActiveAtTime,
} from "./timelineEngine";

export type MovieClipTimingStatus = "past" | "active" | "upcoming";

export type MovieClipActivity = {
  clip: MovieEngineClip;
  track: MovieEngineTrack;
  status: MovieClipTimingStatus;
  startSeconds: number;
  endSeconds: number;
  progress: number;
};

export type MovieTrackActivity = {
  track: MovieEngineTrack;
  activeClips: ActiveMovieClip[];
  clipActivities: MovieClipActivity[];
};

export type MovieTimelineActivity = {
  timeSeconds: number;
  activeClips: ActiveMovieClip[];
  trackActivities: MovieTrackActivity[];
  nextClipStartSeconds: number | null;
  previousClipStartSeconds: number | null;
};

export function getMovieClipTimingStatus(
  clip: MovieEngineClip,
  timeSeconds: number
): MovieClipTimingStatus {
  if (isClipActiveAtTime(clip, timeSeconds)) return "active";
  if (timeSeconds < clip.startSeconds) return "upcoming";

  return "past";
}

export function getNextClipStartSeconds(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): number | null {
  let nextStart: number | null = null;

  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.startSeconds <= timeSeconds) continue;

      if (nextStart === null || clip.startSeconds < nextStart) {
        nextStart = clip.startSeconds;
      }
    }
  }

  return nextStart;
}

export function getPreviousClipStartSeconds(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): number | null {
  let previousStart: number | null = null;

  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.startSeconds >= timeSeconds) continue;

      if (previousStart === null || clip.startSeconds > previousStart) {
        previousStart = clip.startSeconds;
      }
    }
  }

  return previousStart;
}

export function getMovieTimelineActivity(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): MovieTimelineActivity {
  const activeClips = getActiveMovieClips(timeline, timeSeconds);

  const trackActivities = timeline.tracks.map<MovieTrackActivity>((track) => {
    const trackActiveClips = activeClips.filter(
      (activeClip) => activeClip.track.id === track.id
    );

    const clipActivities = track.clips.map<MovieClipActivity>((clip) => ({
      clip,
      track,
      status: getMovieClipTimingStatus(clip, timeSeconds),
      startSeconds: clip.startSeconds,
      endSeconds: getClipEndSeconds(clip),
      progress: getClipProgress(clip, timeSeconds),
    }));

    return {
      track,
      activeClips: trackActiveClips,
      clipActivities,
    };
  });

  return {
    timeSeconds,
    activeClips,
    trackActivities,
    nextClipStartSeconds: getNextClipStartSeconds(timeline, timeSeconds),
    previousClipStartSeconds: getPreviousClipStartSeconds(timeline, timeSeconds),
  };
}
