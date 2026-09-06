import type {
  TaskKind,
  TaskProgress,
  TaskResourceUsage,
  TaskWarning,
} from "./types";

export type WorkerRuntime =
  | "main"
  | "node-worker"
  | "web-worker"
  | "process"
  | "native"
  | "remote";

export interface WorkerCapability {
  id: string;
  taskKinds: readonly TaskKind[];
  supportsCancellation: boolean;
  supportsProgress: boolean;
  supportsResourceUsage: boolean;
}

export interface WorkerDescriptor {
  id: string;
  displayName: string;
  runtime: WorkerRuntime;
  capabilities: readonly WorkerCapability[];
  version?: string;
  metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface WorkerJobRequest<
  TInput = unknown,
> {
  taskId: string;
  kind: TaskKind;
  input: TInput;
  metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface WorkerExecutionContext {
  signal: AbortSignal;

  reportProgress(
    progress: Partial<TaskProgress>,
  ): void;

  reportWarning(
    warning: TaskWarning,
  ): void;

  reportResourceUsage(
    usage: TaskResourceUsage,
  ): void;
}

export interface WorkerJobResult<
  TResult = unknown,
> {
  result: TResult;
  warnings?: readonly TaskWarning[];
  resourceUsage?: TaskResourceUsage;
}

export interface TaskWorker {
  descriptor: WorkerDescriptor;

  canHandle(
    request: WorkerJobRequest,
  ): boolean;

  execute<
    TInput = unknown,
    TResult = unknown,
  >(
    request: WorkerJobRequest<TInput>,
    context: WorkerExecutionContext,
  ): Promise<
    WorkerJobResult<TResult>
  >;
}
