import {
  Panel,
} from "../pl-ui";

import type {
  GameData,
  GameInfo,
} from "../../types/app";

import type {
  GameRuntimeState,
} from "../../engines";


type GameRuntimeScene =
  GameRuntimeState["project"]["scenes"][number];

type GameRuntimeEntity =
  GameRuntimeScene["entities"][number];

export type GameWorkspaceProps = {
  projectRoot: string;

  gamesList: GameInfo[];
  newGameName: string;
  activeGameName: string;
  gameData: GameData | null;
  gameDirty: boolean;

  newGameSceneName: string;
  newGameEntityName: string;
  newGameEntityType: string;
  newGameEntitySceneId: string;

  setNewGameName:
    (value: string) => void;

  setNewGameSceneName:
    (value: string) => void;

  setNewGameEntityName:
    (value: string) => void;

  setNewGameEntityType:
    (value: string) => void;

  setNewGameEntitySceneId:
    (value: string) => void;

  onCreateGame:
    () => void | Promise<void>;

  onOpenGame:
    (name: string) =>
      void | Promise<void>;

  onSaveGame:
    () => void | Promise<void>;

  onCloseGame:
    () => void;

  onUpdateGameField:
    <K extends keyof GameData>(
      field: K,
      value: GameData[K],
    ) => void;

  onAddGameScene:
    () => void;

  onAddGameEntity:
    () => void;

  onDeleteGameEntity:
    (
      sceneId: string,
      entityId: string,
    ) => void;

  onDeleteGameScene:
    (sceneId: string) => void;

  gameRuntimeState:
    GameRuntimeState | null;

  onStartGamePreview:
    () => void;

  onPauseGamePreview:
    () => void;

  onResumeGamePreview:
    () => void;

  onStopGamePreview:
    () => void;

  onStepGamePreview:
    () => void;

  gameEngineDrawerOpen:
    boolean;

  setGameEngineDrawerOpen:
    (
      updater:
        (current: boolean) =>
          boolean,
    ) => void;

  activeGameRuntimeScene:
    GameRuntimeScene | null;

  selectedGameRuntimeScene:
    GameRuntimeScene | null;

  selectedGameRuntimeEntity:
    GameRuntimeEntity | null;

  onSelectGameRuntimeEntity:
    (
      sceneId: string,
      entityId: string,
    ) => void;
};


export function GameWorkspace({
  projectRoot,
  gamesList,
  newGameName,
  activeGameName,
  gameData,
  gameDirty,
  newGameSceneName,
  newGameEntityName,
  newGameEntityType,
  newGameEntitySceneId,
  setNewGameName,
  setNewGameSceneName,
  setNewGameEntityName,
  setNewGameEntityType,
  setNewGameEntitySceneId,
  onCreateGame,
  onOpenGame,
  onSaveGame,
  onCloseGame,
  onUpdateGameField,
  onAddGameScene,
  onAddGameEntity,
  onDeleteGameEntity,
  onDeleteGameScene,
  gameRuntimeState,
  onStartGamePreview,
  onPauseGamePreview,
  onResumeGamePreview,
  onStopGamePreview,
  onStepGamePreview,
  gameEngineDrawerOpen,
  setGameEngineDrawerOpen,
  activeGameRuntimeScene,
  selectedGameRuntimeScene,
  selectedGameRuntimeEntity,
  onSelectGameRuntimeEntity,
}: GameWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Game Projects">
          {!projectRoot && (
            <div className="emptyState">Open a project to use Game Studio.</div>
          )}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="prototype"
              />

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void onCreateGame()}
              >
                Create
              </button>

              <div style={{ marginTop: 12 }}>
                {gamesList.length === 0 ? (
                  <div className="emptyState">No games yet</div>
                ) : (
                  gamesList.map((game) => (
                    <button
                      key={game.name}
                      className={`listButton ${
                        activeGameName === game.name ? "listButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenGame(game.name)}
                    >
                      <strong>
                        {game.name}
                        {activeGameName === game.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">Game project</span>
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
            activeGameName
              ? `${activeGameName}${gameDirty ? " *" : ""}`
              : "No game selected"
          }
        >
          {activeGameName && gameData ? (
            <>
              <div className="gameMeta">
                <span>
                  {gameData.scenes.length} scenes ·{" "}
                  {gameData.scenes.reduce(
                    (total, scene) => total + scene.entities.length,
                    0
                  )}{" "}
                  entities
                </span>

                <span className={gameDirty ? "docsDirty" : "docsSaved"}>
                  {gameDirty ? "Unsaved changes" : "Saved"}
                </span>
              </div>

              <div className="gameSceneForm">
                <div className="gameSectionTitle">Runtime Preview</div>

                {gameRuntimeState ? (
                  <>
                    <div className="gameMeta">
                      <span>
                        Mode: {gameRuntimeState.clock.mode} · Status:{" "}
                        {gameRuntimeState.clock.status}
                      </span>

                      <span>
                        Time:{" "}
                        {gameRuntimeState.clock.currentTimeSeconds.toFixed(2)}s
                        {" "}· Frame: {gameRuntimeState.clock.frame}
                      </span>
                    </div>

                    <div className="gameMeta">
                      <span>
                        Runtime scenes:{" "}
                        {gameRuntimeState.diagnostics.sceneCount} · Runtime
                        entities: {gameRuntimeState.diagnostics.entityCount}
                      </span>

                      <span>
                        Components:{" "}
                        {gameRuntimeState.diagnostics.componentCount}
                      </span>
                    </div>

                    <div className="docsEditorActions">
                      <button
                        className="btn"
                        type="button"
                        onClick={onStartGamePreview}
                      >
                        Preview
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onPauseGamePreview}
                      >
                        Pause
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onResumeGamePreview}
                      >
                        Resume
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onStepGamePreview}
                      >
                        Step Frame
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={onStopGamePreview}
                      >
                        Stop
                      </button>
                    </div>

                    {gameRuntimeState.diagnostics.warnings.length > 0 && (
                      <div className="emptyState">
                        Runtime warnings:{" "}
                        {gameRuntimeState.diagnostics.warnings.join(" ")}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="emptyState">
                    Open or create a game to initialize the runtime.
                  </div>
                )}
              </div>

              <div className="gameSceneForm">
                <button
                  className="panelTitle"
                  type="button"
                  onClick={() =>
                    setGameEngineDrawerOpen((current) => !current)
                  }
                >
                  {gameEngineDrawerOpen ? "▼" : "▲"} Advanced Runtime Diagnostics
                </button>

                {gameEngineDrawerOpen && gameRuntimeState ? (
                  <div className="recentList">
                    <div className="recentItem">
                      <strong>Runtime</strong>
                      <span>
                        Mode: {gameRuntimeState.clock.mode} · Status:{" "}
                        {gameRuntimeState.clock.status}
                      </span>
                      <span>
                        Time:{" "}
                        {gameRuntimeState.clock.currentTimeSeconds.toFixed(3)}
                        s · Delta:{" "}
                        {gameRuntimeState.clock.deltaSeconds.toFixed(3)}s
                      </span>
                      <span>
                        Frame: {gameRuntimeState.clock.frame} · Time Scale:{" "}
                        {gameRuntimeState.clock.timeScale}
                      </span>
                    </div>

                    <div className="recentItem">
                      <strong>Scene State</strong>
                      <span>
                        Active Scene:{" "}
                        {activeGameRuntimeScene
                          ? activeGameRuntimeScene.name
                          : "(none)"}
                      </span>
                      <span>
                        Selected Scene:{" "}
                        {selectedGameRuntimeScene
                          ? selectedGameRuntimeScene.name
                          : "(none)"}
                      </span>
                      <span>
                        Selected Entity:{" "}
                        {selectedGameRuntimeEntity
                          ? selectedGameRuntimeEntity.name
                          : "(none)"}
                      </span>
                    </div>

                    <div className="recentItem">
                      <strong>Diagnostics</strong>
                      <span>
                        Scenes: {gameRuntimeState.diagnostics.sceneCount}
                      </span>
                      <span>
                        Entities: {gameRuntimeState.diagnostics.entityCount}
                      </span>
                      <span>
                        Active Entities:{" "}
                        {gameRuntimeState.diagnostics.activeEntityCount}
                      </span>
                      <span>
                        Components:{" "}
                        {gameRuntimeState.diagnostics.componentCount}
                      </span>
                      <span>
                        Enabled Components:{" "}
                        {
                          gameRuntimeState.diagnostics
                            .enabledComponentCount
                        }
                      </span>
                    </div>

                    <div className="recentItem">
                      <strong>Runtime Scene Graph</strong>
                      {gameRuntimeState.project.scenes.length === 0 ? (
                        <span>No runtime scenes</span>
                      ) : (
                        gameRuntimeState.project.scenes.map((scene) => (
                          <span key={scene.id}>
                            {scene.name}: {scene.entities.length} entities
                          </span>
                        ))
                      )}
                    </div>

                    {selectedGameRuntimeEntity && (
                      <div className="recentItem">
                        <strong>Selected Entity Components</strong>
                        <span>ID: {selectedGameRuntimeEntity.id}</span>
                        <span>Type: {selectedGameRuntimeEntity.type}</span>
                        <span>
                          Layer: {selectedGameRuntimeEntity.layer}
                        </span>
                        <span>
                          Tags:{" "}
                          {selectedGameRuntimeEntity.tags.length > 0
                            ? selectedGameRuntimeEntity.tags.join(", ")
                            : "(none)"}
                        </span>
                        <span>
                          Components:{" "}
                          {selectedGameRuntimeEntity.components
                            .map((component) => component.kind)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {gameRuntimeState.diagnostics.warnings.length > 0 && (
                      <div className="recentItem">
                        <strong>Warnings</strong>
                        {gameRuntimeState.diagnostics.warnings.map(
                          (warning) => (
                            <span key={warning}>{warning}</span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="emptyState">
                    {gameRuntimeState
                      ? "Advanced runtime diagnostics are closed."
                      : "Open or create a game to inspect runtime state."}
                  </div>
                )}
              </div>

              <div className="gameFormGrid">
                <label>
                  Title
                  <input
                    className="input"
                    value={gameData.title}
                    onChange={(e) =>
                      onUpdateGameField("title", e.target.value)
                    }
                  />
                </label>

                <label>
                  Target Platform
                  <select
                    className="input"
                    value={gameData.targetPlatform}
                    onChange={(e) =>
                      onUpdateGameField("targetPlatform", e.target.value)
                    }
                  >
                    <option value="desktop">desktop</option>
                    <option value="web">web</option>
                    <option value="mobile">mobile</option>
                    <option value="console">console</option>
                  </select>
                </label>

                <label>
                  Genre
                  <input
                    className="input"
                    value={gameData.genre}
                    onChange={(e) =>
                      onUpdateGameField("genre", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="gameSceneForm">
                <div className="gameSectionTitle">Add Scene</div>

                <div className="gameFormGrid">
                  <label>
                    Scene Name
                    <input
                      className="input"
                      value={newGameSceneName}
                      onChange={(e) => setNewGameSceneName(e.target.value)}
                      placeholder="Level 1"
                    />
                  </label>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onAddGameScene()}
                  >
                    Add Scene
                  </button>
                </div>
              </div>

              <div className="gameEntityForm">
                <div className="gameSectionTitle">Add Entity</div>

                <div className="gameFormGrid">
                  <label>
                    Entity Name
                    <input
                      className="input"
                      value={newGameEntityName}
                      onChange={(e) => setNewGameEntityName(e.target.value)}
                      placeholder="Player"
                    />
                  </label>

                  <label>
                    Type
                    <select
                      className="input"
                      value={newGameEntityType}
                      onChange={(e) => setNewGameEntityType(e.target.value)}
                    >
                      <option value="player">player</option>
                      <option value="enemy">enemy</option>
                      <option value="object">object</option>
                      <option value="camera">camera</option>
                      <option value="light">light</option>
                    </select>
                  </label>

                  <label>
                    Scene
                    <select
                      className="input"
                      value={newGameEntitySceneId}
                      onChange={(e) => setNewGameEntitySceneId(e.target.value)}
                    >
                      {gameData.scenes.map((scene) => (
                        <option key={scene.id} value={scene.id}>
                          {scene.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onAddGameEntity()}
                  >
                    Add Entity
                  </button>
                </div>
              </div>

              <div className="gameSceneList">
                <div className="gameSectionTitle">Scene Graph</div>

                {gameData.scenes.map((scene) => (
                  <div className="gameSceneBlock" key={scene.id}>
                    <div className="gameSceneHeader">
                      <strong>{scene.name}</strong>

                      <span>{scene.entities.length} entities</span>

                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => onDeleteGameScene(scene.id)}
                      >
                        Delete Scene
                      </button>
                    </div>

                    {scene.entities.length === 0 ? (
                      <div className="emptyState">No entities yet</div>
                    ) : (
                      <div className="gameEntityList">
                        {scene.entities.map((entity) => (
                          <div
                            className="gameEntityCard"
                            key={entity.id}
                            onClick={() =>
                              onSelectGameRuntimeEntity(
                                scene.id,
                                entity.id,
                              )
                            }
                          >

                            <button
                              className="btn btn-danger"
                              type="button"
                              onClick={() => onDeleteGameEntity(scene.id, entity.id)}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <label className="gameNotes">
                Notes
                <textarea
                  className="docsEditor"
                  value={gameData.notes}
                  onChange={(e) =>
                    onUpdateGameField("notes", e.target.value)
                  }
                />
              </label>

              <div className="docsEditorActions">
                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onCloseGame()}
                >
                  Close Game
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void onSaveGame()}
                >
                  Save Game
                </button>
              </div>
            </>
          ) : (
            <div className="emptyState">Create or open a game.</div>
          )}
        </Panel>
      </section>
    </div>
  );
}
