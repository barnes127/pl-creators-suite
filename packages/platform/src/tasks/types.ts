export type TaskKind =
  | "calculation"
  | "render"
  | "build"
  | "import"
  | "export"
  | "simulation"
  | "indexing"
  | "conversion"
  | "workflow"
  | "maintenance"
  | "other";

export type TaskStatus =
  | "queued"
  | "running"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed"
  | "interrupted";

export type TaskPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

export interface TaskProgress {
  phase: string;
  completed: number | null;
  total: number | null;
  percent: number | null;
  message: string;
  currentItem?: string | null;
}

export interface TaskWarning {
  code: string;
  message: string;
  details?: unknown;
}

export interface TaskFailure {
  code: string;
  message: string;
  details?: unknown;
  retryable?: boolean;
}

export interface TaskResourceUsage {
  cpuPercent?: number | null;
  memoryBytes?: number | null;
  diskReadBytes?: number | null;
  diskWriteBytes?: number | null;
  gpuPercent?: number | null;
  elapsedMs?: number | null;
}

export interface TaskDefinition<TInput = unknown> {
  id?: string;
  handlerId?: string;
  kind: TaskKind;
  title: string;
  description?: string;
  priority?: TaskPriority;
  input: TInput;
  supportsCancellation?: boolean;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface TaskRecord<TInput = unknown, TResult = unknown> {
  id: string;
  kind: TaskKind;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  input: TInput;
  result?: TResult;
  progress: TaskProgress;
  warnings: readonly TaskWarning[];
  failure?: TaskFailure;
  resourceUsage?: TaskResourceUsage;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface TaskExecutionContext {
  signal: AbortSignal;

  reportProgress(progress: Partial<TaskProgress>): void;

  reportWarning(warning: TaskWarning): void;

  reportResourceUsage(usage: TaskResourceUsage): void;
}

export type TaskHandler<TInput = unknown, TResult = unknown> = (
  input: TInput,
  context: TaskExecutionContext,
) => Promise<TResult>;

export interface TaskService {
  start<
    TInput = unknown,
    TResult = unknown,
  >(
    definition: TaskDefinition<TInput>,
  ): Promise<TaskRecord<TInput, TResult>>;

  cancel(
    taskId: string,
  ): Promise<TaskRecord | null>;

  get(
    taskId: string,
  ): Promise<TaskRecord | null>;

  list(): Promise<readonly TaskRecord[]>;
}
