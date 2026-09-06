import type {
  TaskProgress,
  TaskWarning,
} from "../tasks";

export type FormatDirection =
  | "import"
  | "export"
  | "both";

export type FormatCategory =
  | "document"
  | "image"
  | "media"
  | "data"
  | "archive"
  | "project"
  | "model"
  | "other";

export interface FormatOption {
  id: string;
  label: string;
  description?: string;

  type:
    | "boolean"
    | "number"
    | "string"
    | "select";

  required?: boolean;
  defaultValue?: unknown;

  choices?: readonly {
    value: string;
    label: string;
  }[];
}

export interface FormatPreset {
  id: string;
  label: string;
  description?: string;

  options: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatDescriptor {
  id: string;
  displayName: string;
  category: FormatCategory;

  extensions: readonly string[];
  mimeTypes?: readonly string[];

  direction: FormatDirection;

  supportsPreview: boolean;
  supportsCancellation: boolean;
  supportsRoundTrip: boolean;

  options?: readonly FormatOption[];
  presets?: readonly FormatPreset[];

  metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatPreview {
  summary: string;
  warnings: readonly TaskWarning[];

  metadata?: Readonly<
    Record<string, unknown>
  >;

  sample?: unknown;
}

export interface FormatOperationContext {
  signal: AbortSignal;

  reportProgress(
    progress: Partial<TaskProgress>,
  ): void;

  reportWarning(
    warning: TaskWarning,
  ): void;
}

export interface FormatPreviewRequest {
  sourcePath: string;
  options?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatImportRequest {
  sourcePath: string;
  destinationPath?: string;

  options?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatImportResult<
  TResult = unknown,
> {
  value: TResult;
  warnings: readonly TaskWarning[];

  outputPaths?: readonly string[];

  metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatExportRequest<
  TInput = unknown,
> {
  value: TInput;
  destinationPath: string;

  options?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatExportResult {
  outputPath: string;
  warnings: readonly TaskWarning[];

  metadata?: Readonly<
    Record<string, unknown>
  >;
}

export interface FormatAdapter<
  TImportResult = unknown,
  TExportInput = unknown,
> {
  descriptor: FormatDescriptor;

  preview?(
    request: FormatPreviewRequest,
    context: FormatOperationContext,
  ): Promise<FormatPreview>;

  import?(
    request: FormatImportRequest,
    context: FormatOperationContext,
  ): Promise<
    FormatImportResult<TImportResult>
  >;

  export?(
    request:
      FormatExportRequest<TExportInput>,
    context: FormatOperationContext,
  ): Promise<FormatExportResult>;
}

export interface FormatRoundTripFixture {
  id: string;
  adapterId: string;
  sourcePath: string;

  options?: Readonly<
    Record<string, unknown>
  >;

  expectedWarnings?: readonly string[];

  metadata?: Readonly<
    Record<string, unknown>
  >;
}
