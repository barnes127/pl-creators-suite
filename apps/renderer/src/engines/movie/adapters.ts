import type {
  MovieEngineClip,
  MovieEngineTimeline,
  MovieEngineTrack,
  MovieEngineTrackType,
} from "./types";

import { normalizeMovieClip } from "./timelineEngine";

export type Stage3MovieClipInput = {
  id: string;
  name: string;
  startSeconds: number;
  durationSeconds: number;
};

export type Stage3MovieTrackInput = {
  id: string;
  name: string;
  type: string;
  clips: Stage3MovieClipInput[];
};

export type Stage3MovieDataInput = {
  name: string;
  title: string;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
  tracks: Stage3MovieTrackInput[];
};

function normalizeTrackType(type: string): MovieEngineTrackType {
  if (
    type === "video" ||
    type === "audio" ||
    type === "animation" ||
    type === "effects"
  ) {
    return type;
  }

  return "video";
}

export function stage3MovieToEngineTimeline(
  movie: Stage3MovieDataInput
): MovieEngineTimeline {
  const tracks: MovieEngineTrack[] = movie.tracks.map((track) => {
    const trackType = normalizeTrackType(track.type);

    return {
      id: track.id,
      name: track.name,
      type: trackType,
      muted: false,
      locked: false,
      clips: track.clips.map<MovieEngineClip>((clip) =>
        normalizeMovieClip({
          ...clip,
          trackId: track.id,
          trimStartSeconds: 0,
          trimEndSeconds: 0,
          muted: false,
          locked: false,
        })
      ),
    };
  });

  return {
    id: movie.name,
    title: movie.title,
    fps: movie.fps,
    durationSeconds: movie.durationSeconds,
    width: movie.width,
    height: movie.height,
    tracks,
  };
}
