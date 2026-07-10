import { useEffect,  useMemo, useState } from "react";
import { rpc } from "./rpc";
import "./app.css";
import { Modal } from "./components/Modal";
import { ThreeModelViewport } from "./components/modeling";
import { CollapsiblePanel } from "./components/CollapsiblePanel";
import { Button, Panel, Toolbar, WorkspaceHeader } from "./components/pl-ui";
import {
  applyGravity2D,
  convertDistance,
  createKinematicBody2D,
  evaluateNumericExpression,
  findAabbCollisions2D,
  magnitudePhysicsVec2,
  physicsVec2,
  stepKinematicBody2D,
  distance,
  divideDistanceByTime,
  formatQuantity,
  mass,
  multiplyMassByAcceleration,
  acceleration,
  time,
  addBodyToWorld2D,
  createSimulationBody2D,
  createSimulationWorld2D,
  stepWorldOnce2D,
  setWorldGravityEnabled2D,
  applyImpulse2D,
  resolveWorldCollisions2D,
  interpolateNumber,
  interpolateVec2,
  sampleNumericKeyframes,
  sampleVec2Keyframes,
  resetWorld2D,
  type SimulationWorld2D,
  gameEntityToPhysicsBody2D,
  modelObjectToPhysicsBody2D,
  sampleAnimationMotion2D,
  advanceMoviePlayback,
  calculateTimelineDuration,
  createMoviePlaybackState,
  getMoviePlaybackFrame,
  pauseMovieTimeline,
  playMovieTimeline,
  seekMovieTimeline,
  stage3MovieToEngineTimeline,
  stopMovieTimeline,
  getMovieTimelineActivity,
  getMovieTimelineLayout,
  createDemoMovieAnimationChannels,
  sampleMovieAnimationChannels,
  createMovieRenderPreviewState,
  stage3ModelToModelingScene,
  createModelingCamera,
  physicsVec3,
  setModelingCameraPosition,
  setModelingCameraTarget,
  setModelingCameraZoom,
  toggleModelingCameraMode,
  type ModelingCamera,
  createModelingViewportState,
  createGameRuntimeEngine,
  createGameRuntimeProject,
  createGameTransform2D,
  createGameVec2,
  createSprite2DComponent,
  createTransform2DComponent,
  pauseGamePreview,
  resumeGamePreview,
  startGamePreview,
  stepGamePreviewFrame,
  stopGamePreview,
  type GameRuntimeProject,
  type GameRuntimeState,
  runWorkflowGraph,
  type WorkflowGraph,
  type WorkflowRunResult,
} from "./engines";

declare global {
  interface Window {
    plMenu?: {
      onMenuAction?: (callback: (channel: string) => void) => void | (() => void);
    };
  }
}

type AppId = "code" | "game" | "movie" | "docs" | "sheets" | "modeler";

type AssetInfo = {
  id: string;
  name: string;
  type: string;
  relativePath: string;
  sourcePath: string;
  createdAt: string;
  updatedAt: string;
};

type AppMetadata = {
  name: string;
  productName: string;
  version: string;
  description: string;
  appId: string;
  isPackaged: boolean;
};

type LocalAiChatResult = {
  ok: boolean;
  message: string;
  response: string;
  model?: string;
};

type LocalAiModel = {
  name: string;
  modifiedAt: string;
  size: number;
};

type LocalAiStatus = {
  available: boolean;
  provider: string;
  model: string | null;
  models?: LocalAiModel[];
  reason: string;
  host?: string;
};

type PluginInfo = {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  type: string;
  description: string;
};

type FeatureFlags = {
  plugins: boolean;
  localAi: boolean;
  cloudSync: boolean;
  paidExtensions: boolean;
  marketplace: boolean;
};

type NavItem = {
  id: AppId;
  label: string;
  hint: string;
};

type DocInfo = {
  name: string;
  path: string;
};

type CodeFileInfo = {
  name: string;
  path: string;
  language: string;
};

type SheetInfo = {
  name: string;
  path: string;
};

type SheetData = {
  version: number;
  name: string;
  rows: number;
  columns: number;
  cells: string[][];
  createdAt: string;
  updatedAt: string;
};

type MovieInfo = {
  name: string;
  path: string;
};

type MovieClip = {
  id: string;
  name: string;
  startSeconds: number;
  durationSeconds: number;
};

type MovieTrack = {
  id: string;
  name: string;
  type: string;
  clips: MovieClip[];
};

type MovieData = {
  version: number;
  name: string;
  title: string;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
  tracks: MovieTrack[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type ModelInfo = {
  name: string;
  path: string;
};

type ModelObject = {
  id: string;
  name: string;
  primitive: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type ModelVectorField = "position" | "rotation" | "scale";
type ModelVectorAxis = 0 | 1 | 2;

type ModelData = {
  version: number;
  name: string;
  title: string;
  units: string;
  gridEnabled: boolean;
  objects: ModelObject[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type GameInfo = {
  name: string;
  path: string;
};

type GameEntity = {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  properties: Record<string, unknown>;
};

type GameScene = {
  id: string;
  name: string;
  entities: GameEntity[];
};

type GameData = {
  version: number;
  name: string;
  title: string;
  targetPlatform: string;
  genre: string;
  scenes: GameScene[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type WorkflowInfo = {
  name: string;
  path: string;
};

function readStoredBoolean(key: string, fallback: boolean) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const navItems: NavItem[] = useMemo(
    () => [
      { id: "code", label: "Code IDE", hint: "Edit + run scripts later" },
      { id: "game", label: "Game Studio", hint: "Scenes + assets later" },
      { id: "movie", label: "Movie Studio", hint: "Timeline + export later" },
      { id: "docs", label: "Docs", hint: "Notes + docs later" },
      { id: "sheets", label: "Sheets", hint: "Grid + formulas later" },
      { id: "modeler", label: "Modeling", hint: "3D + physics later" },
    ],
    []
  );

  const [active, setActive] = useState<AppId>("code");
//  const activeItem = navItems.find((n) => n.id === active)!;
  const [projectRoot, setProjectRoot] = useState<string>("");
  const [status, setStatus] = useState<string>("idle");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("TestProject");
  const [newBaseDir, setNewBaseDir] = useState("");
  const [uiError, setUiError] = useState("");
  const [recents, setRecents] = useState<Array<{ projectRoot: string; name: string; lastOpenedAt: string }>>([]);
  const [openPath, setOpenPath] = useState("");
  const [openError, setOpenError] = useState("");
  const [showOpen, setShowOpen] = useState(false);
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus | null>(null);
  const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [allowProjectContext, setAllowProjectContext] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("other");
  const [assetRelativePath, setAssetRelativePath] = useState("");
  const [assetSourcePath, setAssetSourcePath] = useState("");
  const [docsList, setDocsList] = useState<DocInfo[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [activeDocName, setActiveDocName] = useState("");
  const [docContent, setDocContent] = useState("");
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState(() =>
    readStoredBoolean("pl.layout.copilotDrawerOpen", true)
  );
  const [physicsDrawerOpen, setPhysicsDrawerOpen] = useState(() =>
    readStoredBoolean("pl.layout.physicsDrawerOpen", false)
  );
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [docDirty, setDocDirty] = useState(false);
  const [codeFiles, setCodeFiles] = useState<CodeFileInfo[]>([]);
  const [newCodeFileName, setNewCodeFileName] = useState("");
  const [activeCodeFileName, setActiveCodeFileName] = useState("");
  const [activeCodeLanguage, setActiveCodeLanguage] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeDirty, setCodeDirty] = useState(false);
  const [sheetsList, setSheetsList] = useState<SheetInfo[]>([]);
  const [newSheetName, setNewSheetName] = useState("");
  const [activeSheetName, setActiveSheetName] = useState("");
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [sheetDirty, setSheetDirty] = useState(false);
  const [moviesList, setMoviesList] = useState<MovieInfo[]>([]);
  const [newMovieName, setNewMovieName] = useState("");
  const [activeMovieName, setActiveMovieName] = useState("");
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [movieDirty, setMovieDirty] = useState(false);
  const [newMovieClipName, setNewMovieClipName] = useState("");
  const [newMovieClipTrackId, setNewMovieClipTrackId] = useState("");
  const [newMovieClipStart, setNewMovieClipStart] = useState("0");
  const [newMovieClipDuration, setNewMovieClipDuration] = useState("2");
  const [modelsList, setModelsList] = useState<ModelInfo[]>([]);
  const [newModelName, setNewModelName] = useState("");
  const [activeModelName, setActiveModelName] = useState("");
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [modelDirty, setModelDirty] = useState(false);

  const [newModelObjectName, setNewModelObjectName] = useState("");
  const [newModelPrimitive, setNewModelPrimitive] = useState("cube");

  const [gamesList, setGamesList] = useState<GameInfo[]>([]);
  const [newGameName, setNewGameName] = useState("");
  const [activeGameName, setActiveGameName] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [gameDirty, setGameDirty] = useState(false);

  const [newGameSceneName, setNewGameSceneName] = useState("");
  const [newGameEntityName, setNewGameEntityName] = useState("");
  const [newGameEntityType, setNewGameEntityType] = useState("object");
  const [newGameEntitySceneId, setNewGameEntitySceneId] = useState("");

  const [workflowsList, setWorkflowsList] = useState<WorkflowInfo[]>([]);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [activeWorkflowName, setActiveWorkflowName] = useState("");
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowGraph | null>(null);
  const [workflowRunResult, setWorkflowRunResult] =
    useState<WorkflowRunResult | null>(null);
  const [workflowBusy, setWorkflowBusy] = useState(false);

async function handleOpenProject() {
  try {
    setStatus("Choosing project folder...");

    const pick = await rpc<{ canceled: boolean; projectRoot?: string }>(
      "dialog.openProjectFolder"
    );

    if (pick.canceled || !pick.projectRoot) {
      setStatus("Open canceled");
      return;
    }

    setStatus("Opening project...");

    const result = await rpc<{ projectRoot: string; manifestPath: string; manifest: any }>(
      "project.open",
      { projectRoot: pick.projectRoot }
    );

    setProjectRoot(result.projectRoot);
    setStatus(`Opened: ${result.projectRoot}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

async function handleImportProject() {
  try {
    setStatus("Choose .plproj file...");
    const pick = await rpc<{ canceled: boolean; filePath?: string }>("dialog.openPlproj");

    if (pick.canceled || !pick.filePath) {
      setStatus("Import canceled");
      return;
    }

    setStatus("Importing project...");
    const result = await rpc<{ projectRoot: string }>("project.import", {
      filePath: pick.filePath,
    });

    setProjectRoot(result.projectRoot);
    setStatus(`Imported: ${result.projectRoot}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

async function handleExportProject() {
  try {
    if (!projectRoot) return setStatus("No project open");

    const suggestedName = projectRoot.split("/").pop() || "project";

    setStatus("Choose export location...");
    const pick = await rpc<{ canceled: boolean; filePath?: string }>(
      "dialog.savePlproj",
      { defaultName: `${suggestedName}.plproj` }
    );

    if (pick.canceled || !pick.filePath) {
      setStatus("Export canceled");
      return;
    }

    setStatus("Exporting project...");
    const result = await rpc<{ outPath: string }>("project.export", {
      projectRoot,
      outPath: pick.filePath,
    });

    setStatus(`Exported: ${result.outPath}`);
    await refreshRecents();
  } catch (e: any) {
    setStatus(`Error: ${e.message || String(e)}`);
  }
}

function handleNewProject() {
  setUiError("");
  setShowNew(true);
}

async function handleChooseAssetFile() {
  try {
    const pick = await rpc<{ canceled: boolean; filePath?: string }>(
      "dialog.openAssetFile"
    );

    if (pick.canceled || !pick.filePath) {
      setStatus("Asset file selection canceled");
      return;
    }

    setAssetSourcePath(pick.filePath);
    
    const detected = await rpc<{ type: string }>("assets.detectType", {
      filePath: pick.filePath,
    });

    setAssetType(detected.type);

    if (!assetName.trim()) {
      const fileName = pick.filePath.split("/").pop() || "";
      setAssetName(fileName);
    }

    setStatus("Asset file selected");
  } catch (e: any) {
    setStatus(`Asset file picker error: ${e.message || String(e)}`);
  }
}

async function handleRegisterAsset() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before registering assets");
      return;
    }

    const name = assetName.trim();
    const relativePath = assetRelativePath.trim();

    if (!name || !relativePath) {
      setStatus("Asset name and relative path are required");
      return;
    }

    const result = await rpc<{ assets: AssetInfo[] }>("assets.register", {
      projectRoot,
      name,
      type: assetType,
      relativePath,
      sourcePath: "",
    });

    setAssets(result.assets);
    setAssetName("");
    setAssetRelativePath("");
    setAssetType("other");
    setStatus(`Registered asset: ${name}`);
  } catch (e: any) {
    setStatus(`Asset error: ${e.message || String(e)}`);
  }
}

async function handleImportAsset() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before importing assets");
      return;
    }

    const sourcePath = assetSourcePath.trim();

    if (!sourcePath) {
      setStatus("Asset source path is required");
      return;
    }

    const result = await rpc<{ assets: AssetInfo[] }>("assets.import", {
      projectRoot,
      name: assetName.trim(),
      type: assetType,
      sourcePath,
    });

    setAssets(result.assets);
    setAssetName("");
    setAssetRelativePath("");
    setAssetSourcePath("");
    setAssetType("other");
    setStatus("Imported asset");
  } catch (e: any) {
    setStatus(`Asset import error: ${e.message || String(e)}`);
  }
}

async function refreshDocs(root = projectRoot) {
  try {
    if (!root) {
      setDocsList([]);
      setActiveDocName("");
      setDocContent("");
      setDocDirty(false);
      return;
    }

    await rpc("docs.ensure", { projectRoot: root });

    const result = await rpc<{ docs: DocInfo[] }>("docs.list", {
      projectRoot: root,
    });

    setDocsList(result.docs);
  } catch (e: any) {
    setStatus(`Docs error: ${e.message || String(e)}`);
  }
}

async function handleCreateDoc() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating docs");
      return;
    }

    const name = newDocName.trim();

    if (!name) {
      setStatus("Document name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      content: string;
    }>("docs.create", {
      projectRoot,
      name,
    });

    setActiveDocName(created.name);
    setDocContent(created.content);
    setDocDirty(false);
    setNewDocName("");
    await refreshDocs(projectRoot);
    setStatus(`Created doc: ${created.name}`);
  } catch (e: any) {
    setStatus(`Docs error: ${e.message || String(e)}`);
  }
}

async function handleOpenDoc(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening docs");
      return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      content: string;
    }>("docs.read", {
      projectRoot,
      name,
    });

    setActiveDocName(opened.name);
    setDocContent(opened.content);
    setDocDirty(false);
    setStatus(`Opened doc: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Docs error: ${e.message || String(e)}`);
  }
}

async function handleSaveDoc() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving docs");
      return;
    }

    if (!activeDocName) {
      setStatus("Open a document before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      content: string;
    }>("docs.save", {
      projectRoot,
      name: activeDocName,
      content: docContent,
    });

    setDocContent(saved.content);
    setDocDirty(false);
    setStatus(`Saved doc: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Docs save error: ${e.message || String(e)}`);
  }
}

function handleCloseDoc() {
  if (docDirty) {
    const shouldClose = window.confirm(
      "This document has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveDocName("");
  setDocContent("");
  setDocDirty(false);
  setStatus("Closed document");
}

async function refreshCodeFiles(root = projectRoot) {
  try {
    if (!root) {
      setCodeFiles([]);
      setActiveCodeFileName("");
      setActiveCodeLanguage("");
      setCodeContent("");
      setCodeDirty(false);
      return;
    }

    await rpc("code.ensure", { projectRoot: root });

    const result = await rpc<{ files: CodeFileInfo[] }>("code.list", {
      projectRoot: root,
    });

    setCodeFiles(result.files);
  } catch (e: any) {
    setStatus(`Code error: ${e.message || String(e)}`);
  }
}

async function handleCreateCodeFile() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating code files");
      return;
    }

    const name = newCodeFileName.trim();

    if (!name) {
      setStatus("Code file name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      language: string;
      content: string;
    }>("code.create", {
      projectRoot,
      name,
    });

    setActiveCodeFileName(created.name);
    setActiveCodeLanguage(created.language);
    setCodeContent(created.content);
    setCodeDirty(false);
    setNewCodeFileName("");
    await refreshCodeFiles(projectRoot);
    setStatus(`Created code file: ${created.name}`);
  } catch (e: any) {
    setStatus(`Code error: ${e.message || String(e)}`);
  }
}

async function handleOpenCodeFile(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening code files");
      return;
    }

    if (codeDirty) {
      const shouldOpen = window.confirm(
        "The current code file has unsaved changes. Open another file without saving?"
      );

      if (!shouldOpen) return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      language: string;
      content: string;
    }>("code.read", {
      projectRoot,
      name,
    });

    setActiveCodeFileName(opened.name);
    setActiveCodeLanguage(opened.language);
    setCodeContent(opened.content);
    setCodeDirty(false);
    setStatus(`Opened code file: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Code error: ${e.message || String(e)}`);
  }
}

async function handleSaveCodeFile() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving code files");
      return;
    }

    if (!activeCodeFileName) {
      setStatus("Open a code file before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      language: string;
      content: string;
    }>("code.save", {
      projectRoot,
      name: activeCodeFileName,
      content: codeContent,
    });

    setActiveCodeFileName(saved.name);
    setActiveCodeLanguage(saved.language);
    setCodeContent(saved.content);
    setCodeDirty(false);
    setStatus(`Saved code file: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Code save error: ${e.message || String(e)}`);
  }
}

function handleCloseCodeFile() {
  if (codeDirty) {
    const shouldClose = window.confirm(
      "This code file has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveCodeFileName("");
  setActiveCodeLanguage("");
  setCodeContent("");
  setCodeDirty(false);
  setStatus("Closed code file");
}

async function refreshSheets(root = projectRoot) {
  try {
    if (!root) {
      setSheetsList([]);
      setActiveSheetName("");
      setSheetData(null);
      setSheetDirty(false);
      return;
    }

    await rpc("sheets.ensure", { projectRoot: root });

    const result = await rpc<{ sheets: SheetInfo[] }>("sheets.list", {
      projectRoot: root,
    });

    setSheetsList(result.sheets);
  } catch (e: any) {
    setStatus(`Sheets error: ${e.message || String(e)}`);
  }
}

async function handleCreateSheet() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating sheets");
      return;
    }

    const name = newSheetName.trim();

    if (!name) {
      setStatus("Sheet name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      sheet: SheetData;
    }>("sheets.create", {
      projectRoot,
      name,
    });

    setActiveSheetName(created.name);
    setSheetData(created.sheet);
    setSheetDirty(false);
    setNewSheetName("");
    await refreshSheets(projectRoot);
    setStatus(`Created sheet: ${created.name}`);
  } catch (e: any) {
    setStatus(`Sheets error: ${e.message || String(e)}`);
  }
}

async function handleOpenSheet(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening sheets");
      return;
    }

    if (sheetDirty) {
      const shouldOpen = window.confirm(
        "The current sheet has unsaved changes. Open another sheet without saving?"
      );

      if (!shouldOpen) return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      sheet: SheetData;
    }>("sheets.read", {
      projectRoot,
      name,
    });

    setActiveSheetName(opened.name);
    setSheetData(opened.sheet);
    setSheetDirty(false);
    setStatus(`Opened sheet: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Sheets error: ${e.message || String(e)}`);
  }
}

async function handleSaveSheet() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving sheets");
      return;
    }

    if (!activeSheetName || !sheetData) {
      setStatus("Open a sheet before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      sheet: SheetData;
    }>("sheets.save", {
      projectRoot,
      name: activeSheetName,
      sheet: sheetData,
    });

    setActiveSheetName(saved.name);
    setSheetData(saved.sheet);
    setSheetDirty(false);
    setStatus(`Saved sheet: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Sheets save error: ${e.message || String(e)}`);
  }
}

function handleCloseSheet() {
  if (sheetDirty) {
    const shouldClose = window.confirm(
      "This sheet has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveSheetName("");
  setSheetData(null);
  setSheetDirty(false);
  setStatus("Closed sheet");
}

function handleUpdateSheetCell(rowIndex: number, columnIndex: number, value: string) {
  setSheetData((current) => {
    if (!current) return current;

    const nextCells = current.cells.map((row) => [...row]);
    nextCells[rowIndex][columnIndex] = value;

    return {
      ...current,
      cells: nextCells,
    };
  });

  setSheetDirty(true);
}

function handleAddSheetRow() {
  setSheetData((current) => {
    if (!current) return current;

    return {
      ...current,
      rows: current.rows + 1,
      cells: [
        ...current.cells,
        Array.from({ length: current.columns }, () => ""),
      ],
    };
  });

  setSheetDirty(true);
}

function handleAddSheetColumn() {
  setSheetData((current) => {
    if (!current) return current;

    return {
      ...current,
      columns: current.columns + 1,
      cells: current.cells.map((row) => [...row, ""]),
    };
  });

  setSheetDirty(true);
}

function handleDeleteLastSheetRow() {
  setSheetData((current) => {
    if (!current) return current;

    if (current.rows <= 1) {
      setStatus("Sheet must have at least one row");
      return current;
    }

    return {
      ...current,
      rows: current.rows - 1,
      cells: current.cells.slice(0, -1),
    };
  });

  setSheetDirty(true);
}

function handleDeleteLastSheetColumn() {
  setSheetData((current) => {
    if (!current) return current;

    if (current.columns <= 1) {
      setStatus("Sheet must have at least one column");
      return current;
    }

    return {
      ...current,
      columns: current.columns - 1,
      cells: current.cells.map((row) => row.slice(0, -1)),
    };
  });

  setSheetDirty(true);
}

async function refreshMovies(root = projectRoot) {
  try {
    if (!root) {
      setMoviesList([]);
      setActiveMovieName("");
      setMovieData(null);
      setMovieDirty(false);
      return;
    }

    await rpc("movies.ensure", { projectRoot: root });

    const result = await rpc<{ movies: MovieInfo[] }>("movies.list", {
      projectRoot: root,
    });

    setMoviesList(result.movies);
  } catch (e: any) {
    setStatus(`Movie error: ${e.message || String(e)}`);
  }
}

async function handleCreateMovie() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating movies");
      return;
    }

    const name = newMovieName.trim();

    if (!name) {
      setStatus("Movie name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      movie: MovieData;
    }>("movies.create", {
      projectRoot,
      name,
    });

    setActiveMovieName(created.name);
    setMovieData(created.movie);
    setMovieDirty(false);
    setNewMovieClipTrackId(created.movie.tracks[0]?.id || "");
    setNewMovieName("");
    await refreshMovies(projectRoot);
    setStatus(`Created movie: ${created.name}`);
  } catch (e: any) {
    setStatus(`Movie error: ${e.message || String(e)}`);
  }
}

async function handleOpenMovie(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening movies");
      return;
    }

    if (movieDirty) {
      const shouldOpen = window.confirm(
        "The current movie has unsaved changes. Open another movie without saving?"
      );

      if (!shouldOpen) return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      movie: MovieData;
    }>("movies.read", {
      projectRoot,
      name,
    });

    setActiveMovieName(opened.name);
    setMovieData(opened.movie);
    setMovieDirty(false);
    setNewMovieClipTrackId(opened.movie.tracks[0]?.id || "");
    setStatus(`Opened movie: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Movie error: ${e.message || String(e)}`);
  }
}

async function handleSaveMovie() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving movies");
      return;
    }

    if (!activeMovieName || !movieData) {
      setStatus("Open a movie before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      movie: MovieData;
    }>("movies.save", {
      projectRoot,
      name: activeMovieName,
      movie: movieData,
    });

    setActiveMovieName(saved.name);
    setMovieData(saved.movie);
    setMovieDirty(false);
    setStatus(`Saved movie: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Movie save error: ${e.message || String(e)}`);
  }
}

function handleCloseMovie() {
  if (movieDirty) {
    const shouldClose = window.confirm(
      "This movie has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveMovieName("");
  setMovieData(null);
  setMovieDirty(false);
  setNewMovieClipName("");
  setNewMovieClipTrackId("");
  setNewMovieClipStart("0");
  setNewMovieClipDuration("2");
  setStatus("Closed movie");
}

function handleUpdateMovieField<K extends keyof MovieData>(
  field: K,
  value: MovieData[K]
) {
  setMovieData((current) => {
    if (!current) return current;

    return {
      ...current,
      [field]: value,
    };
  });

  setMovieDirty(true);
}

function handleAddMovieClip() {
  if (!movieData) {
    setStatus("Open a movie before adding clips");
    return;
  }

  const trackId = newMovieClipTrackId || movieData.tracks[0]?.id;
  const name = newMovieClipName.trim();

  if (!trackId) {
    setStatus("Movie needs at least one track before adding clips");
    return;
  }

  if (!name) {
    setStatus("Clip name is required");
    return;
  }

  const startSeconds = Number(newMovieClipStart);
  const durationSeconds = Number(newMovieClipDuration);

  if (!Number.isFinite(startSeconds) || startSeconds < 0) {
    setStatus("Clip start time must be 0 or greater");
    return;
  }

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    setStatus("Clip duration must be greater than 0");
    return;
  }

  const clip: MovieClip = {
    id: `clip-${Date.now()}`,
    name,
    startSeconds,
    durationSeconds,
  };

  setMovieData((current) => {
    if (!current) return current;

    return {
      ...current,
      tracks: current.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: [...track.clips, clip],
            }
          : track
      ),
    };
  });

  setNewMovieClipName("");
  setNewMovieClipStart("0");
  setNewMovieClipDuration("2");
  setMovieDirty(true);
  setStatus(`Added clip: ${name}`);
}

function handleDeleteMovieClip(trackId: string, clipId: string) {
  if (!movieData) {
    setStatus("Open a movie before deleting clips");
    return;
  }

  setMovieData((current) => {
    if (!current) return current;

    return {
      ...current,
      tracks: current.tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.filter((clip) => clip.id !== clipId),
            }
          : track
      ),
    };
  });

  setMovieDirty(true);
  setStatus("Deleted clip");
}

async function refreshModels(root = projectRoot) {
  try {
    if (!root) {
      setModelsList([]);
      setActiveModelName("");
      setModelData(null);
      setModelDirty(false);
      return;
    }

    await rpc("models.ensure", { projectRoot: root });

    const result = await rpc<{ models: ModelInfo[] }>("models.list", {
      projectRoot: root,
    });

    setModelsList(result.models);
  } catch (e: any) {
    setStatus(`Modeling error: ${e.message || String(e)}`);
  }
}

async function handleCreateModel() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating model scenes");
      return;
    }

    const name = newModelName.trim();

    if (!name) {
      setStatus("Model scene name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      model: ModelData;
    }>("models.create", {
      projectRoot,
      name,
    });

    setActiveModelName(created.name);
    setModelData(created.model);
    setModelDirty(false);
    setNewModelName("");
    setStatus(`Created model scene: ${created.name}`);
    await refreshModels(projectRoot);
  } catch (e: any) {
    setStatus(`Modeling error: ${e.message || String(e)}`);
  }
}

async function handleOpenModel(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening model scenes");
      return;
    }

    if (modelDirty) {
      const shouldOpen = window.confirm(
        "The current model scene has unsaved changes. Open another scene without saving?"
      );

      if (!shouldOpen) return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      model: ModelData;
    }>("models.read", {
      projectRoot,
      name,
    });

    setActiveModelName(opened.name);
    setModelData(opened.model);
    setModelDirty(false);
    setStatus(`Opened model scene: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Modeling error: ${e.message || String(e)}`);
  }
}

async function handleSaveModel() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving model scenes");
      return;
    }

    if (!activeModelName || !modelData) {
      setStatus("Open a model scene before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      model: ModelData;
    }>("models.save", {
      projectRoot,
      name: activeModelName,
      model: modelData,
    });

    setActiveModelName(saved.name);
    setModelData(saved.model);
    setModelDirty(false);
    setStatus(`Saved model scene: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Modeling save error: ${e.message || String(e)}`);
  }
}

function handleCloseModel() {
  if (modelDirty) {
    const shouldClose = window.confirm(
      "This model scene has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveModelName("");
  setModelData(null);
  setModelDirty(false);
  setNewModelObjectName("");
  setNewModelPrimitive("cube");
  setStatus("Closed model scene");
}

function handleUpdateModelField<K extends keyof ModelData>(
  field: K,
  value: ModelData[K]
) {
  setModelData((current) => {
    if (!current) return current;

    return {
      ...current,
      [field]: value,
    };
  });

  setModelDirty(true);
}

function handleUpdateModelObjectVector(
  objectId: string,
  field: ModelVectorField,
  axis: ModelVectorAxis,
  value: number
) {
  const safeValue = Number.isFinite(value) ? value : 0;

  setModelData((current) => {
    if (!current) return current;

    return {
      ...current,
      objects: current.objects.map((object) => {
        if (object.id !== objectId) return object;

        const nextVector: [number, number, number] = [...object[field]];
        nextVector[axis] = field === "scale" ? Math.max(0.01, safeValue) : safeValue;

        return {
          ...object,
          [field]: nextVector,
        };
      }),
    };
  });

  setModelDirty(true);
}

function handleAddModelObject() {
  if (!modelData) {
    setStatus("Open a model scene before adding objects");
    return;
  }

  const name = newModelObjectName.trim();

  if (!name) {
    setStatus("Object name is required");
    return;
  }

  const object: ModelObject = {
    id: `object-${Date.now()}`,
    name,
    primitive: newModelPrimitive,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };

  setModelData((current) => {
    if (!current) return current;

    return {
      ...current,
      objects: [...current.objects, object],
    };
  });

  setNewModelObjectName("");
  setNewModelPrimitive("cube");
  setModelDirty(true);
  setStatus(`Added object: ${name}`);
}

function handleDeleteModelObject(objectId: string) {
  if (!modelData) {
    setStatus("Open a model scene before deleting objects");
    return;
  }

  setModelData((current) => {
    if (!current) return current;

    return {
      ...current,
      objects: current.objects.filter((object) => object.id !== objectId),
    };
  });

  setModelDirty(true);
  setStatus("Deleted model object");
}

async function refreshGames(root = projectRoot) {
  try {
    if (!root) {
      setGamesList([]);
      setActiveGameName("");
      setGameData(null);
      setGameDirty(false);
      return;
    }

    await rpc("games.ensure", { projectRoot: root });

    const result = await rpc<{ games: GameInfo[] }>("games.list", {
      projectRoot: root,
    });

    setGamesList(result.games);
  } catch (e: any) {
    setStatus(`Game error: ${e.message || String(e)}`);
  }
}

async function handleCreateGame() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating games");
      return;
    }

    const name = newGameName.trim();

    if (!name) {
      setStatus("Game name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      game: GameData;
    }>("games.create", {
      projectRoot,
      name,
    });

    setActiveGameName(created.name);
    setGameData(created.game);
    setGameDirty(false);
    setNewGameName("");
    setNewGameEntitySceneId(created.game.scenes[0]?.id || "");
    await refreshGames(projectRoot);
    setStatus(`Created game: ${created.name}`);
  } catch (e: any) {
    setStatus(`Game error: ${e.message || String(e)}`);
  }
}

async function handleOpenGame(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening games");
      return;
    }

    if (gameDirty) {
      const shouldOpen = window.confirm(
        "The current game has unsaved changes. Open another game without saving?"
      );

      if (!shouldOpen) return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      game: GameData;
    }>("games.read", {
      projectRoot,
      name,
    });

    setActiveGameName(opened.name);
    setGameData(opened.game);
    setGameDirty(false);
    setNewGameEntitySceneId(opened.game.scenes[0]?.id || "");
    setStatus(`Opened game: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Game error: ${e.message || String(e)}`);
  }
}

async function handleSaveGame() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving games");
      return;
    }

    if (!activeGameName || !gameData) {
      setStatus("Open a game before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      game: GameData;
    }>("games.save", {
      projectRoot,
      name: activeGameName,
      game: gameData,
    });

    setActiveGameName(saved.name);
    setGameData(saved.game);
    setGameDirty(false);
    setStatus(`Saved game: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Game save error: ${e.message || String(e)}`);
  }
}

function handleCloseGame() {
  if (gameDirty) {
    const shouldClose = window.confirm(
      "This game has unsaved changes. Close without saving?"
    );

    if (!shouldClose) return;
  }

  setActiveGameName("");
  setGameData(null);
  setGameDirty(false);
  setNewGameSceneName("");
  setNewGameEntityName("");
  setNewGameEntityType("object");
  setNewGameEntitySceneId("");
  setStatus("Closed game");
}

function handleUpdateGameField<K extends keyof GameData>(
  field: K,
  value: GameData[K]
) {
  setGameData((current) => {
    if (!current) return current;

    return {
      ...current,
      [field]: value,
    };
  });

  setGameDirty(true);
}

function handleAddGameScene() {
  if (!gameData) {
    setStatus("Open a game before adding scenes");
    return;
  }

  const name = newGameSceneName.trim();

  if (!name) {
    setStatus("Scene name is required");
    return;
  }

  const scene: GameScene = {
    id: `scene-${Date.now()}`,
    name,
    entities: [],
  };

  setGameData((current) => {
    if (!current) return current;

    return {
      ...current,
      scenes: [...current.scenes, scene],
    };
  });

  setNewGameSceneName("");
  setNewGameEntitySceneId(scene.id);
  setGameDirty(true);
  setStatus(`Added scene: ${name}`);
}

function handleAddGameEntity() {
  if (!gameData) {
    setStatus("Open a game before adding entities");
    return;
  }

  const sceneId = newGameEntitySceneId || gameData.scenes[0]?.id;
  const name = newGameEntityName.trim();

  if (!sceneId) {
    setStatus("Game needs at least one scene before adding entities");
    return;
  }

  if (!name) {
    setStatus("Entity name is required");
    return;
  }

  const entity: GameEntity = {
    id: `entity-${Date.now()}`,
    name,
    type: newGameEntityType,
    x: 0,
    y: 0,
    properties: {},
  };

  setGameData((current) => {
    if (!current) return current;

    return {
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              entities: [...scene.entities, entity],
            }
          : scene
      ),
    };
  });

  setNewGameEntityName("");
  setNewGameEntityType("object");
  setGameDirty(true);
  setStatus(`Added entity: ${name}`);
}

function handleDeleteGameEntity(sceneId: string, entityId: string) {
  if (!gameData) {
    setStatus("Open a game before deleting entities");
    return;
  }

  setGameData((current) => {
    if (!current) return current;

    return {
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              entities: scene.entities.filter(
                (entity) => entity.id !== entityId
              ),
            }
          : scene
      ),
    };
  });

  setGameDirty(true);
  setStatus("Deleted game entity");
}

function handleDeleteGameScene(sceneId: string) {
  if (!gameData) {
    setStatus("Open a game before deleting scenes");
    return;
  }

  if (gameData.scenes.length <= 1) {
    setStatus("Game must have at least one scene");
    return;
  }

  const shouldDelete = window.confirm(
    "Delete this scene and all entities inside it?"
  );

  if (!shouldDelete) return;

  setGameData((current) => {
    if (!current) return current;

    const nextScenes = current.scenes.filter((scene) => scene.id !== sceneId);

    return {
      ...current,
      scenes: nextScenes,
    };
  });

  if (newGameEntitySceneId === sceneId) {
    const fallbackScene = gameData.scenes.find((scene) => scene.id !== sceneId);
    setNewGameEntitySceneId(fallbackScene?.id || "");
  }

  setGameDirty(true);
  setStatus("Deleted game scene");
}

async function refreshWorkflows(root = projectRoot) {
  try {
    if (!root) {
      setWorkflowsList([]);
      setActiveWorkflowName("");
      setActiveWorkflow(null);
      setWorkflowRunResult(null);
      return;
    }

    await rpc("workflows.ensure", { projectRoot: root });

    const result = await rpc<{ workflows: WorkflowInfo[] }>("workflows.list", {
      projectRoot: root,
    });

    setWorkflowsList(result.workflows);
  } catch (e: any) {
    setStatus(`Workflow error: ${e.message || String(e)}`);
  }
}

async function handleCreateWorkflow() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before creating workflows");
      return;
    }

    const name = newWorkflowName.trim();

    if (!name) {
      setStatus("Workflow name is required");
      return;
    }

    const created = await rpc<{
      name: string;
      path: string;
      workflow: WorkflowGraph;
    }>("workflows.create", {
      projectRoot,
      name,
    });

    setActiveWorkflowName(created.name);
    setActiveWorkflow(created.workflow);
    setWorkflowRunResult(null);
    setNewWorkflowName("");
    await refreshWorkflows(projectRoot);
    setStatus(`Created workflow: ${created.name}`);
  } catch (e: any) {
    setStatus(`Workflow create error: ${e.message || String(e)}`);
  }
}

async function handleOpenWorkflow(name: string) {
  try {
    if (!projectRoot) {
      setStatus("Open a project before opening workflows");
      return;
    }

    const opened = await rpc<{
      name: string;
      path: string;
      workflow: WorkflowGraph;
    }>("workflows.read", {
      projectRoot,
      name,
    });

    setActiveWorkflowName(opened.name);
    setActiveWorkflow(opened.workflow);
    setWorkflowRunResult(null);
    setStatus(`Opened workflow: ${opened.name}`);
  } catch (e: any) {
    setStatus(`Workflow open error: ${e.message || String(e)}`);
  }
}

async function handleSaveWorkflow() {
  try {
    if (!projectRoot) {
      setStatus("Open a project before saving workflows");
      return;
    }

    if (!activeWorkflowName || !activeWorkflow) {
      setStatus("Open a workflow before saving");
      return;
    }

    const saved = await rpc<{
      name: string;
      path: string;
      workflow: WorkflowGraph;
    }>("workflows.save", {
      projectRoot,
      name: activeWorkflowName,
      workflow: activeWorkflow,
    });

    setActiveWorkflowName(saved.name);
    setActiveWorkflow(saved.workflow);
    await refreshWorkflows(projectRoot);
    setStatus(`Saved workflow: ${saved.name}`);
  } catch (e: any) {
    setStatus(`Workflow save error: ${e.message || String(e)}`);
  }
}

async function handleRunWorkflowManual() {
  try {
    if (!activeWorkflow) {
      setStatus("Open a workflow before running it");
      return;
    }

    setWorkflowBusy(true);
    setWorkflowRunResult(null);
    setStatus(`Running workflow: ${activeWorkflow.name}`);

    const result = await runWorkflowGraph(activeWorkflow, {
      context: {
        projectRoot,
        appId: active,
        sourceEvent: "manual",
        variables: {
          projectRoot,
          activeApp: active,
        },
      },
      rpcExecutor: async (method, params) => {
        return rpc(method, params ?? {});
      },
      stopOnFailure: true,
    });

    setWorkflowRunResult(result);
    setStatus(
      result.status === "completed"
        ? `Workflow completed: ${result.workflowName}`
        : `Workflow finished: ${result.status}`
    );
  } catch (e: any) {
    setStatus(`Workflow run error: ${e.message || String(e)}`);
  } finally {
    setWorkflowBusy(false);
  }
}

async function refreshAssets(root = projectRoot) {
  try {
    if (!root) {
      setAssets([]);
      return;
    }

    await rpc("assets.ensure", { projectRoot: root });

    const result = await rpc<{ assets: AssetInfo[] }>("assets.list", {
      projectRoot: root,
    });

    setAssets(result.assets);
  } catch (e: any) {
    setStatus(`Asset error: ${e.message || String(e)}`);
  }
}

async function refreshLocalAiStatus() {
  try {
    const result = await rpc<{ status: LocalAiStatus }>("ai.local.status");
    setLocalAiStatus(result.status);
  } catch (e: any) {
    setStatus(`AI status error: ${e.message || String(e)}`);
  }
}

async function handleSendAiPrompt() {
  try {
    const prompt = aiPrompt.trim();

    if (!prompt) {
      setStatus("AI prompt is empty");
      return;
    }

    setAiBusy(true);
    setStatus("Sending prompt to local AI...");
    setAiResponse("");

    const result = await rpc<LocalAiChatResult>("ai.local.chat", {
      prompt,
      model: localAiStatus?.model || undefined,
      projectRoot: allowProjectContext ? projectRoot : undefined,
      allowProjectContext,
    });

    setAiResponse(result.response || result.message);
    setStatus(result.ok ? "AI response received" : `AI unavailable: ${result.message}`);
  } catch (e: any) {
    setStatus(`AI error: ${e.message || String(e)}`);
  } finally {
    setAiBusy(false);
  }
}

async function refreshPlugins() {
  try {
    const result = await rpc<{ plugins: PluginInfo[]; errors?: any[] }>(
      "plugins.refreshDiscovered"
    );

    setPlugins(result.plugins);

    if (result.errors?.length) {
      setStatus('Plugin discovery warning: ${result.errors.length} issue(s)');
    }
  } catch (e: any) {
    setStatus(`Plugin error: ${e.message || String(e)}`);
  }
}

async function refreshFeatureFlags() {
  try {
    const result = await rpc<{ flags: FeatureFlags }>("entitlements.flags");
    setFeatureFlags(result.flags);
  } catch (e: any) {
    setStatus(`Entitlements error: ${e.message || String(e)}`);
  }
}

async function refreshAppMetadata() {
  try {
    const result = await rpc<{ metadata: AppMetadata }>("app.metadata");
    setAppMetadata(result.metadata);
  } catch (e: any) {
    setStatus(`App metadata error: ${e.message || String(e)}`);
  }
}

async function handleSetPluginEnabled(pluginId: string, enabled: boolean) {
  try {
    const result = await rpc<{ plugins: PluginInfo[] }>("plugins.setEnabled", {
      pluginId,
      enabled,
    });

    setPlugins(result.plugins);
    setStatus(`Plugin ${enabled ? "enabled" : "disabled"}`);
  } catch (e: any) {
    setStatus(`Plugin error: ${e.message || String(e)}`);
  }
}

async function refreshRecents() {
  try {
    const result = await rpc<{ items: any[] }>("recent.list");
    setRecents(result.items || []);
  } catch {
    // ignore
  }
}

useEffect(() => {
  refreshRecents();
  void refreshPlugins();
  void refreshFeatureFlags();
  void refreshLocalAiStatus();
  void refreshAppMetadata();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  void refreshAssets(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshDocs(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshCodeFiles(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshSheets(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshMovies(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshModels(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshGames(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  void refreshWorkflows(projectRoot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [projectRoot]);

useEffect(() => {
  try {
    window.localStorage.setItem(
      "pl.layout.copilotDrawerOpen",
      String(copilotDrawerOpen)
    );
  } catch {
    // Ignore storage failures.
  }
}, [copilotDrawerOpen]);

useEffect(() => {
  try {
    window.localStorage.setItem(
      "pl.layout.physicsDrawerOpen",
      String(physicsDrawerOpen)
    );
  } catch {
    // ignore localStorage failures
  }
}, [physicsDrawerOpen]);

useEffect(() => {
  const unsubscribe = window.plMenu?.onMenuAction?.((channel) => {
    if (channel === "menu:new-project") {
      handleNewProject();
      return;
    }

    if (channel === "menu:open-project") {
      void handleOpenProject();
      return;
    }

    if (channel === "menu:import-project") {
      void handleImportProject();
      return;
    }

    if (channel === "menu:export-project") {
      void handleExportProject();
    }
  });

  return () => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  };
}, [projectRoot]);

  return (
  <div className="shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brandTitle">PL Creators Suite</div>
        <div className="brandSub">v0.0.1 • offline-first</div>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              className={`navItem ${isActive ? "active" : ""}`}
              onClick={() => setActive(item.id)}
              type="button"
            >
              <div className="navLabel">{item.label}</div>
              <div className="navHint">{item.hint}</div>
            </button>
          );
        })}
      </nav>

      <div className="sidebarFooter">
        <div className="tiny">Project: {projectRoot ? projectRoot : "(none)"}</div>
        <div className="tiny">Recent:</div>

        {recents.length === 0 ? (
          <div className="tiny">(none)</div>
        ) : (
          <div className="recentList">
            {recents.slice(0, 5).map((r) => (
              <button
                key={r.projectRoot}
                className="recentItem"
                type="button"
                onClick={async () => {
                  try {
                    setStatus("Opening project...");
                    const result = await rpc<{ projectRoot: string; manifest: any }>("project.open", {
                      projectRoot: r.projectRoot,
                    });
                    setProjectRoot(result.projectRoot);
                    setStatus(`Opened: ${result.projectRoot}`);
                    await refreshRecents();
                  } catch (e: any) {
                    setStatus(`Error: ${e.message}`);
                  }
                }}
                title={r.projectRoot}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <CollapsiblePanel 
        title="Local AI"
        defaultOpen={true}
        storageKey="pl.layout.panel.localAi"
      >

        {localAiStatus ? (
          <div className="recentList">
            <div className="recentItem">
              Status: {localAiStatus.available ? "Available" : "Not configured"}
            </div>
            <div className="recentItem">Provider: {localAiStatus.provider}</div>
            {localAiStatus.host && (
              <div className="recentItem">Host: {localAiStatus.host}</div>
            )}
            <div className="recentItem">
              Model: {localAiStatus.model || "(none)"}
            </div>
            <div className="recentItem">
              Models: {localAiStatus.models?.length || 0}
            </div>
            {!localAiStatus.available && (
              <div className="recentItem">Reason: {localAiStatus.reason}</div>
            )}
          </div>
        ) : (
          <div className="emptyState">Checking AI status...</div>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel 
        title="System Status" 
        defaultOpen={false}
        storageKey="pl.layout.panel.systemStatus"
      >

        {featureFlags ? (
          <div className="recentList">
            <div className="recentItem">
              Plugin System: {featureFlags.plugins ? "Enabled" : "Disabled"}
            </div>
            <div className="recentItem">
              Installed Plugins: {plugins.length}
            </div>
            <div className="recentItem">
              Local AI: {localAiStatus?.available ? "Available" : "Unavailable"}
            </div>
            <div className="recentItem">
              Cloud Sync: {featureFlags.cloudSync ? "Enabled" : "Disabled"}
            </div>
          </div>
        ) : (
          <div className="emptyState">Loading system status...</div>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Assets"
        defaultOpen={false}
        storageKey="pl.layout.panel.assets"
      >
        {projectRoot ? (
          <div className="recentList">
            <div className="recentItem">Asset Registry: Ready</div>
            <div className="recentItem">Assets: {assets.length}</div>
            <div className="recentList">
              <input
                className="input"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Asset name"
              />

              <select
                className="input"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
              >
                <option value="images">images</option>
                <option value="audio">audio</option>
                <option value="video">video</option>
                <option value="models">models</option>
                <option value="docs">docs</option>
                <option value="other">other</option>
              </select>

              <input
                className="input"
                value={assetRelativePath}
                onChange={(e) => setAssetRelativePath(e.target.value)}
                placeholder="relative/path.ext"
              />

              <input
                className="input"
                value={assetSourcePath}
                onChange={(e) => setAssetSourcePath(e.target.value)}
                placeholder="/absolute/path/to/file.ext"
              />
              <button
                className="btn"
                type="button"
                onClick={() => void handleChooseAssetFile()}
              >
                Choose File
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => void handleImportAsset()}
              >
                Import Asset
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => void handleRegisterAsset()}
              >
                Register Asset
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="emptyState">No assets registered</div>
            ) : (
              assets.map((asset) => (
                <div className="recentItem" key={asset.id}>
                  <strong>{asset.name}</strong>
                  <span>
                    {asset.type} · {asset.relativePath}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="emptyState">Open a project to view assets</div>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Workflows"
        defaultOpen={false}
        storageKey="pl.layout.panel.workflows"
      >
        {projectRoot ? (
          <div className="recentList">
            <div className="recentItem">Workflow Registry: Ready</div>
            <div className="recentItem">Workflows: {workflowsList.length}</div>

            <input
              className="input"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="daily-export"
            />

            <button
              className="btn"
              type="button"
              onClick={() => void handleCreateWorkflow()}
            >
              Create Workflow
            </button>

            <button
              className="btn"
              type="button"
              onClick={() => void refreshWorkflows(projectRoot)}
            >
              Refresh Workflows
            </button>

            {workflowsList.length === 0 ? (
              <div className="emptyState">No workflows yet</div>
            ) : (
              workflowsList.map((workflow) => (
                <button
                  className="btn"
                  key={workflow.name}
                  type="button"
                  style={{
                    width: "100%",
                    marginBottom: 6,
                    textAlign: "left",
                  }}
                  onClick={() => void handleOpenWorkflow(workflow.name)}
                  title={workflow.path}
                >
                  {workflow.name}
                  {activeWorkflowName === workflow.name ? " ✓" : ""}
                </button>
              ))
            )}

            {activeWorkflow ? (
              <div className="recentItem">
                <strong>{activeWorkflow.name}</strong>
                <span>
                  {activeWorkflow.enabled ? "Enabled" : "Disabled"} ·{" "}
                  {activeWorkflow.triggers.length} trigger(s) ·{" "}
                  {activeWorkflow.actions.length} action(s)
                </span>
                <span>{activeWorkflow.description || "No description"}</span>

                <div className="docsEditorActions">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => void handleRunWorkflowManual()}
                    disabled={workflowBusy}
                  >
                    {workflowBusy ? "Running..." : "Run Manual"}
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => void handleSaveWorkflow()}
                    disabled={workflowBusy}
                  >
                    Save Workflow
                  </button>
                </div>
              </div>
            ) : (
              <div className="emptyState">Open a workflow to run it.</div>
            )}

            {workflowRunResult && (
              <div className="recentItem">
                <strong>Last Run</strong>
                <span>Status: {workflowRunResult.status}</span>
                <span>{workflowRunResult.message}</span>
                <span>Steps: {workflowRunResult.steps.length}</span>

                {workflowRunResult.steps.map((step) => (
                  <span key={step.actionId}>
                    {step.status}: {step.actionName} — {step.message}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="emptyState">Open a project to use workflows.</div>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel 
        title="PLugins" 
        defaultOpen={false}
        storageKey="pl.layout.plugins"
      >

        {plugins.length === 0 ? (
          <div className="emptyState">No plugins installed</div>
        ) : (
          <div className="recentList">
            {plugins.map((plugin) => (
              <div className="recentItem" key={plugin.id}>
                <strong>{plugin.name}</strong>
                <span>
                  {plugin.version} · {plugin.enabled ? "Enabled" : "Disabled"}
                </span>
                <button
                  className="btn"
                  type="button"
                  onClick={() => void handleSetPluginEnabled(plugin.id, !plugin.enabled)}
>
                  {plugin.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        )}
      </CollapsiblePanel>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="topbarRight">
          <button className="btn" type="button" onClick={handleNewProject}>
            New Project
          </button>

          <button className="btn" type="button" onClick={handleOpenProject}>
            Open Project
          </button>

          <button
            className="btn"
            type="button"
            onClick={async () => {
              try {
                if (!projectRoot) return setStatus("No project open");
                setStatus("Exporting logs...");
                const result = await rpc<{ logPath: string }>("logs.export", { projectRoot });
                setStatus(`Logs: ${result.logPath}`);
                await refreshRecents();
              } catch (e: any) {
                setStatus(`Error: ${e.message}`);
              }
            }}
          >
            Export Logs
          </button>

          <button className="btn" type="button" onClick={handleExportProject}>
            Export Project
          </button>

          <button className="btn" type="button" onClick={handleImportProject}>
            Import Project
          </button>

        </div>
      </header>

      <section className="workspace">
        <WorkspaceHeader
          title={active}
          subtitle={projectRoot ? `Project: ${projectRoot}` : "No project open"}
          actions={
            <Toolbar>
              <Button type="button" variant="ghost" onClick={handleNewProject}>
                New
              </Button>
              <Button type="button" variant="ghost" onClick={handleOpenProject}>
                Open
              </Button>
              <Button type="button" variant="ghost" onClick={handleExportProject}>
                Export
              </Button>
            </Toolbar>
          }
        />

        <Workspace 
          active={active}
          projectRoot={projectRoot}
          docsList={docsList}
          newDocName={newDocName}
          setNewDocName={setNewDocName}
          activeDocName={activeDocName}
          docContent={docContent}
          setDocContent={setDocContent}
          docDirty={docDirty}
          setDocDirty={setDocDirty}
          onCreateDoc={handleCreateDoc}
          onOpenDoc={handleOpenDoc}
          onSaveDoc={handleSaveDoc}
          onCloseDoc={handleCloseDoc}
          codeFiles={codeFiles}
          newCodeFileName={newCodeFileName}
          setNewCodeFileName={setNewCodeFileName}
          activeCodeFileName={activeCodeFileName}
          activeCodeLanguage={activeCodeLanguage}
          codeContent={codeContent}
          setCodeContent={setCodeContent}
          codeDirty={codeDirty}
          setCodeDirty={setCodeDirty}
          onCreateCodeFile={handleCreateCodeFile}
          onOpenCodeFile={handleOpenCodeFile}
          onSaveCodeFile={handleSaveCodeFile}
          onCloseCodeFile={handleCloseCodeFile}
          sheetsList={sheetsList}
          newSheetName={newSheetName}
          setNewSheetName={setNewSheetName}
          activeSheetName={activeSheetName}
          sheetData={sheetData}
          sheetDirty={sheetDirty}
          onCreateSheet={handleCreateSheet}
          onOpenSheet={handleOpenSheet}
          onSaveSheet={handleSaveSheet}
          onCloseSheet={handleCloseSheet}
          onUpdateSheetCell={handleUpdateSheetCell}
          onAddSheetRow={handleAddSheetRow}
          onAddSheetColumn={handleAddSheetColumn}
          onDeleteLastSheetRow={handleDeleteLastSheetRow}
          onDeleteLastSheetColumn={handleDeleteLastSheetColumn}
          moviesList={moviesList}
          newMovieName={newMovieName}
          setNewMovieName={setNewMovieName}
          activeMovieName={activeMovieName}
          movieData={movieData}
          movieDirty={movieDirty}
          onCreateMovie={handleCreateMovie}
          onOpenMovie={handleOpenMovie}
          onSaveMovie={handleSaveMovie}
          onCloseMovie={handleCloseMovie}
          onUpdateMovieField={handleUpdateMovieField}
          newMovieClipName={newMovieClipName}
          setNewMovieClipName={setNewMovieClipName}
          newMovieClipTrackId={newMovieClipTrackId}
          setNewMovieClipTrackId={setNewMovieClipTrackId}
          newMovieClipStart={newMovieClipStart}
          setNewMovieClipStart={setNewMovieClipStart}
          newMovieClipDuration={newMovieClipDuration}
          setNewMovieClipDuration={setNewMovieClipDuration}
          onAddMovieClip={handleAddMovieClip}
          modelsList={modelsList}
          newModelName={newModelName}
          setNewModelName={setNewModelName}
          activeModelName={activeModelName}
          modelData={modelData}
          modelDirty={modelDirty}
          newModelObjectName={newModelObjectName}
          setNewModelObjectName={setNewModelObjectName}
          newModelPrimitive={newModelPrimitive}
          setNewModelPrimitive={setNewModelPrimitive}
          onCreateModel={handleCreateModel}
          onOpenModel={handleOpenModel}
          onSaveModel={handleSaveModel}
          onCloseModel={handleCloseModel}
          onUpdateModelField={handleUpdateModelField}
          onUpdateModelObjectVector={handleUpdateModelObjectVector}
          onAddModelObject={handleAddModelObject}
          gamesList={gamesList}
          newGameName={newGameName}
          setNewGameName={setNewGameName}
          activeGameName={activeGameName}
          gameData={gameData}
          gameDirty={gameDirty}
          newGameSceneName={newGameSceneName}
          setNewGameSceneName={setNewGameSceneName}
          newGameEntityName={newGameEntityName}
          setNewGameEntityName={setNewGameEntityName}
          newGameEntityType={newGameEntityType}
          setNewGameEntityType={setNewGameEntityType}
          newGameEntitySceneId={newGameEntitySceneId}
          setNewGameEntitySceneId={setNewGameEntitySceneId}
          onCreateGame={handleCreateGame}
          onOpenGame={handleOpenGame}
          onSaveGame={handleSaveGame}
          onCloseGame={handleCloseGame}
          onUpdateGameField={handleUpdateGameField}
          onAddGameScene={handleAddGameScene}
          onAddGameEntity={handleAddGameEntity}
          onDeleteMovieClip={handleDeleteMovieClip}
          onDeleteModelObject={handleDeleteModelObject}
          onDeleteGameEntity={handleDeleteGameEntity}
          onDeleteGameScene={handleDeleteGameScene}
        />
      </section>

      <section className={`copilotDrawer ${copilotDrawerOpen ? "open" : "closed"}`}>
        <div className="copilotDrawerHeader">
          <button
            className="panelTitle"
            type="button"
            onClick={() => setCopilotDrawerOpen((value) => !value)}
          >
            {copilotDrawerOpen ? "▼" : "▲"} Copilot
          </button>

          <div className="copilotDrawerMeta">
            {localAiStatus?.available
              ? `Local AI: ${localAiStatus.model || "available"}`
              : "Local AI unavailable"}
          </div>
        </div>

        {copilotDrawerOpen && (
          <div className="copilotDrawerBody">
            <textarea
              className="input copilotInput"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask the local copilot..."
              rows={3}
            />

            <div className="copilotActions">
              <label className="recentItem">
                <input
                  type="checkbox"
                  checked={allowProjectContext}
                  onChange={(e) => setAllowProjectContext(e.target.checked)}
                  disabled={!projectRoot}
                />
                Allow project context
              </label>

              <button
                className="btn"
                type="button"
                onClick={() => void handleSendAiPrompt()}
                disabled={aiBusy}
              >
                {aiBusy ? "Thinking..." : "Send"}
              </button>
            </div>

            {aiResponse ? (
              <div className="copilotResponse">
                <strong>Response</strong>
                <div>{aiResponse}</div>
              </div>
            ) : (
              <div className="emptyState">No response yet</div>
            )}
          </div>
        )}
      </section>

      <section className={`physicsDrawer ${physicsDrawerOpen ? "open" : "closed"}`}>
        <div className="physicsDrawerHeader">
          <button
            className="panelTitle"
            type="button"
            onClick={() => setPhysicsDrawerOpen((value) => !value)}
          >
            {physicsDrawerOpen ? "▼" : "▲"} Physics Engine
          </button>

          <div className="physicsDrawerMeta">
            Simulation / math engine tools
          </div>
        </div>

        {physicsDrawerOpen && (
          <div className="physicsDrawerBody">
            <PhysicsSmokePanel />
            <PhysicsPlaygroundPanel />
          </div>
        )}
      </section>

      <footer className="statusbar">
        <div className="statusLeft">Status: {status}</div>
        <div className="statusRight">
          {appMetadata
            ? `${appMetadata.productName} v${appMetadata.version}${appMetadata.isPackaged ? " packaged" : "dev"}`
            : "PL Creators Suite"}
        </div>
      </footer>

      {showNew && (
        <Modal title="Create New Project" onClose={() => setShowNew(false)}>
          <div className="fieldRow">
            <div className="label">Project name</div>
            <input
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Project"
            />
          </div>

          <div className="fieldRow">
            <div className="label">Base directory (optional)</div>
            <input
              className="input"
              value={newBaseDir}
              onChange={(e) => setNewBaseDir(e.target.value)}
              placeholder="Defaults to ~/PLProjects"
            />
          </div>

          <div className="row">
            <button
              className="btn"
              type="button"
              onClick={async () => {
                try {
                  setUiError("");
                  setStatus("Creating project...");
                  const result = await rpc<{ projectRoot: string }>("project.create", {
                    name: newName,
                    baseDir: newBaseDir || undefined,
                  });
                  setProjectRoot(result.projectRoot);
                  setStatus(`Created: ${result.projectRoot}`);
                  await refreshRecents();
                  setShowNew(false);
                } catch (e: any) {
                  setUiError(e.message || String(e));
                  setStatus("idle");
                }
              }}
            >
              Create
            </button>

            <button className="btn" type="button" onClick={() => setShowNew(false)}>
              Cancel
            </button>
          </div>

          {uiError && <div className="errorBox">{uiError}</div>}
        </Modal>
      )}

      {showOpen && (
        <Modal title="Open Project" onClose={() => setShowOpen(false)}>
          <div className="fieldRow">
            <div className="label">Project folder path</div>
            <input
              className="input"
              value={openPath}
              onChange={(e) => setOpenPath(e.target.value)}
              placeholder="/home/brandenbarnes/PLProjects/MyProject"
            />
          </div>

          <div className="row">
            <button
              className="btn"
              type="button"
              onClick={async () => {
                try {
                  setOpenError("");
                  const root = openPath.trim();
                  if (!root) {
                    setOpenError("Please enter a project folder path.");
                    return;
                  }

                  setStatus("Opening project...");
                  const result = await rpc<{ projectRoot: string; manifestPath: string; manifest: any }>(
                    "project.open",
                    { projectRoot: root }
                  );

                  setProjectRoot(result.projectRoot);
                  setStatus(`Opened: ${result.projectRoot}`);
                  await refreshRecents();
                  setShowOpen(false);
                } catch (e: any) {
                  setOpenError(e.message || String(e));
                  setStatus("idle");
                }
              }}
            >
              Open
            </button>

            <button className="btn" type="button" onClick={() => setShowOpen(false)}>
              Cancel
            </button>
          </div>

          {openError && <div className="errorBox">{openError}</div>}
        </Modal>
      )}
    </main>
  </div>
);
}

function PhysicsSmokePanel() {
  const expressionResult = evaluateNumericExpression("2 + 3 * 4");
  const variableExpressionResult = evaluateNumericExpression(
    "mass * gravity",
    {
      mass: 5,
      gravity: 9.80665,
    }
  );

  const metersFromFeet = convertDistance(10, "ft", "m");
  const distanceQuantity = distance(10, "m");
  const timeQuantity = time(2, "s");
  const velocityQuantity = divideDistanceByTime(distanceQuantity, timeQuantity, "m/s");

  const massQuantity = mass(5, "kg");
  const accelerationQuantity = acceleration(9.80665, "m/s^2");
  const forceQuantity = multiplyMassByAcceleration(
  massQuantity,
  accelerationQuantity,
  "N"
); 

  const vector = physicsVec2(3, 4);
  const vectorMagnitude = magnitudePhysicsVec2(vector);

  const body = createKinematicBody2D("smoke-body", physicsVec2(0, 0));
  const gravityBody = applyGravity2D(body);
  const steppedBody = stepKinematicBody2D(gravityBody, 1);

  const collisions = findAabbCollisions2D([
    {
      id: "box-a",
      position: physicsVec2(0, 0),
      size: physicsVec2(10, 10),
    },
    {
      id: "box-b",
      position: physicsVec2(5, 5),
      size: physicsVec2(10, 10),
    },
  ]);
      const baseWorld = createSimulationWorld2D("smoke-world", "Smoke World");

      const worldWithBodies = addBodyToWorld2D(
        addBodyToWorld2D(
          baseWorld,
          {
            ...createSimulationBody2D(
              "world-body-a",
              "Falling Body",
              physicsVec2(0, 0),
              physicsVec2(10, 10)
            ),
            velocity: physicsVec2(2, 0),
          }
        ),
        {
          ...createSimulationBody2D(
            "world-body-b",
            "Static Floor",
            physicsVec2(0, 12),
            physicsVec2(20, 4)
          ),
          isStatic: true,
        }
      );

      const steppedWorld = stepWorldOnce2D(worldWithBodies, 1);
      const noGravityWorld = setWorldGravityEnabled2D(worldWithBodies, false);
      const steppedNoGravityWorld = stepWorldOnce2D(noGravityWorld, 1);
      const fallingBody = steppedWorld.bodies.find(
        (body) => body.id === "world-body-a"
      );
      const noGravityBody = steppedNoGravityWorld.bodies.find(
        (body) => body.id === "world-body-a"
      );

        const impulseBody = applyImpulse2D(
          createSimulationBody2D(
            "impulse-body",
            "Impulse Body",
            physicsVec2(0, 0),
            physicsVec2(5, 5)
          ),
          physicsVec2(10, 0)
        );

        const overlapWorld = addBodyToWorld2D(
          addBodyToWorld2D(
            createSimulationWorld2D("overlap-world", "Overlap World"),
            {
              ...createSimulationBody2D(
                "overlap-a",
                "Overlap A",
                physicsVec2(0, 0),
                physicsVec2(10, 10)
              ),
              velocity: physicsVec2(2, 0),
            }
          ),
          {
            ...createSimulationBody2D(
              "overlap-b",
              "Overlap B",
              physicsVec2(5, 0),
              physicsVec2(10, 10)
            ),
            isStatic: true,
          }
        );

        const overlapWorldStepped = stepWorldOnce2D(overlapWorld, 0);
        const overlapResolvedWorld = resolveWorldCollisions2D(overlapWorldStepped);
        const overlapA = overlapResolvedWorld.bodies.find(
          (body) => body.id === "overlap-a"
        );

        const linearMotionValue = interpolateNumber(0, 100, 0.25, "linear");
        const easedMotionValue = interpolateNumber(0, 100, 0.25, "easeInOut");

        const interpolatedVec2 = interpolateVec2(
          physicsVec2(0, 0),
          physicsVec2(100, 50),
          0.5,
          "easeOut"
        );

        const sampledNumericKeyframe = sampleNumericKeyframes(
          [
            {
              id: "kf-1",
              time: 0,
              value: 0,
              easing: "easeInOut",
            },
            {
              id: "kf-2",
              time: 2,
              value: 100,
              easing: "linear",
            },
          ],
          1
        );

        const sampledVec2Keyframe = sampleVec2Keyframes(
          [
            {
              id: "pos-1",
              time: 0,
              value: physicsVec2(0, 0),
              easing: "easeOut",
            },
            {
              id: "pos-2",
              time: 2,
              value: physicsVec2(100, 50),
              easing: "linear",
            },
          ],
          1
        );

        const modelAdapterBody = modelObjectToPhysicsBody2D({
          id: "adapter-cube",
          name: "Adapter Cube",
          primitive: "cube",
          position: [3, 4, 0],
          rotation: [0, 0, 0],
          scale: [2, 2, 2],
        });

        const gameAdapterBody = gameEntityToPhysicsBody2D({
          id: "adapter-player",
          name: "Adapter Player",
          type: "player",
          x: 8,
          y: 6,
          properties: {
            width: 4,
            height: 5,
            mass: 2,
          },
        });

        const sampledAnimationMotion = sampleAnimationMotion2D(
          [
            {
              id: "pos-a",
              time: 0,
              x: 0,
              y: 0,
              easing: "easeInOut",
            },
            {
              id: "pos-b",
              time: 2,
              x: 100,
              y: 50,
              easing: "linear",
            },
          ],
          [
            {
              id: "opacity-a",
              time: 0,
              value: 0,
              easing: "linear",
            },
            {
              id: "opacity-b",
              time: 2,
              value: 1,
              easing: "linear",
            },
          ],
          1
        );

  return (
    <Panel title="Physics / Simulation Engine Smoke Test">
      <div className="physicsSmokeGrid">
        <div className="physicsSmokeCard">
          <strong>Expression</strong>
          <span>2 + 3 * 4</span>
          <code>
            {expressionResult.ok
              ? String(expressionResult.value)
              : expressionResult.error}
          </code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Unit Conversion</strong>
          <span>10 ft → meters</span>
          <code>{metersFromFeet.toFixed(4)} m</code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Quantity Velocity</strong>
          <span>10 m / 2 s</span>
          <code>{formatQuantity(velocityQuantity, 4)}</code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Quantity Force</strong>
          <span>5 kg * 9.80665 m/s²</span>
          <code>{formatQuantity(forceQuantity, 4)}</code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Variable Expression</strong>
          <span>mass * gravity, mass=5, gravity=9.80665</span>
          <code>
            {variableExpressionResult.ok
              ? String(variableExpressionResult.value.toFixed(4))
              : variableExpressionResult.error}
          </code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Vector Magnitude</strong>
          <span>Vec2(3, 4)</span>
          <code>{vectorMagnitude.toFixed(2)}</code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Gravity Step</strong>
          <span>body stepped for 1 second</span>
          <code>
            pos [{steppedBody.position.x.toFixed(2)},{" "}
            {steppedBody.position.y.toFixed(2)}]
          </code>
          <code>
            vel [{steppedBody.velocity.x.toFixed(2)},{" "}
            {steppedBody.velocity.y.toFixed(2)}]
          </code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Collision</strong>
          <span>box-a vs box-b</span>
          <code>
            {collisions.length > 0
              ? `${collisions.length} collision detected`
              : "no collision"}
          </code>
        </div>

        <div className="physicsSmokeCard">
          <strong>Simulation World</strong>
          <span>2 bodies, gravity enabled, stepped 1 second</span>
          <code>
            time {steppedWorld.timeSeconds.toFixed(2)}s ·{" "}
            {steppedWorld.collisions.length} collisions
          </code>
          <code>
            falling body pos [
            {fallingBody?.position.x.toFixed(2) ?? "0.00"},{" "}
            {fallingBody?.position.y.toFixed(2) ?? "0.00"}]
          </code>
          <code>
            no-gravity pos [
            {noGravityBody?.position.x.toFixed(2) ?? "0.00"},{" "}
            {noGravityBody?.position.y.toFixed(2) ?? "0.00"}]
          </code>
        </div>
      
        <div className="physicsSmokeCard">
          <strong>Rigid Body 2D</strong>
          <span>impulse + collision resolution</span>
          <code>
            impulse velocity [{impulseBody.velocity.x.toFixed(2)},{" "}
            {impulseBody.velocity.y.toFixed(2)}]
          </code>
          <code>
            resolved overlap-a pos [
            {overlapA?.position.x.toFixed(2) ?? "0.00"},{" "}
            {overlapA?.position.y.toFixed(2) ?? "0.00"}]
          </code>
        </div>
        
        <div className="physicsSmokeCard">
          <strong>Motion Curves</strong>
          <span>interpolation + keyframe sampling</span>
          <code>linear 0→100 @ 0.25 = {linearMotionValue.toFixed(2)}</code>
          <code>easeInOut 0→100 @ 0.25 = {easedMotionValue.toFixed(2)}</code>
          <code>
            vec2 easeOut @ 0.5 = [{interpolatedVec2.x.toFixed(2)},{" "}
            {interpolatedVec2.y.toFixed(2)}]
          </code>
          <code>
            sampled value @ 1s = {sampledNumericKeyframe.toFixed(2)}
          </code>
          <code>
            sampled vec2 @ 1s = [{sampledVec2Keyframe.x.toFixed(2)},{" "}
            {sampledVec2Keyframe.y.toFixed(2)}]
          </code>
        </div>
        
                <div className="physicsSmokeCard">
          <strong>Integration Contracts</strong>
          <span>model/game/animation adapters</span>
          <code>
            model body pos [{modelAdapterBody.position.x.toFixed(2)},{" "}
            {modelAdapterBody.position.y.toFixed(2)}]
          </code>
          <code>
            game body size [{gameAdapterBody.size.x.toFixed(2)},{" "}
            {gameAdapterBody.size.y.toFixed(2)}]
          </code>
          <code>
            animation sample [{sampledAnimationMotion.position.x.toFixed(2)},{" "}
            {sampledAnimationMotion.position.y.toFixed(2)}] opacity{" "}
            {sampledAnimationMotion.opacity.toFixed(2)}
          </code>
        </div>
      </div>
    </Panel>
  );
}

function createPlaygroundWorld(): SimulationWorld2D {
  const baseWorld = createSimulationWorld2D(
    "physics-playground",
    "Physics Playground"
  );

  const worldWithBall = addBodyToWorld2D(
    baseWorld,
    {
      ...createSimulationBody2D(
        "playground-ball",
        "Falling Body",
        physicsVec2(4, 0),
        physicsVec2(4, 4)
      ),
      velocity: physicsVec2(8, 0),
      restitution: 0.35,
      friction: 0.35,
    }
  );

  return addBodyToWorld2D(
    worldWithBall,
    {
      ...createSimulationBody2D(
        "playground-floor",
        "Static Floor",
        physicsVec2(0, 28),
        physicsVec2(42, 4)
      ),
      isStatic: true,
      restitution: 0.15,
      friction: 0.8,
    }
  );
}

function PhysicsPlaygroundPanel() {
  const [world, setWorld] = useState<SimulationWorld2D>(() =>
    createPlaygroundWorld()
  );

  const dynamicBodies = world.bodies.filter((body) => !body.isStatic);
  const staticBodies = world.bodies.filter((body) => body.isStatic);

  function handleStep() {
    setWorld((current) => stepWorldOnce2D(current, 1 / 30));
  }

  function handleStepTen() {
    setWorld((current) => {
      let nextWorld = current;

      for (let index = 0; index < 10; index += 1) {
        nextWorld = stepWorldOnce2D(nextWorld, 1 / 30);
      }

      return nextWorld;
    });
  }

  function handleReset() {
    setWorld(createPlaygroundWorld());
  }

  function handleToggleGravity() {
    setWorld((current) =>
      setWorldGravityEnabled2D(current, !current.settings.gravityEnabled)
    );
  }

  function handleAddBody() {
    setWorld((current) => {
      const bodyNumber = current.bodies.length + 1;
      const id = `playground-body-${Date.now()}`;

      return addBodyToWorld2D(
        current,
        {
          ...createSimulationBody2D(
            id,
            `Body ${bodyNumber}`,
            physicsVec2(2 + bodyNumber * 2, 0),
            physicsVec2(3, 3)
          ),
          velocity: physicsVec2(2 + bodyNumber, 0),
          restitution: 0.3,
          friction: 0.4,
        }
      );
    });
  }

  function handleResetMotion() {
    setWorld((current) => resetWorld2D(current));
  }

  return (
    <Panel title="Physics Playground">
      <div className="physicsPlayground">
        <div className="physicsPlaygroundToolbar">
          <button className="btn" type="button" onClick={handleStep}>
            Step
          </button>

          <button className="btn" type="button" onClick={handleStepTen}>
            Step x10
          </button>

          <button className="btn" type="button" onClick={handleToggleGravity}>
            Gravity: {world.settings.gravityEnabled ? "On" : "Off"}
          </button>

          <button className="btn" type="button" onClick={handleAddBody}>
            Add Body
          </button>

          <button className="btn" type="button" onClick={handleResetMotion}>
            Reset Motion
          </button>

          <button className="btn" type="button" onClick={handleReset}>
            Reset World
          </button>
        </div>

        <div className="physicsPlaygroundStats">
          <span>time: {world.timeSeconds.toFixed(2)}s</span>
          <span>dynamic: {dynamicBodies.length}</span>
          <span>static: {staticBodies.length}</span>
          <span>collisions: {world.collisions.length}</span>
          <span>
            gravity: [{world.settings.gravity.x.toFixed(2)},{" "}
            {world.settings.gravity.y.toFixed(2)}]
          </span>
        </div>

        <div className="physicsPlaygroundViewport">
          {world.bodies.map((body) => {
            const left = body.position.x * 10;
            const top = body.position.y * 10;
            const width = Math.max(8, body.size.x * 10);
            const height = Math.max(8, body.size.y * 10);

            return (
              <div
                className={
                  body.isStatic
                    ? "physicsPlaygroundBody physicsPlaygroundBodyStatic"
                    : "physicsPlaygroundBody"
                }
                key={body.id}
                style={{
                  left,
                  top,
                  width,
                  height,
                }}
                title={`${body.name} pos [${body.position.x.toFixed(
                  2
                )}, ${body.position.y.toFixed(2)}]`}
              >
                {body.isStatic ? "static" : body.name}
              </div>
            );
          })}
        </div>

        <div className="physicsPlaygroundBodyList">
          {world.bodies.map((body) => (
            <div className="physicsPlaygroundBodyRow" key={body.id}>
              <strong>{body.name}</strong>
              <span>{body.isStatic ? "static" : "dynamic"}</span>
              <code>
                pos [{body.position.x.toFixed(2)},{" "}
                {body.position.y.toFixed(2)}]
              </code>
              <code>
                vel [{body.velocity.x.toFixed(2)},{" "}
                {body.velocity.y.toFixed(2)}]
              </code>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

type WorkspaceProps = {
  active: AppId;
  projectRoot: string;
  docsList: DocInfo[];
  newDocName: string;
  setNewDocName: React.Dispatch<React.SetStateAction<string>>;
  activeDocName: string;
  docContent: string;
  setDocContent: React.Dispatch<React.SetStateAction<string>>;
  docDirty: boolean;
  setDocDirty: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateDoc: () => Promise<void>;
  onOpenDoc: (name: string) => Promise<void>;
  onSaveDoc: () => Promise<void>;
  onCloseDoc: () => void;
  codeFiles: CodeFileInfo[];
  newCodeFileName: string;
  setNewCodeFileName: React.Dispatch<React.SetStateAction<string>>;
  activeCodeFileName: string;
  activeCodeLanguage: string;
  codeContent: string;
  setCodeContent: React.Dispatch<React.SetStateAction<string>>;
  codeDirty: boolean;
  setCodeDirty: React.Dispatch<React.SetStateAction<boolean>>;
  onCreateCodeFile: () => Promise<void>;
  onOpenCodeFile: (name: string) => Promise<void>;
  onSaveCodeFile: () => Promise<void>;
  onCloseCodeFile: () => void;
  sheetsList: SheetInfo[];
  newSheetName: string;
  setNewSheetName: React.Dispatch<React.SetStateAction<string>>;
  activeSheetName: string;
  sheetData: SheetData | null;
  sheetDirty: boolean;
  onCreateSheet: () => Promise<void>;
  onOpenSheet: (name: string) => Promise<void>;
  onSaveSheet: () => Promise<void>;
  onCloseSheet: () => void;
  onUpdateSheetCell: (rowIndex: number, columnIndex: number, value: string) => void;
  onAddSheetRow: () => void;
  onAddSheetColumn: () => void;
  onDeleteLastSheetRow: () => void;
  onDeleteLastSheetColumn: () => void;
  moviesList: MovieInfo[];
  newMovieName: string;
  setNewMovieName: React.Dispatch<React.SetStateAction<string>>;
  activeMovieName: string;
  movieData: MovieData | null;
  movieDirty: boolean;
  onCreateMovie: () => Promise<void>;
  onOpenMovie: (name: string) => Promise<void>;
  onSaveMovie: () => Promise<void>;
  onCloseMovie: () => void;
  onUpdateMovieField: <K extends keyof MovieData>(
    field: K,
    value: MovieData[K]
  ) => void;
  newMovieClipName: string;
  setNewMovieClipName: React.Dispatch<React.SetStateAction<string>>;
  newMovieClipTrackId: string;
  setNewMovieClipTrackId: React.Dispatch<React.SetStateAction<string>>;
  newMovieClipStart: string;
  setNewMovieClipStart: React.Dispatch<React.SetStateAction<string>>;
  newMovieClipDuration: string;
  setNewMovieClipDuration: React.Dispatch<React.SetStateAction<string>>;
  onAddMovieClip: () => void;
  modelsList: ModelInfo[];
  newModelName: string;
  setNewModelName: React.Dispatch<React.SetStateAction<string>>;
  activeModelName: string;
  modelData: ModelData | null;
  modelDirty: boolean;
  newModelObjectName: string;
  setNewModelObjectName: React.Dispatch<React.SetStateAction<string>>;
  newModelPrimitive: string;
  setNewModelPrimitive: React.Dispatch<React.SetStateAction<string>>;
  onCreateModel: () => Promise<void>;
  onOpenModel: (name: string) => Promise<void>;
  onSaveModel: () => Promise<void>;
  onCloseModel: () => void;
  onUpdateModelObjectVector: (
    objectId: string,
    field: ModelVectorField,
    axis: ModelVectorAxis,
    value: number
  ) => void;
  onUpdateModelField: <K extends keyof ModelData>(
    field: K,
    value: ModelData[K]
  ) => void;
  onAddModelObject: () => void;
  gamesList: GameInfo[];
  newGameName: string;
  setNewGameName: React.Dispatch<React.SetStateAction<string>>;
  activeGameName: string;
  gameData: GameData | null;
  gameDirty: boolean;
  newGameSceneName: string;
  setNewGameSceneName: React.Dispatch<React.SetStateAction<string>>;
  newGameEntityName: string;
  setNewGameEntityName: React.Dispatch<React.SetStateAction<string>>;
  newGameEntityType: string;
  setNewGameEntityType: React.Dispatch<React.SetStateAction<string>>;
  newGameEntitySceneId: string;
  setNewGameEntitySceneId: React.Dispatch<React.SetStateAction<string>>;
  onCreateGame: () => Promise<void>;
  onOpenGame: (name: string) => Promise<void>;
  onSaveGame: () => Promise<void>;
  onCloseGame: () => void;
  onUpdateGameField: <K extends keyof GameData>(
    field: K,
    value: GameData[K]
  ) => void;
  onAddGameScene: () => void;
  onAddGameEntity: () => void;
  onDeleteMovieClip: (trackId: string, clipId: string) => void;
  onDeleteModelObject: (objectId: string) => void;
  onDeleteGameEntity: (sceneId: string, entityId: string) => void;
  onDeleteGameScene: (sceneId: string) => void;
};

function Workspace({
  active,
  projectRoot,
  docsList,
  newDocName,
  setNewDocName,
  activeDocName,
  docContent,
  setDocContent,
  docDirty,
  setDocDirty,
  onCreateDoc,
  onOpenDoc,
  onSaveDoc,
  onCloseDoc,
  codeFiles,
  newCodeFileName,
  setNewCodeFileName,
  activeCodeFileName,
  activeCodeLanguage,
  codeContent,
  setCodeContent,
  codeDirty,
  setCodeDirty,
  onCreateCodeFile,
  onOpenCodeFile,
  onSaveCodeFile,
  onCloseCodeFile,
  sheetsList,
  newSheetName,
  setNewSheetName,
  activeSheetName,
  sheetData,
  sheetDirty,
  onCreateSheet,
  onOpenSheet,
  onSaveSheet,
  onCloseSheet,
  onUpdateSheetCell,
  onAddSheetRow,
  onAddSheetColumn,
  onDeleteLastSheetRow,
  onDeleteLastSheetColumn,
  moviesList,
  newMovieName,
  setNewMovieName,
  activeMovieName,
  movieData,
  movieDirty,
  onCreateMovie,
  onOpenMovie,
  onSaveMovie,
  onCloseMovie,
  onUpdateMovieField,
  newMovieClipName,
  setNewMovieClipName,
  newMovieClipTrackId,
  setNewMovieClipTrackId,
  newMovieClipStart,
  setNewMovieClipStart,
  newMovieClipDuration,
  setNewMovieClipDuration,
  onAddMovieClip,
  modelsList,
  newModelName,
  setNewModelName,
  activeModelName,
  modelData,
  modelDirty,
  newModelObjectName,
  setNewModelObjectName,
  newModelPrimitive,
  setNewModelPrimitive,
  onCreateModel,
  onOpenModel,
  onSaveModel,
  onCloseModel,
  onUpdateModelField,
  onUpdateModelObjectVector,
  onAddModelObject,
  gamesList,
  newGameName,
  setNewGameName,
  activeGameName,
  gameData,
  gameDirty,
  newGameSceneName,
  setNewGameSceneName,
  newGameEntityName,
  setNewGameEntityName,
  newGameEntityType,
  setNewGameEntityType,
  newGameEntitySceneId,
  setNewGameEntitySceneId,
  onCreateGame,
  onOpenGame,
  onSaveGame,
  onCloseGame,
  onUpdateGameField,
  onAddGameScene,
  onAddGameEntity,
  onDeleteMovieClip,
  onDeleteModelObject,
  onDeleteGameEntity,
  onDeleteGameScene,
}: WorkspaceProps) {
  const movieTimeline = useMemo(() => {
    if (!movieData) return null;

    return stage3MovieToEngineTimeline(movieData);
  }, [movieData]);

  const [moviePlayback, setMoviePlayback] = useState(() =>
    createMoviePlaybackState(0, 24)
  );

  const [movieEngineDrawerOpen, setMovieEngineDrawerOpen] = useState(true);

  useEffect(() => {
    if (!movieTimeline) {
      setMoviePlayback(createMoviePlaybackState(0, 24));
      return;
    }

    const durationSeconds = calculateTimelineDuration(movieTimeline);

    setMoviePlayback((current) => ({
      ...current,
      durationSeconds,
      fps: movieTimeline.fps,
      currentTimeSeconds: Math.min(current.currentTimeSeconds, durationSeconds),
    }));
  }, [movieTimeline]);

  useEffect(() => {
    if (moviePlayback.status !== "playing") return;

    const timer = window.setInterval(() => {
      setMoviePlayback((current) => advanceMoviePlayback(current, 0.1));
    }, 100);

    return () => window.clearInterval(timer);
  }, [moviePlayback.status]);

  const movieTimelineActivity = movieTimeline
    ? getMovieTimelineActivity(movieTimeline, moviePlayback.currentTimeSeconds)
    : null;

  const movieTimelineLayout = movieTimeline
    ? getMovieTimelineLayout(movieTimeline, moviePlayback.currentTimeSeconds)
    : null;

  const movieActiveClips = movieTimelineActivity?.activeClips ?? [];

  const movieFrame = getMoviePlaybackFrame(moviePlayback);

  const movieDemoAnimationChannels = useMemo(
    () => createDemoMovieAnimationChannels(),
    []
  );

  const movieTransformSample = sampleMovieAnimationChannels(
    movieDemoAnimationChannels,
    moviePlayback.currentTimeSeconds
  );

  const movieRenderPreviewState = movieTimeline
    ? createMovieRenderPreviewState(
        movieTimeline,
        moviePlayback.currentTimeSeconds
      )
    : null;

  const [selectedModelObjectId, setSelectedModelObjectId] = useState<string | null>(
    null
  );

  const [modelEngineDrawerOpen, setModelEngineDrawerOpen] = useState(true);

  const [modelViewportCamera, setModelViewportCamera] =
    useState<ModelingCamera>(() => createModelingCamera());

  const modelingScene = useMemo(() => {
    if (!modelData) return null;

    return stage3ModelToModelingScene(modelData);
  }, [modelData]);

  useEffect(() => {
    if (!modelingScene) {
      setSelectedModelObjectId(null);
      return;
    }

    const selectedStillExists = modelingScene.objects.some(
      (object) => object.id === selectedModelObjectId
    );

    if (!selectedStillExists) {
      setSelectedModelObjectId(modelingScene.objects[0]?.id ?? null);
    }
  }, [modelingScene, selectedModelObjectId]);

  useEffect(() => {
    if (!modelingScene) {
      setModelViewportCamera(createModelingCamera());
      return;
    }

    setModelViewportCamera(modelingScene.camera);
  }, [modelingScene?.id]);

  const selectedModelObject =
    modelingScene?.objects.find((object) => object.id === selectedModelObjectId) ??
    null;

  const modelingViewportScene = useMemo(() => {
    if (!modelingScene) return null;

    return {
      ...modelingScene,
      camera: modelViewportCamera,
    };
  }, [modelingScene, modelViewportCamera]);

  const modelingViewportState = useMemo(() => {
    if (!modelingViewportScene) return null;

    return createModelingViewportState(
      modelingViewportScene,
      selectedModelObjectId
    );
  }, [modelingViewportScene, selectedModelObjectId]);

  const visibleModelObjects =
    modelingScene?.objects.filter((object) => object.visible).length ?? 0;

  const lockedModelObjects =
    modelingScene?.objects.filter((object) => object.locked).length ?? 0;

function handleZoomModelViewport(delta: number) {
  setModelViewportCamera((current) =>
    setModelingCameraZoom(current, current.zoom + delta)
  );
}

function handleResetModelViewportCamera() {
  if (!modelingScene) {
    setModelViewportCamera(createModelingCamera());
    return;
  }

  setModelViewportCamera(modelingScene.camera);
}

function handleToggleModelViewportCameraMode() {
  setModelViewportCamera((current) => toggleModelingCameraMode(current));
}

function handleNudgeModelViewportCamera(dx: number, dy: number, dz = 0) {
  setModelViewportCamera((current) => {
    const nextZ = Math.max(current.target.z + 2, current.position.z + dz);

    return setModelingCameraTarget(
      setModelingCameraPosition(
        current,
        physicsVec3(
          current.position.x + dx,
          current.position.y + dy,
          nextZ
        )
      ),
      physicsVec3(
        current.target.x + dx,
        current.target.y + dy,
        current.target.z
      )
    );
  });
}

function handleSetModelViewportView(view: "front" | "top" | "right") {
  const target = selectedModelObject?.transform.position ?? physicsVec3(0, 0, 0);

  if (view === "top") {
    setModelViewportCamera((current) =>
      setModelingCameraTarget(
        setModelingCameraPosition(
          current,
          physicsVec3(target.x, target.y + 12, target.z)
        ),
        physicsVec3(target.x, target.y, target.z)
      )
    );
    return;
  }

  if (view === "right") {
    setModelViewportCamera((current) =>
      setModelingCameraTarget(
        setModelingCameraPosition(
          current,
          physicsVec3(target.x + 12, target.y, target.z)
        ),
        physicsVec3(target.x, target.y, target.z)
      )
    );
    return;
  }

  setModelViewportCamera((current) =>
    setModelingCameraTarget(
      setModelingCameraPosition(
        current,
        physicsVec3(target.x, target.y, target.z + 12)
      ),
      physicsVec3(target.x, target.y, target.z)
    )
  );
}

function handleFrameSelectedModelObject() {
  if (!selectedModelObject) return;

  const target = selectedModelObject.transform.position;

  setModelViewportCamera((current) =>
    setModelingCameraTarget(
      setModelingCameraPosition(
        current,
        physicsVec3(target.x, target.y, target.z + 12)
      ),
      physicsVec3(target.x, target.y, target.z)
    )
  );
}
  const gameRuntimeProject = useMemo<GameRuntimeProject | null>(() => {
    if (!gameData) return null;

    return createGameRuntimeProject({
      id: activeGameName || gameData.name,
      title: gameData.title,
      targetPlatform: gameData.targetPlatform,
      genre: gameData.genre,
      scenes: gameData.scenes.map((scene) => ({
        id: scene.id,
        name: scene.name,
        entities: scene.entities.map((entity) => ({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          active: true,
          tags: [entity.type],
          layer: "default",
          components: [
            {
              ...createTransform2DComponent(`component-transform-${entity.id}`),
              transform: createGameTransform2D(
                createGameVec2(entity.x, entity.y)
              ),
            },
            createSprite2DComponent(`component-sprite-${entity.id}`),
          ],
        })),
      })),
    });
  }, [activeGameName, gameData]);

  const gameRuntimeEngine = useMemo(() => {
    if (!gameRuntimeProject) return null;

    return createGameRuntimeEngine(gameRuntimeProject);
  }, [gameRuntimeProject]);

  const [gameRuntimeState, setGameRuntimeState] =
    useState<GameRuntimeState | null>(null);

  const [gameEngineDrawerOpen, setGameEngineDrawerOpen] = useState(true);

  useEffect(() => {
    setGameRuntimeState(gameRuntimeEngine?.getState() ?? null);
  }, [gameRuntimeEngine]);

  const selectedGameRuntimeScene =
    gameRuntimeState?.project.scenes.find(
      (scene) => scene.id === gameRuntimeState.selection.sceneId
    ) ?? null;

  const selectedGameRuntimeEntity =
    selectedGameRuntimeScene?.entities.find(
      (entity) => entity.id === gameRuntimeState?.selection.entityId
    ) ?? null;

  const activeGameRuntimeScene =
    gameRuntimeState?.project.scenes.find(
      (scene) => scene.id === gameRuntimeState.activeSceneId
    ) ?? null;

  function handleStartGamePreview() {
    if (!gameRuntimeEngine) return;

    setGameRuntimeState(startGamePreview(gameRuntimeEngine));
  }

  function handlePauseGamePreview() {
    if (!gameRuntimeEngine) return;

    setGameRuntimeState(pauseGamePreview(gameRuntimeEngine));
  }

  function handleResumeGamePreview() {
    if (!gameRuntimeEngine) return;

    setGameRuntimeState(resumeGamePreview(gameRuntimeEngine));
  }

  function handleStopGamePreview() {
    if (!gameRuntimeEngine) return;

    setGameRuntimeState(stopGamePreview(gameRuntimeEngine));
  }

  function handleStepGamePreviewFrame() {
    if (!gameRuntimeEngine) return;

    setGameRuntimeState(stepGamePreviewFrame(gameRuntimeEngine));
  }
  switch (active) {
    case "code":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Code Files">
              {!projectRoot && (
                <div className="emptyState">Open a project to use Code IDE.</div>
              )}

              {projectRoot && (
                <>
                  <input
                    className="input"
                    value={newCodeFileName}
                    onChange={(e) => setNewCodeFileName(e.target.value)}
                    placeholder="main.py"
                  />

                  <button
                    className="btn"
                    type="button"
                    onClick={() => void onCreateCodeFile()}
                  >
                    Create
                  </button>

                  <div style={{ marginTop: 12 }}>
                    {codeFiles.length === 0 ? (
                      <div className="emptyState">No code files yet</div>
                    ) : (
                      codeFiles.map((file) => (
                        <button
                          key={file.name}
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenCodeFile(file.name)}
                        >
                          {file.name}
                          {activeCodeFileName === file.name ? " ✓" : ""}
                          <span style={{ display: "block", opacity: 0.7 }}>
                            {file.language}
                          </span>
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
                activeCodeFileName
                  ? `${activeCodeFileName}${codeDirty ? " *" : ""}`
                  : "No code file selected"
              }
            >
              {activeCodeFileName ? (
                <>
                  <div className="codeMeta">
                    <span>{activeCodeLanguage || "Plain Text"}</span>
                    <span className={codeDirty ? "docsDirty" : "docsSaved"}>
                      {codeDirty ? "Unsaved changes" : "Saved"}
                    </span>
                  </div>

                  <textarea
                    className="codeEditor"
                    value={codeContent}
                    onChange={(e) => {
                      setCodeContent(e.target.value);
                      setCodeDirty(true);
                    }}
                    spellCheck={false}
                  />

                  <div className="docsEditorActions">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => onCloseCodeFile()}
                    >
                      Close File
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => void onSaveCodeFile()}
                    >
                      Save File
                    </button>
                  </div>
                </>
              ) : (
                <div className="emptyState">Create or open a code file.</div>
              )}
            </Panel>
          </section>
        </div>
      );
    case "game":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Games">
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
                    className="btn"
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
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenGame(game.name)}
                        >
                          {game.name}
                          {activeGameName === game.name ? " ✓" : ""}
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
                            onClick={handleStartGamePreview}
                          >
                            Preview
                          </button>

                          <button
                            className="btn"
                            type="button"
                            onClick={handlePauseGamePreview}
                          >
                            Pause
                          </button>

                          <button
                            className="btn"
                            type="button"
                            onClick={handleResumeGamePreview}
                          >
                            Resume
                          </button>

                          <button
                            className="btn"
                            type="button"
                            onClick={handleStepGamePreviewFrame}
                          >
                            Step Frame
                          </button>

                          <button
                            className="btn"
                            type="button"
                            onClick={handleStopGamePreview}
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
                      {gameEngineDrawerOpen ? "▼" : "▲"} Game Runtime Debug
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
                          ? "Runtime debug drawer is closed."
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
                    <div className="gameSectionTitle">Scene Graph Stub</div>

                    {gameData.scenes.map((scene) => (
                      <div className="gameSceneBlock" key={scene.id}>
                        <div className="gameSceneHeader">
                          <strong>{scene.name}</strong>

                          <span>{scene.entities.length} entities</span>

                          <button
                            className="btn btn-ghost"
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
                                onClick={() => {
                                  if (!gameRuntimeEngine) return;
                              
                                  setGameRuntimeState(
                                    gameRuntimeEngine.selectEntity({
                                      sceneId: scene.id,
                                      entityId: entity.id,
                                    })
                                  );
                                }}
                              >

                                <button
                                  className="btn btn-ghost"
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
                      className="btn"
                      type="button"
                      onClick={() => onCloseGame()}
                    >
                      Close Game
                    </button>

                    <button
                      className="btn"
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
    case "movie":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Movies">
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
                    className="btn"
                    type="button"
                    onClick={() => void onCreateMovie()}
                  >
                    Create
                  </button>

                  <div style={{ marginTop: 12 }}>
                    {moviesList.length === 0 ? (
                      <div className="emptyState">No movies yet</div>
                    ) : (
                      moviesList.map((movie) => (
                        <button
                          key={movie.name}
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenMovie(movie.name)}
                        >
                          {movie.name}
                          {activeMovieName === movie.name ? " ✓" : ""}
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
                        {movieEngineDrawerOpen ? "▼" : "▲"} Timeline Engine / Preview
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
                        onClick={() =>
                          setMoviePlayback((current) =>
                            playMovieTimeline(current)
                          )
                        }
                      >
                        Play
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={() =>
                          setMoviePlayback((current) =>
                            pauseMovieTimeline(current)
                          )
                        }
                      >
                        Pause
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={() =>
                          setMoviePlayback((current) =>
                            stopMovieTimeline(current)
                          )
                        }
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
                          setMoviePlayback((current) =>
                            seekMovieTimeline(current, Number(e.target.value))
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
                              className="btn btn-ghost"
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
                  className="btn"
                  type="button"
                  onClick={() => onCloseMovie()}
                >
                  Close Movie
                </button>

                <button
                  className="btn"
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
    case "docs":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Documents">
              {!projectRoot && <div className="emptyState">Open a project to use Docs.</div>}

              {projectRoot && (
                <>
                  <input
                    className="input"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="new-doc.md"
                  />

                  <button className="btn" type="button" onClick={() => void onCreateDoc()}>
                    Create
                  </button>

                  <div style={{ marginTop: 12 }}>
                    {docsList.length === 0 ? (
                      <div className="emptyState">No documents yet</div>
                    ) : (
                      docsList.map((doc) => (
                        <button
                          key={doc.name}
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenDoc(doc.name)}
                        >
                          {doc.name}
                          {activeDocName === doc.name ? " ✓" : ""}
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
                activeDocName
                  ? `${activeDocName}${docDirty ? " *" : ""}`
                  : "No document selected"
              }
            >
              {activeDocName ? (
                <>
                  <textarea
                    className="docsEditor"
                    value={docContent}
                    onChange={(e) => {
                      setDocContent(e.target.value);
                      setDocDirty(true);
                    }}
                    spellCheck={true}
                  />

                  <div className="docsEditorActions">
                    <span className={docDirty ? "docsDirty" : "docsSaved"}>
                      {docDirty ? "Unsaved changes" : "Saved"}
                    </span>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => onCloseDoc()}
                    >
                      Close Document
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => void onSaveDoc()}
                    >
                      Save Document
                    </button>
                  </div>
                </>
              ) : (
                <div className="emptyState">Create or open a document.</div>
              )}
            </Panel>
          </section>
        </div>
      );
    case "sheets":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Sheets">
              {!projectRoot && (
                <div className="emptyState">Open a project to use Sheets.</div>
              )}

              {projectRoot && (
                <>
                  <input
                    className="input"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="budget"
                  />

                  <button
                    className="btn"
                    type="button"
                    onClick={() => void onCreateSheet()}
                  >
                    Create
                  </button>

                  <div style={{ marginTop: 12 }}>
                    {sheetsList.length === 0 ? (
                      <div className="emptyState">No sheets yet</div>
                    ) : (
                      sheetsList.map((sheet) => (
                        <button
                          key={sheet.name}
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenSheet(sheet.name)}
                        >
                          {sheet.name}
                          {activeSheetName === sheet.name ? " ✓" : ""}
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
                activeSheetName
                  ? `${activeSheetName}${sheetDirty ? " *" : ""}`
                  : "No sheet selected"
              }
            >
              {activeSheetName && sheetData ? (
                <>
                  <div className="sheetMeta">
                    <span>
                      {sheetData.rows} rows × {sheetData.columns} columns
                    </span>

                    <span className={sheetDirty ? "docsDirty" : "docsSaved"}>
                      {sheetDirty ? "Unsaved changes" : "Saved"}
                    </span>
                  </div>

                  <div className="sheetToolbar">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => onAddSheetRow()}
                    >
                      Add Row
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => onAddSheetColumn()}
                    >
                      Add Column
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => onDeleteLastSheetRow()}
                    >
                      Delete Last Row
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => onDeleteLastSheetColumn()}
                    >
                      Delete Last Column
                    </button>
                  </div>

                  <div className="sheetGridWrap">
                    <table className="sheetGrid">
                      <thead>
                        <tr>
                          <th></th>
                          {Array.from({ length: sheetData.columns }, (_, columnIndex) => (
                            <th key={columnIndex}>
                              {String.fromCharCode(65 + columnIndex)}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {sheetData.cells.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <th>{rowIndex + 1}</th>

                            {row.map((cell, columnIndex) => (
                              <td key={columnIndex}>
                                <input
                                  className="sheetCell"
                                  value={cell}
                                  onChange={(e) =>
                                    onUpdateSheetCell(
                                      rowIndex,
                                      columnIndex,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="docsEditorActions">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => onCloseSheet()}
                    >
                      Close Sheet
                    </button>

                    <button
                      className="btn"
                      type="button"
                      onClick={() => void onSaveSheet()}
                    >
                      Save Sheet
                    </button>
                  </div>
                </>
              ) : (
                <div className="emptyState">Create or open a sheet.</div>
              )}
            </Panel>
          </section>
        </div>
      );
    case "modeler":
      return (
        <div className="workspaceSplit">
          <aside className="workspaceSplitSide">
            <Panel title="Model Scenes">
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
                    className="btn"
                    type="button"
                    onClick={() => void onCreateModel()}
                  >
                    Create
                  </button>

                  <div style={{ marginTop: 12 }}>
                    {modelsList.length === 0 ? (
                      <div className="emptyState">No model scenes yet</div>
                    ) : (
                      modelsList.map((model) => (
                        <button
                          key={model.name}
                          className="btn"
                          type="button"
                          style={{
                            width: "100%",
                            marginBottom: 6,
                            textAlign: "left",
                          }}
                          onClick={() => void onOpenModel(model.name)}
                        >
                          {model.name}
                          {activeModelName === model.name ? " ✓" : ""}
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
                    <div className="modelPreviewTitle">Viewport Stub</div>
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
                              className="btn btn-ghost"
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
                         onClick={() => handleZoomModelViewport(0.2)}
                       >
                         Zoom In
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleZoomModelViewport(-0.2)}
                       >
                         Zoom Out
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={handleToggleModelViewportCameraMode}
                       >
                         Toggle {modelViewportCamera.mode === "perspective" ? "Ortho" : "Perspective"}
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={handleResetModelViewportCamera}
                       >
                         Reset Camera
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleSetModelViewportView("front")}
                       >
                         Front View
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleSetModelViewportView("top")}
                       >
                         Top View
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleSetModelViewportView("right")}
                       >
                         Right View
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={handleFrameSelectedModelObject}
                         disabled={!selectedModelObject}
                       >
                         Frame Selected
                       </button>
                     </div>

                     <div className="modelCameraNudgeGrid">
                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(0, 1)}
                       >
                         Up
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(-1, 0)}
                       >
                         Left
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(1, 0)}
                       >
                         Right
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(0, -1)}
                       >
                         Down
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(0, 0, 1)}
                       >
                         Back
                       </button>

                       <button
                         className="btn btn-ghost"
                         type="button"
                         onClick={() => handleNudgeModelViewportCamera(0, 0, -1)}
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
                      className="btn"
                      type="button"
                      onClick={() => onCloseModel()}
                    >
                      Close Model
                    </button>

                    <button
                      className="btn"
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
    default:
      return null;
  }
}

