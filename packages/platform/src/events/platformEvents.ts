export interface ProjectOpenedEvent {
  projectId: string;

  projectPath: string;
}


export interface ProjectChangedEvent {
  projectId: string;

  reason: string;
}


export interface AssetChangedEvent {
  projectId: string;

  assetId: string;

  change:
    | "created"
    | "updated"
    | "moved"
    | "deleted"
    | "missing";
}


export interface SliceActivatedEvent {
  slice:
    | "code"
    | "docs"
    | "sheets"
    | "modeler"
    | "movie"
    | "game";
}


export interface SliceDirtyChangedEvent {
  slice:
    | "code"
    | "docs"
    | "sheets"
    | "modeler"
    | "movie"
    | "game";

  dirty: boolean;
}


export interface EngineStatusChangedEvent {
  engineId: string;

  status:
    | "starting"
    | "ready"
    | "degraded"
    | "failed"
    | "stopped";

  message?: string;
}


export interface TaskStartedEvent {
  taskId: string;

  taskType: string;
}


export interface TaskProgressEvent {
  taskId: string;

  percent?: number;

  message?: string;
}


export interface TaskCompletedEvent {
  taskId: string;

  success: boolean;
}


export interface TerminalProcessEvent {
  terminalId: string;

  processId?: number;

  command?: string;
}


export interface ExtensionStateChangedEvent {
  extensionId: string;

  enabled: boolean;

  reason?: string;
}


export interface AIStatusChangedEvent {
  providerId?: string;

  available: boolean;

  local: boolean;

  message?: string;
}


export interface CloudStatusChangedEvent {
  providerId?: string;

  connected: boolean;

  message?: string;
}


export interface CollaborationStateChangedEvent {
  projectId: string;

  state:
    | "offline"
    | "connecting"
    | "connected"
    | "conflict"
    | "disconnected";

  participantCount?: number;
}


export interface PlatformEventMap {
  "project.opened":
    ProjectOpenedEvent;

  "project.changed":
    ProjectChangedEvent;

  "asset.changed":
    AssetChangedEvent;

  "slice.activated":
    SliceActivatedEvent;

  "slice.dirty-changed":
    SliceDirtyChangedEvent;

  "engine.status-changed":
    EngineStatusChangedEvent;

  "task.started":
    TaskStartedEvent;

  "task.progress":
    TaskProgressEvent;

  "task.completed":
    TaskCompletedEvent;

  "terminal.process-started":
    TerminalProcessEvent;

  "terminal.process-exited":
    TerminalProcessEvent;

  "extension.state-changed":
    ExtensionStateChangedEvent;

  "ai.status-changed":
    AIStatusChangedEvent;

  "cloud.status-changed":
    CloudStatusChangedEvent;

  "collaboration.state-changed":
    CollaborationStateChangedEvent;
}
