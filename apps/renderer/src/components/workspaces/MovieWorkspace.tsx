import {
  Panel,
} from "../pl-ui";

import type {
  MovieData,
  MovieInfo,
} from "../../types/app";

import type {
  createMoviePlaybackState,
  createMovieRenderPreviewState,
  getMovieTimelineActivity,
  getMovieTimelineLayout,
  sampleMovieAnimationChannels,
} from "../../engines";

type MoviePlayback =
  ReturnType<
    typeof createMoviePlaybackState
  >;

type MovieTimelineActivity =
  ReturnType<
    typeof getMovieTimelineActivity
  >;

type MovieTimelineLayout =
  ReturnType<
    typeof getMovieTimelineLayout
  >;

type MovieTransformSample =
  ReturnType<
    typeof sampleMovieAnimationChannels
  >;

type MovieRenderPreviewState =
  ReturnType<
    typeof createMovieRenderPreviewState
  >;

export type MovieWorkspaceProps = {
  projectRoot: string;

  moviesList: MovieInfo[];
  newMovieName: string;
  activeMovieName: string;
  movieData: MovieData | null;
  movieDirty: boolean;

  newMovieClipName: string;
  newMovieClipTrackId: string;
  newMovieClipStart: string;
  newMovieClipDuration: string;

  setNewMovieName:
    (value: string) => void;

  setNewMovieClipName:
    (value: string) => void;

  setNewMovieClipTrackId:
    (value: string) => void;

  setNewMovieClipStart:
    (value: string) => void;

  setNewMovieClipDuration:
    (value: string) => void;

  onCreateMovie:
    () => void | Promise<void>;

  onOpenMovie:
    (name: string) =>
      void | Promise<void>;

  onSaveMovie:
    () => void | Promise<void>;

  onCloseMovie:
    () => void;

  onUpdateMovieField:
    <K extends keyof MovieData>(
      field: K,
      value: MovieData[K],
    ) => void;

  onAddMovieClip:
    () => void;

  onDeleteMovieClip:
    (
      trackId: string,
      clipId: string,
    ) => void;

  movieEngineDrawerOpen:
    boolean;

  setMovieEngineDrawerOpen:
    (
      updater:
        (current: boolean) =>
          boolean,
    ) => void;

  moviePlayback:
    MoviePlayback;

  movieFrame:
    number;

  movieTimelineActivity:
    MovieTimelineActivity | null;

  movieTimelineLayout:
    MovieTimelineLayout | null;

  movieActiveClips:
    NonNullable<
      MovieTimelineActivity
    >["activeClips"];

  movieTransformSample:
    MovieTransformSample;

  movieRenderPreviewState:
    MovieRenderPreviewState | null;

  onPlayMovieTimeline:
    () => void;

  onPauseMovieTimeline:
    () => void;

  onStopMovieTimeline:
    () => void;

  onSeekMovieTimeline:
    (timeSeconds: number) => void;
};
  
export function MovieWorkspace({
  projectRoot,
  moviesList,
  newMovieName,
  activeMovieName,
  movieData,
  movieDirty,
  movieEngineDrawerOpen,
  setMovieEngineDrawerOpen,
  moviePlayback,
  movieFrame,
  movieTimelineActivity,
  movieTimelineLayout,
  movieActiveClips,
  movieTransformSample,
  movieRenderPreviewState,

  newMovieClipName,
  newMovieClipTrackId,
  newMovieClipStart,
  newMovieClipDuration,

  setNewMovieName,
  setNewMovieClipName,
  setNewMovieClipTrackId,
  setNewMovieClipStart,
  setNewMovieClipDuration,

  onCreateMovie,
  onOpenMovie,
  onSaveMovie,
  onCloseMovie,
  onUpdateMovieField,
  onAddMovieClip,
  onDeleteMovieClip,
  onPlayMovieTimeline,
  onPauseMovieTimeline,
  onStopMovieTimeline,
  onSeekMovieTimeline,
}: MovieWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Movie Projects">
          {!projectRoot && (
            <div className="emptyState">Open a project to use Movie Studio.</div>
          )}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newMovieName}
                onChange={(e) => setNewMovieName(e.target.value)}
                placeholder="intro"
              />

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void onCreateMovie()}
              >
                New Movie
              </button>

              <div style={{ marginTop: 12 }}>
                {moviesList.length === 0 ? (
                  <div className="emptyState">No movies yet</div>
                ) : (
                  moviesList.map((movie) => (
                    <button
                      key={movie.name}
                      className={`listButton ${
                        activeMovieName === movie.name ? "listButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenMovie(movie.name)}
                    >
                      <strong>
                        {movie.name}
                        {activeMovieName === movie.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">Movie timeline</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Panel>
      </aside>

      <section className="workspaceSplitMain">
        <Panel
          title={
            activeMovieName
              ? `${activeMovieName}${movieDirty ? " *" : ""}`
              : "No movie selected"
          }
        >
          {activeMovieName && movieData ? (
            <>
              <div className="movieMeta">
                <span>
                  {movieData.width}×{movieData.height} · {movieData.fps} FPS ·{" "}
                  {movieData.durationSeconds}s
                </span>

                <span className={movieDirty ? "docsDirty" : "docsSaved"}>
                  {movieDirty ? "Unsaved changes" : "Saved"}
                </span>
              </div>

              <div className="movieFormGrid">
                <label>
                  Title
                  <input
                    className="input"
                    value={movieData.title}
                    onChange={(e) =>
                      onUpdateMovieField("title", e.target.value)
                    }
                  />
                </label>

                <label>
                  FPS
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={movieData.fps}
                    onChange={(e) =>
                      onUpdateMovieField("fps", Number(e.target.value))
                    }
                  />
                </label>

                <label>
                  Duration Seconds
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={movieData.durationSeconds}
                    onChange={(e) =>
                      onUpdateMovieField(
                        "durationSeconds",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>

                <label>
                  Width
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={movieData.width}
                    onChange={(e) =>
                      onUpdateMovieField("width", Number(e.target.value))
                    }
                  />
                </label>

                <label>
                  Height
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={movieData.height}
                    onChange={(e) =>
                      onUpdateMovieField("height", Number(e.target.value))
                    }
                  />
                </label>
              </div>

              <div className="movieClipForm">
                <div className="movieTimelineHeader">Add Timeline Clip</div>

                <div className="movieClipFormGrid">
                  <label>
                    Clip Name
                    <input
                      className="input"
                      value={newMovieClipName}
                      onChange={(e) => setNewMovieClipName(e.target.value)}
                      placeholder="Scene 1"
                    />
                  </label>

                  <label>
                    Track
                    <select
                      className="input"
                      value={newMovieClipTrackId}
                      onChange={(e) => setNewMovieClipTrackId(e.target.value)}
                    >
                      {movieData.tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Start
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={newMovieClipStart}
                      onChange={(e) => setNewMovieClipStart(e.target.value)}
                    />
                  </label>

                  <label>
                    Duration
                    <input
                      className="input"
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={newMovieClipDuration}
                      onChange={(e) => setNewMovieClipDuration(e.target.value)}
                    />
                  </label>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onAddMovieClip()}
                  >
                    Add Clip
                  </button>
                </div>
              </div>

              <div className={`movieEngineDrawer ${movieEngineDrawerOpen ? "open" : "closed"}`}>
                <div className="movieEngineDrawerHeader">
                  <button
                    className="panelTitle"
                    type="button"
                    onClick={() => setMovieEngineDrawerOpen((value) => !value)}
                  >
                    {movieEngineDrawerOpen ? "▼" : "▲"} Timeline Diagnostics
                  </button>

                  <div className="movieEngineDrawerMeta">
                    {moviePlayback.status} · frame {movieFrame} ·{" "}
                    {moviePlayback.currentTimeSeconds.toFixed(2)}s /{" "}
                    {moviePlayback.durationSeconds.toFixed(2)}s
                  </div>
                </div>

                {movieEngineDrawerOpen && (
                  <div className="movieEngineDrawerBody">
                    <div className="moviePlaybackControls">
                      <button
                        className="btn"
                        type="button"
                        onClick={onPlayMovieTimeline}
                      >
                        Play
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onPauseMovieTimeline}
                      >
                        Pause
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onStopMovieTimeline}
                      >
                        Stop
                      </button>

                      <input
                        className="movieScrubber"
                        type="range"
                        min={0}
                        max={moviePlayback.durationSeconds || 1}
                        step={1 / Math.max(moviePlayback.fps, 1)}
                        value={moviePlayback.currentTimeSeconds}
                        onChange={(e) =>
                          onSeekMovieTimeline(
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="movieRenderPreview">
                      <div className="movieRenderPreviewHeader">
                        <strong>Preview</strong>
                        <span>
                          {movieRenderPreviewState
                            ? `${movieRenderPreviewState.width}×${movieRenderPreviewState.height} @ ${movieRenderPreviewState.fps}fps`
                            : "No preview"}
                        </span>
                      </div>

                      <div className="movieRenderViewport">
                        {movieRenderPreviewState &&
                        movieRenderPreviewState.layers.length > 0 ? (
                          movieRenderPreviewState.layers.map((layer, index) => (
                            <div
                              className={`movieRenderLayer movieRenderLayer-${layer.type}`}
                              key={`${layer.trackId}-${layer.id}`}
                              style={{
                                left: `${Math.min(
                                  Math.max(
                                    10 +
                                      layer.transform.position.x /
                                        Math.max(movieRenderPreviewState.width, 1) *
                                        60,
                                    0
                                  ),
                                  80
                                )}%`,
                                top: `${Math.min(
                                  Math.max(
                                    12 +
                                      layer.transform.position.y /
                                        Math.max(movieRenderPreviewState.height, 1) *
                                        60,
                                    0
                                  ),
                                  80
                                )}%`,
                                opacity: Math.min(
                                  Math.max(layer.transform.opacity, 0),
                                  1
                                ),
                                transform: `scale(${layer.transform.scale.x}) rotate(${layer.transform.rotation}deg)`,
                                zIndex: index + 1,
                              }}
                              title={`${layer.name} · ${layer.trackName}`}
                            >
                              <strong>{layer.name}</strong>
                              <span>{layer.type}</span>
                              <span>{(layer.progress * 100).toFixed(0)}%</span>
                            </div>
                          ))
                        ) : (
                          <div className="movieRenderEmpty">
                            No active preview layers at current time
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="moviePreviewState">
                      <div className="movieTimelineActivitySummary">
                        <span>
                          Previous start:{" "}
                          {movieTimelineActivity?.previousClipStartSeconds === null ||
                          movieTimelineActivity?.previousClipStartSeconds === undefined
                            ? "none"
                            : `${movieTimelineActivity.previousClipStartSeconds.toFixed(2)}s`}
                        </span>

                        <span>
                          Next start:{" "}
                          {movieTimelineActivity?.nextClipStartSeconds === null ||
                          movieTimelineActivity?.nextClipStartSeconds === undefined
                            ? "none"
                            : `${movieTimelineActivity.nextClipStartSeconds.toFixed(2)}s`}
                        </span>

                        <span>
                          Active tracks:{" "}
                          {movieTimelineActivity
                            ? movieTimelineActivity.trackActivities.filter(
                                (trackActivity) =>
                                  trackActivity.activeClips.length > 0
                              ).length
                            : 0}
                        </span>
                      </div>
                      <div className="moviePreviewBox">
                        <strong>Active Clips</strong>

                        {movieActiveClips.length === 0 ? (
                          <span className="emptyState">
                            No clips active at current time
                          </span>
                        ) : (
                          movieActiveClips.map((activeClip) => (
                            <div
                              className="movieActiveClip"
                              key={`${activeClip.track.id}-${activeClip.clip.id}`}
                            >
                              <span>{activeClip.clip.name}</span>
                              <span>{activeClip.track.name}</span>
                              <span>
                                local {activeClip.localTimeSeconds.toFixed(2)}s
                              </span>
                              <span>
                                {(activeClip.progress * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="moviePreviewBox">
                        <strong>Transform Sample</strong>

                        <div className="movieTransformSampleGrid">
                          <span>
                            position [{movieTransformSample.position.x.toFixed(2)},{" "}
                            {movieTransformSample.position.y.toFixed(2)}]
                          </span>

                          <span>
                            scale [{movieTransformSample.scale.x.toFixed(2)},{" "}
                            {movieTransformSample.scale.y.toFixed(2)}]
                          </span>

                          <span>
                            opacity {movieTransformSample.opacity.toFixed(2)}
                          </span>

                          <span>
                            rotation {movieTransformSample.rotation.toFixed(2)}°
                          </span>

                          <span>
                            brightness {movieTransformSample.brightness.toFixed(2)}
                          </span>

                          <span>blur {movieTransformSample.blur.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="moviePreviewBox">
                        <strong>Preview Layers</strong>

                        {movieRenderPreviewState &&
                        movieRenderPreviewState.layers.length > 0 ? (
                          <div className="moviePreviewLayerList">
                            {movieRenderPreviewState.layers.map((layer) => (
                              <div
                                className="moviePreviewLayerRow"
                                key={`${layer.trackId}-${layer.id}`}
                              >
                                <span>{layer.name}</span>
                                <span>{layer.trackName}</span>
                                <span>{layer.type}</span>
                                <span>
                                  local {layer.localTimeSeconds.toFixed(2)}s
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="emptyState">No active layers</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="movieTimelinePreview">
                <div className="movieTimelineHeader">
                  Timeline Tracks ·{" "}
                  {movieTimelineLayout
                    ? `${movieTimelineLayout.durationSeconds.toFixed(2)}s`
                    : "0.00s"}
                </div>

                <div className="movieTimelineRuler">
                  <span>0s</span>
                  <span>
                    {movieTimelineLayout
                      ? `${Math.floor(movieTimelineLayout.durationSeconds / 2)}s`
                      : "0s"}
                  </span>
                  <span>
                    {movieTimelineLayout
                      ? `${movieTimelineLayout.durationSeconds.toFixed(0)}s`
                      : "0s"}
                  </span>
                </div>

                <div className="movieTimelineLayout">
                  {movieTimelineLayout && (
                    <div
                      className="movieTimelinePlayhead"
                      style={{
                        left: `${movieTimelineLayout.playheadPercent}%`,
                      }}
                    />
                  )}

                  {movieTimelineLayout?.tracks.map((trackLayout) => (
                    <div className="movieTrackLayoutRow" key={trackLayout.track.id}>
                      <div className="movieTrackLabel">
                        <strong>{trackLayout.track.name}</strong>
                        <span>
                          {trackLayout.track.type} ·{" "}
                          {trackLayout.track.clips.length} clips
                        </span>
                      </div>

                      <div className="movieTrackLane">
                        {trackLayout.clips.map((clipLayout) => (
                          <div
                            className={`movieClipBlock movieClipBlock-${clipLayout.status}`}
                            key={clipLayout.clip.id}
                            style={{
                              left: `${clipLayout.leftPercent}%`,
                              width: `${clipLayout.widthPercent}%`,
                            }}
                            title={`${clipLayout.clip.name} ${clipLayout.clip.startSeconds}s-${(
                              clipLayout.clip.startSeconds +
                              clipLayout.clip.durationSeconds
                            ).toFixed(2)}s`}
                          >
                            <span>{clipLayout.clip.name}</span>

                            <button
                              className="btn btn-danger"
                              type="button"
                              onClick={() =>
                                onDeleteMovieClip(
                                  trackLayout.track.id,
                                  clipLayout.clip.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="movieNotes">
                Notes
                <textarea
                  className="docsEditor"
                  value={movieData.notes}
                  onChange={(e) =>
                    onUpdateMovieField("notes", e.target.value)
                  }
                />
              </label>

              <div className="docsEditorActions">
                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onCloseMovie()}
                >
                  Close Movie
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void onSaveMovie()}
                >
                  Save Movie
                </button>
              </div>
            </>
          ) : (
            <div className="emptyState">Create or open a movie.</div>
          )}
        </Panel>
      </section>
    </div>
  );
}
