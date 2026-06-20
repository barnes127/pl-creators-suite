import type {
  ActiveMovieClip,
  MovieEngineTimeline,
} from "./types";

import {
  createDemoMovieAnimationChannels,
  sampleMovieAnimationChannels,
  type MovieTransformSample2D,
} from "./keyframes";

import { getActiveMovieClips } from "./timelineEngine";

export type MoviePreviewLayerType = "video" | "audio" | "animation" | "effects";

export type MoviePreviewLayer = {
  id: string;
  name: string;
  trackId: string;
  trackName: string;
  type: MoviePreviewLayerType;
  localTimeSeconds: number;
  progress: number;
  transform: MovieTransformSample2D;
};

export type MovieRenderPreviewState = {
  timelineId: string;
  timelineTitle: string;
  timeSeconds: number;
  width: number;
  height: number;
  fps: number;
  activeClips: ActiveMovieClip[];
  layers: MoviePreviewLayer[];
};

function toPreviewLayerType(type: string): MoviePreviewLayerType {
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

export function createMovieRenderPreviewState(
  timeline: MovieEngineTimeline,
  timeSeconds: number
): MovieRenderPreviewState {
  const activeClips = getActiveMovieClips(timeline, timeSeconds);
  const demoChannels = createDemoMovieAnimationChannels();

  const layers = activeClips.map<MoviePreviewLayer>((activeClip) => ({
    id: activeClip.clip.id,
    name: activeClip.clip.name,
    trackId: activeClip.track.id,
    trackName: activeClip.track.name,
    type: toPreviewLayerType(activeClip.track.type),
    localTimeSeconds: activeClip.localTimeSeconds,
    progress: activeClip.progress,
    transform: sampleMovieAnimationChannels(
      demoChannels,
      activeClip.localTimeSeconds
    ),
  }));

  return {
    timelineId: timeline.id,
    timelineTitle: timeline.title,
    timeSeconds,
    width: timeline.width,
    height: timeline.height,
    fps: timeline.fps,
    activeClips,
    layers,
  };
}
