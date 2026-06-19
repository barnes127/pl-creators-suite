import type {
  ActiveMovieClip,
  MovieEngineClip,
  MovieEngineTimeline,
  MoviePreviewState,
} from "./types";

import {
  createMoviePlaybackState,
  getMoviePlaybackFrame,
} from "./playback";

export function normalizeMovieClip(
  clip: Partial<MovieEngineClip> & {
    id: string;
    name: string;
    trackId: string;
    startSeconds: number;
    durationSeconds: number;
  }
): MovieEngineClip {
  return {
    id: clip.id,
    name: clip.name,
    trackId: clip.trackId,
    startSeconds: Math.max(0, Number(clip.startSeconds) || 0),
    durationSeconds: Math.max(0, Number(clip.durationSeconds) || 0),
    sourceAssetId: clip.sourceAssetId,
    trimStartSeconds: Math.max(0, Number(clip.trimStartSeconds) || 0),
    trimEndSeconds: Math.max(0, Number(clip.trimEndSeconds) || 0),
    muted: Boolean(clip.muted),
    locked: Boolean(clip.locked),
  };
}

export function getClipEndSeconds(clip: MovieEngineClip): number {
  return clip.startSeconds + clip.durationSeconds;
}

export function isClipActiveAtTime(
  clip: MovieEngineClip,
  timeSeconds: number
): boolean {
  return (
    timeSeconds >= clip.startSeconds &&
    timeSeconds < clip.startSeconds + clip.durationSeconds
  );
}

export function getClipLocalTimeSeconds(
  clip: MovieEngineClip,
  timeSeconds: number
): number {
  return Math.max(0, timeSeconds - clip.startSeconds + clip.trimStartSeconds);
}

export function getClipProgress(
  clip: MovieEngineClip,
  timeSeconds: number
): number {
  if (clip.durationSeconds <= 0) return 0;

  const rawProgress = (timeSeconds - clip.startSeconds) / clip.durationSeconds;

  return Math.min(Math.max(rawProgress, 0), 1);
}

export function getActiveMovieClips(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): ActiveMovieClip[] {
  const activeClips: ActiveMovieClip[] = [];

  for (const track of timeline.tracks) {
    if (track.muted) continue;

    for (const clip of track.clips) {
      if (clip.muted) continue;
      if (!isClipActiveAtTime(clip, timeSeconds)) continue;

      activeClips.push({
        clip,
        track,
        localTimeSeconds: getClipLocalTimeSeconds(clip, timeSeconds),
        progress: getClipProgress(clip, timeSeconds),
      });
    }
  }

  return activeClips;
}

export function calculateTimelineDuration(
  timeline: MovieEngineTimeline
): number {
  const clipEnd = timeline.tracks.reduce((maxEnd, track) => {
    const trackEnd = track.clips.reduce(
      (trackMaxEnd, clip) => Math.max(trackMaxEnd, getClipEndSeconds(clip)),
      0
    );

    return Math.max(maxEnd, trackEnd);
  }, 0);

  return Math.max(timeline.durationSeconds, clipEnd);
}

export function createMoviePreviewState(
  timeline: MovieEngineTimeline,
  timeSeconds = 0
): MoviePreviewState {
  const durationSeconds = calculateTimelineDuration(timeline);
  const playback = createMoviePlaybackState(durationSeconds, timeline.fps);

  const previewPlayback = {
    ...playback,
    currentTimeSeconds: Math.min(Math.max(timeSeconds, 0), durationSeconds),
  };

  return {
    playback: previewPlayback,
    activeClips: getActiveMovieClips(timeline, previewPlayback.currentTimeSeconds),
    frame: getMoviePlaybackFrame(previewPlayback),
  };
}
