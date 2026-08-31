export type RecoveryState =
  | "clean"
  | "autosaved"
  | "interrupted"
  | "recoverable"
  | "stale";


export type RecoveryEntryKind =
  | "autosave"
  | "journal"
  | "checkpoint"
  | "snapshot"
  | "backup";


export interface RecoveryEntry {
  id: string;

  kind:
    RecoveryEntryKind;

  projectId?: string;

  resourceId?: string;

  createdAt: string;

  updatedAt: string;

  sourceUpdatedAt?: string;

  recoverable:
    boolean;

  metadata?:
    Record<
      string,
      unknown
    >;
}


export interface RecoveryStatus {
  state:
    RecoveryState;

  projectRoot:
    string;

  sessionId:
    string | null;

  sessionStartedAt:
    string | null;

  cleanShutdown:
    boolean;

  autosaveCount:
    number;

  journalEntryCount:
    number;

  recoverableCount:
    number;

  latestRecoveryAt:
    string | null;

  entries:
    readonly RecoveryEntry[];
}


export interface AutosaveRecord<
  TPayload = unknown,
> {
  schemaVersion:
    number;

  id:
    string;

  projectRoot:
    string;

  resourceId:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  sourceUpdatedAt?:
    string;

  payload:
    TPayload;
}


export interface CrashJournalEntry {
  id:
    string;

  timestamp:
    string;

  sessionId:
    string;

  type:
    string;

  resourceId?:
    string;

  metadata?:
    Record<
      string,
      unknown
    >;
}
