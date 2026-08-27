import {
  Panel,
} from "../pl-ui";

import {
  ThreeModelViewport,
} from "../modeling";

import type {
  ModelData,
  ModelInfo,
  ModelVectorField,
  ModelVectorAxis,
} from "../../types/app";

import type {
  ModelingCamera,
  stage3ModelToModelingScene,
  createModelingViewportState,
} from "../../engines";


type ModelingScene =
  ReturnType<
    typeof stage3ModelToModelingScene
  >;

type ModelingViewportState =
  ReturnType<
    typeof createModelingViewportState
  >;

type ModelingObject =
  NonNullable<
    ModelingScene
  >["objects"][number];


export type ModelingWorkspaceProps = {
  projectRoot: string;

  modelsList: ModelInfo[];
  newModelName: string;
  activeModelName: string;
  modelData: ModelData | null;
  modelDirty: boolean;

  newModelObjectName: string;
  newModelPrimitive: string;

  setNewModelName:
    (value: string) => void;

  setNewModelObjectName:
    (value: string) => void;

  setNewModelPrimitive:
    (value: string) => void;

  onCreateModel:
    () => void | Promise<void>;

  onOpenModel:
    (name: string) =>
      void | Promise<void>;

  onSaveModel:
    () => void | Promise<void>;

  onCloseModel:
    () => void;

  onUpdateModelField:
    <K extends keyof ModelData>(
      field: K,
      value: ModelData[K],
    ) => void;

  onUpdateModelObjectVector:
    (
      objectId: string,
      field: ModelVectorField,
      axis: ModelVectorAxis,
      value: number,
    ) => void;

  onAddModelObject:
    () => void;

  onDeleteModelObject:
    (objectId: string) => void;

  selectedModelObjectId:
    string | null;

  setSelectedModelObjectId:
    (value: string | null) => void;

  selectedModelObject:
    ModelingObject | null;

  modelEngineDrawerOpen:
    boolean;

  setModelEngineDrawerOpen:
    (
      updater:
        (current: boolean) =>
          boolean,
    ) => void;

  modelViewportCamera:
    ModelingCamera;

  modelingScene:
    ModelingScene | null;

  modelingViewportScene:
    ModelingScene | null;

  modelingViewportState:
    ModelingViewportState | null;

  visibleModelObjects:
    number;

  lockedModelObjects:
    number;

  onZoomModelViewport:
    (delta: number) => void;

  onResetModelViewportCamera:
    () => void;

  onToggleModelViewportCameraMode:
    () => void;

  onNudgeModelViewportCamera:
    (
      dx: number,
      dy: number,
      dz?: number,
    ) => void;

  onSetModelViewportView:
    (
      view:
        "front" |
        "top" |
        "right",
    ) => void;

  onFrameSelectedModelObject:
    () => void;
};


export function ModelingWorkspace({
  projectRoot,

  modelsList,
  newModelName,
  activeModelName,
  modelData,
  modelDirty,

  newModelObjectName,
  newModelPrimitive,

  setNewModelName,
  setNewModelObjectName,
  setNewModelPrimitive,

  onCreateModel,
  onOpenModel,
  onSaveModel,
  onCloseModel,
  onUpdateModelField,
  onUpdateModelObjectVector,
  onAddModelObject,
  onDeleteModelObject,

  selectedModelObjectId,
  setSelectedModelObjectId,
  selectedModelObject,

  modelEngineDrawerOpen,
  setModelEngineDrawerOpen,

  modelViewportCamera,

  modelingScene,
  modelingViewportScene,
  modelingViewportState,

  visibleModelObjects,
  lockedModelObjects,

  onZoomModelViewport,
  onResetModelViewportCamera,
  onToggleModelViewportCameraMode,
  onNudgeModelViewportCamera,
  onSetModelViewportView,
  onFrameSelectedModelObject,
}: ModelingWorkspaceProps) {
  return (
    <div className="workspaceSplit">
      <aside className="workspaceSplitSide">
        <Panel title="Model Library">
          {!projectRoot && (
            <div className="emptyState">Open a project to use Modeling Studio.</div>
          )}

          {projectRoot && (
            <>
              <input
                className="input"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="scene"
              />

              <button
                className="btn btn-primary"
                type="button"
                onClick={() => void onCreateModel()}
              >
                New Scene
              </button>

              <div style={{ marginTop: 12 }}>
                {modelsList.length === 0 ? (
                  <div className="emptyState">No model scenes yet</div>
                ) : (
                  modelsList.map((model) => (
                    <button
                      key={model.name}
                      className={`listButton ${
                        activeModelName === model.name ? "listButtonActive" : ""
                      }`}
                      type="button"
                      onClick={() => void onOpenModel(model.name)}
                    >
                      <strong>
                        {model.name}
                        {activeModelName === model.name ? " ✓" : ""}
                      </strong>
                      <span className="listButtonMeta">3D scene</span>
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
            activeModelName
              ? `${activeModelName}${modelDirty ? " *" : ""}`
              : "No model scene selected"
          }
        >
          {activeModelName && modelData ? (
            <>
              <div className="modelMeta">
                <span>
                  {modelData.objects.length} objects · units: {modelData.units}
                </span> 
                <span className={modelDirty ? "docsDirty" : "docsSaved"}>
                  {modelDirty ? "Unsaved changes" : "Saved"}
                </span>
              </div>

              <div className="modelFormGrid">
                <label>
                  Title
                  <input
                    className="input"
                    value={modelData.title}
                    onChange={(e) =>
                      onUpdateModelField("title", e.target.value)
                    }
                  />
                </label>

                <label>
                  Units
                  <select
                    className="input"
                    value={modelData.units}
                    onChange={(e) =>
                      onUpdateModelField("units", e.target.value)
                    }
                  >
                    <option value="meters">meters</option>
                    <option value="centimeters">centimeters</option>
                    <option value="millimeters">millimeters</option>
                    <option value="inches">inches</option>
                  </select>
                </label>

                <label className="modelCheckbox"> 
                  <input
                    type="checkbox"
                    checked={modelData.gridEnabled}
                    onChange={(e) =>
                      onUpdateModelField("gridEnabled", e.target.checked)
                    }
                  />
                  Grid enabled
                </label>
              </div>

              <div className="modelPreviewBox">
                <div className="modelPreviewTitle">Viewport</div>
                <div className="modelPreviewGrid">
                  {modelData.objects.length === 0 ? (
                    <div className="emptyState">No objects yet</div>
                  ) : (
                    modelData.objects.map((object) => (
                      <div
                        className={
                          selectedModelObjectId === object.id
                            ? "modelObject modelObjectSelected"
                            : "modelObject"
                        }
                        key={object.id}
                      >
                        <strong>{object.name}</strong>
                        <span>{object.primitive}</span>
                        <span>pos [{object.position.join(", ")}]</span>
                        <span>scale [{object.scale.join(", ")}]</span>

                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => setSelectedModelObjectId(object.id)}
                        >
                          Select
                        </button>

                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => onDeleteModelObject(object.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="modelObjectForm">
                <div className="modelSectionTitle">Add Primitive Object</div>

                <div className="modelObjectFormGrid">
                  <label>
                    Object Name
                    <input
                      className="input"
                      value={newModelObjectName}
                      onChange={(e) => setNewModelObjectName(e.target.value)}
                      placeholder="Cube 1"
                    />
                  </label>


                  <label>
                    Primitive
                    <select
                      className="input"
                      value={newModelPrimitive}
                      onChange={(e) => setNewModelPrimitive(e.target.value)}
                    >
                      <option value="cube">Cube</option>
                      <option value="sphere">Sphere</option>
                      <option value="plane">Plane</option>
                      <option value="cylinder">Cylinder</option>
                      <option value="cone">Cone</option>
                    </select>
                  </label>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onAddModelObject()}
                  >
                    Add Object
                  </button>
                </div>
              </div>

              <div className="modelViewportPanel">
                <div className="modelViewportHeader">
                  <strong>3D Viewport</strong>
                  <span>
                    {modelingScene
                      ? `${modelingScene.objects.length} objects · ${modelingScene.units}`
                      : "No scene"}
                  </span>
                </div>

                <div className="modelCameraControls">
                  <div className="modelCameraMeta">
                    <span>mode: {modelViewportCamera.mode}</span>
                      <span>zoom: {modelViewportCamera.zoom.toFixed(2)}</span>
                      <span>
                        pos [{modelViewportCamera.position.x.toFixed(2)},{" "}
                        {modelViewportCamera.position.y.toFixed(2)},{" "}
                        {modelViewportCamera.position.z.toFixed(2)}]
                      </span>
                      <span>
                        target [{modelViewportCamera.target.x.toFixed(2)},{" "}
                        {modelViewportCamera.target.y.toFixed(2)},{" "}
                        {modelViewportCamera.target.z.toFixed(2)}]
                      </span>
                  </div>

                  <div className="modelCameraButtons">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onZoomModelViewport(0.2)}
                    >
                      Zoom In
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onZoomModelViewport(-0.2)}
                    >
                      Zoom Out
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={onToggleModelViewportCameraMode}
                    >
                      Toggle {modelViewportCamera.mode === "perspective" ? "Ortho" : "Perspective"}
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={onResetModelViewportCamera}
                    >
                      Reset Camera
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onSetModelViewportView("front")}
                    >
                      Front View
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onSetModelViewportView("top")}
                    >
                      Top View
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onSetModelViewportView("right")}
                    >
                      Right View
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={onFrameSelectedModelObject}
                      disabled={!selectedModelObject}
                    >
                      Frame Selected
                    </button>
                  </div>

                  <div className="modelCameraNudgeGrid">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(0, 1)}
                    >
                      Up
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(-1, 0)}
                    >

                      Left
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(1, 0)}
                    >
                      Right
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(0, -1)}
                    >
                      Down
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(0, 0, 1)}
                    >
                      Back
                    </button>

                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => onNudgeModelViewportCamera(0, 0, -1)}
                    >

                      Forward
                    </button>
                  </div>
                </div>

                {modelingViewportScene ? (
                  <ThreeModelViewport
                    scene={modelingViewportScene}
                    selectedObjectId={selectedModelObjectId}
                    onSelectObject={setSelectedModelObjectId}
                  />
                ) : (
                  <div className="emptyState">No modeling scene loaded.</div>
                )}

                <div className="modelTransformInspector">
                  <div className="modelTransformInspectorHeader">
                    <strong>Transform Inspector</strong>
                    {selectedModelObject ? (
                      <span>
                        {selectedModelObject.name} · {selectedModelObject.primitive}
                      </span>
                    ) : (
                      <span>No object selected</span>
                    )}
                  </div>

                  {selectedModelObject ? (
                    <>
                      <div className="modelTransformInspectorGrid">
                        {(["position", "rotation", "scale"] as ModelVectorField[]).map((field) => (
                          <div className="modelTransformGroup" key={field}>

                            <strong>{field}</strong>

                            {(["X", "Y", "Z"] as const).map((axisLabel, axisIndex) => {
                              const axis = axisIndex as ModelVectorAxis;
                              const axisKey = axisLabel.toLowerCase() as "x" | "y" | "z";
                              const value = selectedModelObject.transform[field][axisKey];

                              return (
                                <label key={`${field}-${axisLabel}`}>
                                  {axisLabel}
                                  <input
                                    className="input"
                                    type="number"
                                    step={field === "rotation" ? 5 : 0.1}
                                    min={field === "scale" ? 0.01 : undefined}
                                    value={value}
                                    onChange={(event) =>
                                      onUpdateModelObjectVector(
                                        selectedModelObject.id,
                                        field,
                                        axis,
                                        Number(event.target.value)
                                      )
                                    }
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className={`modelEngineDrawer ${modelEngineDrawerOpen ? "open" : "closed"}`}>
                        <div className="modelEngineDrawerHeader">
                          <button
                            className="panelTitle"
                            type="button"
                            onClick={() => setModelEngineDrawerOpen((value) => !value)}
                          >
                            {modelEngineDrawerOpen ? "▼" : "▲"} Modeling Engine
                          </button>

                          <div className="modelEngineDrawerMeta">
                            {modelingScene
                              ? `${modelingScene.objects.length} objects · ${modelViewportCamera.mode}`
                              : "No scene"}
                          </div>
                        </div>

                        {modelEngineDrawerOpen && (
                          <div className="modelEngineDrawerBody">
                            <div className="modelEngineDebugGrid">
                              <div className="modelEngineDebugCard">
                                <strong>Scene</strong>
                                <span>id: {modelingScene?.id ?? "none"}</span>
                                <span>title: {modelingScene?.title ?? "none"}</span>
                                <span>units: {modelingScene?.units ?? "none"}</span>
                                <span>materials: {modelingScene?.materials.length ?? 0}</span>
                              </div>

                              <div className="modelEngineDebugCard">
                                <strong>Objects</strong>
                                <span>total: {modelingScene?.objects.length ?? 0}</span>
                                <span>visible: {visibleModelObjects}</span>
                                <span>locked: {lockedModelObjects}</span>
                                <span>
                                  selected: {selectedModelObject ? selectedModelObject.name : "none"}
                                </span>
                              </div>

                              <div className="modelEngineDebugCard">
                                <strong>Camera</strong>
                                <span>mode: {modelViewportCamera.mode}</span>
                                <span>zoom: {modelViewportCamera.zoom.toFixed(2)}</span>
                                <span>
                                  pos [{modelViewportCamera.position.x.toFixed(2)},{" "}
                                  {modelViewportCamera.position.y.toFixed(2)},{" "}
                                  {modelViewportCamera.position.z.toFixed(2)}]
                                </span>
                                <span>
                                  target [{modelViewportCamera.target.x.toFixed(2)},{" "}
                                  {modelViewportCamera.target.y.toFixed(2)},{" "}
                                  {modelViewportCamera.target.z.toFixed(2)}]
                                </span>
                              </div>

                              <div className="modelEngineDebugCard">
                                <strong>Viewport</strong>
                                <span>
                                  size: {modelingViewportState?.viewport.width ?? 0}×
                                  {modelingViewportState?.viewport.height ?? 0}
                                </span>
                                <span>
                                  grid: {modelingViewportState?.viewport.gridEnabled ? "on" : "off"}
                                </span>
                                <span>
                                  snap: {modelingViewportState?.viewport.snapEnabled ? "on" : "off"}
                                </span>
                                <span>
                                  projected: {modelingViewportState?.projectedObjects.length ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="modelEngineProjectedList">
                              <strong>Projected Objects</strong>
                              
                              {modelingViewportState &&
                              modelingViewportState.projectedObjects.length > 0 ? (
                                modelingViewportState.projectedObjects.map((projected) => (
                                  <div className="modelEngineProjectedRow" key={projected.object.id}>
                                    <span>{projected.object.name}</span>
                                    <span>{projected.object.primitive}</span>
                                    <span>
                                      screen [{projected.screenPosition.x.toFixed(1)},{" "}
                                      {projected.screenPosition.y.toFixed(1)}]
                                    </span>
                                    <span>
                                      size [{projected.screenSize.x.toFixed(1)},{" "}
                                      {projected.screenSize.y.toFixed(1)}]
                                    </span>
                                    <span>{projected.selected ? "selected" : "idle"}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="emptyState">No projected objects</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="modelTransformQuickActions">
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            onUpdateModelObjectVector(selectedModelObject.id, "position", 0, 0);
                            onUpdateModelObjectVector(selectedModelObject.id, "position", 1, 0);
                            onUpdateModelObjectVector(selectedModelObject.id, "position", 2, 0);
                          }}
                        >
                          Center Position
                        </button>

                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            onUpdateModelObjectVector(selectedModelObject.id, "rotation", 0, 0);
                            onUpdateModelObjectVector(selectedModelObject.id, "rotation", 1, 0);
                            onUpdateModelObjectVector(selectedModelObject.id, "rotation", 2, 0);
                          }}
                        >
                          Reset Rotation
                        </button>

                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            onUpdateModelObjectVector(selectedModelObject.id, "scale", 0, 1);
                            onUpdateModelObjectVector(selectedModelObject.id, "scale", 1, 1);
                            onUpdateModelObjectVector(selectedModelObject.id, "scale", 2, 1);
                          }}
                        >
                          Reset Scale
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="emptyState">Click an object in the viewport or object list.</div>
                  )}
                </div>
              </div>

              <label className="modelNotes">
                Notes
                <div className="docsMeta">
                  <span>Text / Markdown document</span>
                  <span className={modelDirty ? "docsDirty" : "docsSaved"}>
                    {modelDirty ? "Unsaved changes" : "Saved"}
                  </span>
                </div>
                <textarea
                  className="docsEditor"
                  value={modelData.notes}
                  onChange={(e) =>
                    onUpdateModelField("notes", e.target.value)
                  }
                />
              </label>

              <div className="docsEditorActions">
                <button
                  className="btn btn-subtle"
                  type="button"
                  onClick={() => onCloseModel()}
                >
                  Close Model
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void onSaveModel()}
                >
                  Save Model
                </button>

              </div>
            </>
          ) : (
            <div className="emptyState">Create or open a model scene.</div>
          )}
        </Panel>
      </section>   
    </div>
  );
}
