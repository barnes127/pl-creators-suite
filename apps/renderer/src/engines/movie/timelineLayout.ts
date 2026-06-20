import type {
  MovieEngineClip,
  MovieEngineTimeline,
  MovieEngineTrack,
} from "./types";

import { calculateTimelineDuration, getClipEndSeconds } from "./timelineEngine";
import { getMovieClipTimingStatus, type MovieClipTimingStatus } from "./timelineActivity";

export type MovieTimelineClipLayout = {
  clip: MovieEngineClip;
  track: MovieEngineTrack;
  leftPercent: number;
  widthPercent: number;
  status: MovieClipTimingStatus;
};

export type MovieTimelineTrackLayout = {
  track: MovieEngineTrack;
  clips: MovieTimelineClipLayout[];
};

export type MovieTimelineLayout = {
  durationSeconds: number;
  playheadPercent: number;
  tracks: MovieTimelineTrackLayout[];
};

function percentOfDuration(value: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;

  return Math.min(Math.max((value / durationSeconds) * 100, 0), 100);
}

export function getMovieTimelineLayout(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): MovieTimelineLayout {
  const durationSeconds = calculateTimelineDuration(timeline);
  const playheadPercent = percentOfDuration(timeSeconds, durationSeconds);

  const tracks = timeline.tracks.map<MovieTimelineTrackLayout>((track) => ({
    track,
    clips: track.clips.map<MovieTimelineClipLayout>((clip) => {
      const leftPercent = percentOfDuration(clip.startSeconds, durationSeconds);
      const endPercent = percentOfDuration(getClipEndSeconds(clip), durationSeconds);

      return {
        clip,
        track,
        leftPercent,
        widthPercent: Math.max(1, endPercent - leftPercent),
        status: getMovieClipTimingStatus(clip, timeSeconds),
      };
    }),
  }));

  return {
    durationSeconds,
    playheadPercent,
    tracks,
  };
}
