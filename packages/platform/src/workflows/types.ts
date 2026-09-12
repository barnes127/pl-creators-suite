import type {
  TaskDefinition,
} from "../tasks";

export interface WorkflowSummary {
  name: string;

  path?: string;
}

export type WorkflowDocument =
  Readonly<
    Record<
      string,
      unknown
    >
  >;

export interface WorkflowReadResult {
  name: string;

  path?: string;

  workflow:
    WorkflowDocument;
}

export interface WorkflowCreateResult
  extends WorkflowReadResult {}

export interface WorkflowSaveOptions {
  overwrite?:
    boolean;
}

export interface WorkflowDeleteOptions {
  destructive?:
    boolean;
}

export interface WorkflowDeleteResult {
  name: string;

  path?: string;

  deleted: boolean;
}

export interface WorkflowApiAdapter {
  list(
    projectRoot: string,
  ):
    Promise<
      readonly WorkflowSummary[]
    >;

  create(
    projectRoot: string,
    name: string,
  ):
    Promise<
      WorkflowCreateResult
    >;

  read(
    projectRoot: string,
    name: string,
  ):
    Promise<
      WorkflowReadResult
    >;

  save(
    projectRoot: string,
    name: string,
    workflow:
      WorkflowDocument,
    options?:
      WorkflowSaveOptions,
  ):
    Promise<
      WorkflowReadResult
    >;

  delete(
    projectRoot: string,
    name: string,
    options?:
      WorkflowDeleteOptions,
  ):
    Promise<
      WorkflowDeleteResult
    >;
}

export interface WorkflowTaskInput {
  projectRoot: string;

  name: string;
}

export type WorkflowTaskDefinition =
  TaskDefinition<
    WorkflowTaskInput
  >;
