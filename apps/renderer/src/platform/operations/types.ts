export type OperationalTaskStatus =
  | "queued"
  | "running"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed"
  | "interrupted";

export type OperationalTaskSource =
  | "live"
  | "history";

export interface OperationalTaskRow {
  id: string;
  status: OperationalTaskStatus;
  source: OperationalTaskSource;
  kind?: string;
  title?: string;
  progressPercent?: number;
  createdAt?: string;
  startedAt?: string;
  finishedAt?: string;
  failureCode?: string;
  warningCount?: number;
  supportsCancellation?: boolean;
}

export type OperationalTaskResult = {
  tasks: OperationalTaskRow[];
  historyAvailable: boolean;
};

