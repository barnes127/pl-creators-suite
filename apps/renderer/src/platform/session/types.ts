import type {
  ShellPanelLayout,
} from "../shell/types";


export const CREATOR_SESSION_SCHEMA_VERSION =
  1;


export type CreatorSessionResumePolicy =
  "metadata-only";


export interface CreatorSessionResourceRef {
  kind:
    string;

  id:
    string;

  label?:
    string;
}


export interface CreatorSessionTaskRef {
  id:
    string;

  status?:
    string;
}


export interface CreatorSessionTerminalRef {
  id:
    string;

  profileId?:
    string;

  workingDirectory?:
    string;
}


export interface CreatorSessionRecoveryRef {
  kind:
    "autosave" |
    "checkpoint" |
    "snapshot" |
    "journal";

  id:
    string;
}


export interface CreatorSessionRecord {
  schemaVersion:
    typeof CREATOR_SESSION_SCHEMA_VERSION;

  id:
    string;

  profileId:
    string;

  projectRoot:
    string | null;

  activeWorkspace:
    string;

  layout:
    ShellPanelLayout;

  openResources:
    readonly CreatorSessionResourceRef[];

  selectedResources:
    readonly CreatorSessionResourceRef[];

  taskRefs:
    readonly CreatorSessionTaskRef[];

  terminalRefs:
    readonly CreatorSessionTerminalRef[];

  recoveryRefs:
    readonly CreatorSessionRecoveryRef[];

  resumePolicy:
    CreatorSessionResumePolicy;

  startedAt:
    string;

  updatedAt:
    string;

  cleanShutdown:
    boolean;
}


export interface CreatorSessionStore {
  schemaVersion:
    typeof CREATOR_SESSION_SCHEMA_VERSION;

  activeSessionId:
    string | null;

  sessions:
    readonly CreatorSessionRecord[];
}


export type CreatorSessionLoadStatus =
  | "ok"
  | "missing"
  | "recovered"
  | "incompatible";


export interface CreatorSessionLoadResult {
  status:
    CreatorSessionLoadStatus;

  state:
    CreatorSessionStore;

  sourceSchemaVersion?:
    number;
}


export interface SessionStorageLike {
  getItem(
    key: string,
  ):
    string | null;

  setItem(
    key: string,
    value: string,
  ):
    void;

  removeItem(
    key: string,
  ):
    void;
}
