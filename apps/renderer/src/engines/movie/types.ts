export type MovieEngineClip = {
  id: string;
  name: string;
  trackId: string;
  startSeconds: number;
  durationSeconds: number;
  sourceAssetId?: string;
  trimStartSeconds: number;
  trimEndSeconds: number;
  muted: boolean;
  locked: boolean;
};

export type MovieEngineTrackType = "video" | "audio" | "animation" | "effects";

export type MovieEngineTrack = {
  id: string;
  name: string;
  type: MovieEngineTrackType;
  muted: boolean;
  locked: boolean;
  clips: MovieEngineClip[];
};

export type MovieEngineTimeline = {
  id: string;
  title: string;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
  tracks: MovieEngineTrack[];
};

export type MoviePlaybackStatus = "stopped" | "playing" | "paused";

export type MoviePlaybackState = {
  status: MoviePlaybackStatus;
  currentTimeSeconds: number;
  durationSeconds: number;
  fps: number;
  playbackRate: number;
  loop: boolean;
};

export type ActiveMovieClip = {
  clip: MovieEngineClip;
  track: MovieEngineTrack;
  localTimeSeconds: number;
  progress: number;
};

export type MoviePreviewState = {
  playback: MoviePlaybackState;
  activeClips: ActiveMovieClip[];
  frame: number;
};
