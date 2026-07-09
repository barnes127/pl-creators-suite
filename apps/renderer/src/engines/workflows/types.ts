export type WorkflowTriggerKind = "manual" | "onSave" | "onExport";

export type WorkflowActionKind =
  | "rpc"
  | "log"
  | "condition"
  | "delay"
  | "noop";

export type WorkflowRunStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "canceled";

export type WorkflowStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type WorkflowTrigger = {
  id: string;
  kind: WorkflowTriggerKind;
  enabled: boolean;
  appId?: string;
  eventName?: string;
};

export type WorkflowActionBase = {
  id: string;
  kind: WorkflowActionKind;
  name: string;
  enabled: boolean;
  dependsOn?: string[];
};

export type WorkflowRpcAction = WorkflowActionBase & {
  kind: "rpc";
  method: string;
  params?: Record<string, unknown>;
};

export type WorkflowLogAction = WorkflowActionBase & {
  kind: "log";
  message: string;
  level: "debug" | "info" | "warn" | "error";
};

export type WorkflowConditionAction = WorkflowActionBase & {
  kind: "condition";
  expression: string;
  trueActionIds?: string[];
  falseActionIds?: string[];
};

export type WorkflowDelayAction = WorkflowActionBase & {
  kind: "delay";
  durationMs: number;
};

export type WorkflowNoopAction = WorkflowActionBase & {
  kind: "noop";
};

export type WorkflowAction =
  | WorkflowRpcAction
  | WorkflowLogAction
  | WorkflowConditionAction
  | WorkflowDelayAction
  | WorkflowNoopAction;

export type WorkflowGraph = {
  id: string;
  name: string;
  description: string;
  version: number;
  enabled: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowExecutionContext = {
  projectRoot?: string;
  appId?: string;
  sourceEvent?: string;
  variables: Record<string, unknown>;
};

export type WorkflowStepResult = {
  actionId: string;
  actionName: string;
  status: WorkflowStepStatus;
  startedAt: string;
  finishedAt?: string;
  message: string;
  output?: unknown;
  error?: string;
};

export type WorkflowRunResult = {
  workflowId: string;
  workflowName: string;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt?: string;
  steps: WorkflowStepResult[];
  message: string;
};

export type WorkflowValidationIssue = {
  severity: "info" | "warning" | "error";
  message: string;
  actionId?: string;
  triggerId?: string;
};

export type WorkflowValidationResult = {
  ok: boolean;
  issues: WorkflowValidationIssue[];
};
