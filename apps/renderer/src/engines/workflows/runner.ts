import type {
  WorkflowAction,
  WorkflowExecutionContext,
  WorkflowGraph,
  WorkflowRunResult,
  WorkflowRunStatus,
  WorkflowStepResult,
  WorkflowStepStatus,
} from "./types";
import { validateWorkflowGraph } from "./validation";

export type WorkflowRpcExecutor = (
  method: string,
  params?: Record<string, unknown>,
  context?: WorkflowExecutionContext
) => Promise<unknown>;

export type RunWorkflowGraphOptions = {
  context?: WorkflowExecutionContext;
  rpcExecutor?: WorkflowRpcExecutor;
  stopOnFailure?: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function createStepResult(
  action: WorkflowAction,
  status: WorkflowStepStatus,
  message: string,
  output?: unknown,
  error?: string
): WorkflowStepResult {
  const timestamp = nowIso();

  return {
    actionId: action.id,
    actionName: action.name,
    status,
    startedAt: timestamp,
    finishedAt: timestamp,
    message,
    output,
    error,
  };
}

function createSkippedStep(
  action: WorkflowAction,
  message: string
): WorkflowStepResult {
  return createStepResult(action, "skipped", message);
}

function getRunnableActions(graph: WorkflowGraph): WorkflowAction[] {
  return graph.actions.filter((action) => action.enabled);
}

function dependenciesCompleted(
  action: WorkflowAction,
  completedActionIds: Set<string>
): boolean {
  return (action.dependsOn ?? []).every((dependencyId) =>
    completedActionIds.has(dependencyId)
  );
}

function orderActionsByDependencies(actions: WorkflowAction[]): WorkflowAction[] {
  const pending = [...actions];
  const completed = new Set<string>();
  const ordered: WorkflowAction[] = [];

  while (pending.length > 0) {
    const nextIndex = pending.findIndex((action) =>
      dependenciesCompleted(action, completed)
    );

    if (nextIndex === -1) {
      return [...ordered, ...pending];
    }

    const [nextAction] = pending.splice(nextIndex, 1);
    ordered.push(nextAction);
    completed.add(nextAction.id);
  }

  return ordered;
}

function evaluateConditionExpression(
  expression: string,
  context: WorkflowExecutionContext
): boolean {
  const key = expression.trim();

  if (!key) return false;

  return Boolean(context.variables[key]);
}

async function runWorkflowAction(
  action: WorkflowAction,
  options: RunWorkflowGraphOptions
): Promise<WorkflowStepResult> {
  const startedAt = nowIso();

  try {
    if (!action.enabled) {
      return {
        actionId: action.id,
        actionName: action.name,
        status: "skipped",
        startedAt,
        finishedAt: nowIso(),
        message: "Action is disabled.",
      };
    }

    if (action.kind === "noop") {
      return {
        actionId: action.id,
        actionName: action.name,
        status: "completed",
        startedAt,
        finishedAt: nowIso(),
        message: "No-op action completed.",
      };
    }

    if (action.kind === "log") {
      return {
        actionId: action.id,
        actionName: action.name,
        status: "completed",
        startedAt,
        finishedAt: nowIso(),
        message: action.message,
        output: {
          level: action.level,
          message: action.message,
        },
      };
    }

    if (action.kind === "delay") {
      await delay(Math.max(0, action.durationMs));

      return {
        actionId: action.id,
        actionName: action.name,
        status: "completed",
        startedAt,
        finishedAt: nowIso(),
        message: `Delayed for ${Math.max(0, action.durationMs)}ms.`,
      };
    }

    if (action.kind === "condition") {
      const context = options.context ?? {
        variables: {},
      };

      const result = evaluateConditionExpression(action.expression, context);

      return {
        actionId: action.id,
        actionName: action.name,
        status: "completed",
        startedAt,
        finishedAt: nowIso(),
        message: `Condition "${action.expression}" evaluated to ${String(result)}.`,
        output: {
          result,
          trueActionIds: action.trueActionIds ?? [],
          falseActionIds: action.falseActionIds ?? [],
        },
      };
    }

    if (action.kind === "rpc") {
      if (!options.rpcExecutor) {
        return {
          actionId: action.id,
          actionName: action.name,
          status: "skipped",
          startedAt,
          finishedAt: nowIso(),
          message:
            "RPC action skipped because no workflow RPC executor is configured yet.",
          output: {
            method: action.method,
            params: action.params ?? {},
          },
        };
      }

      const output = await options.rpcExecutor(
        action.method,
        action.params,
        options.context
      );

      return {
        actionId: action.id,
        actionName: action.name,
        status: "completed",
        startedAt,
        finishedAt: nowIso(),
        message: `RPC action "${action.method}" completed.`,
        output,
      };
    }

    const unknownAction = action as WorkflowAction;

    return {
      actionId: unknownAction.id,
      actionName: unknownAction.name,
      status: "failed",
      startedAt,
      finishedAt: nowIso(),
      message: "Unknown workflow action kind.",
      error: `Unsupported action kind: ${(action as WorkflowAction).kind}`,
    };
  } catch (error: any) {
    return {
      actionId: action.id,
      actionName: action.name,
      status: "failed",
      startedAt,
      finishedAt: nowIso(),
      message: "Workflow action failed.",
      error: error?.message || String(error),
    };
  }
}

function getRunStatusFromSteps(
  steps: WorkflowStepResult[],
  fallback: WorkflowRunStatus
): WorkflowRunStatus {
  if (steps.some((step) => step.status === "failed")) {
    return "failed";
  }

  if (steps.length === 0) {
    return fallback;
  }

  return "completed";
}

export function createWorkflowRunResult(
  graph: WorkflowGraph,
  status: WorkflowRunStatus,
  message: string,
  steps: WorkflowStepResult[] = []
): WorkflowRunResult {
  const startedAt = nowIso();

  return {
    workflowId: graph.id,
    workflowName: graph.name,
    status,
    startedAt,
    finishedAt: status === "running" ? undefined : startedAt,
    steps,
    message,
  };
}

export async function runWorkflowGraph(
  graph: WorkflowGraph,
  options: RunWorkflowGraphOptions = {}
): Promise<WorkflowRunResult> {
  const startedAt = nowIso();
  const validation = validateWorkflowGraph(graph);

  if (!validation.ok) {
    return {
      workflowId: graph.id,
      workflowName: graph.name,
      status: "failed",
      startedAt,
      finishedAt: nowIso(),
      steps: [],
      message: `Workflow validation failed: ${validation.issues
        .filter((issue) => issue.severity === "error")
        .map((issue) => issue.message)
        .join(" ")}`,
    };
  }

  if (!graph.enabled) {
    return {
      workflowId: graph.id,
      workflowName: graph.name,
      status: "canceled",
      startedAt,
      finishedAt: nowIso(),
      steps: [],
      message: "Workflow is disabled.",
    };
  }

  const steps: WorkflowStepResult[] = [];
  const runnableActions = orderActionsByDependencies(getRunnableActions(graph));

  for (const action of graph.actions.filter((current) => !current.enabled)) {
    steps.push(createSkippedStep(action, "Action is disabled."));
  }

  for (const action of runnableActions) {
    const missingFailedDependency = (action.dependsOn ?? []).some(
      (dependencyId) =>
        steps.some(
          (step) => step.actionId === dependencyId && step.status === "failed"
        )
    );

    if (missingFailedDependency) {
      steps.push(
        createSkippedStep(
          action,
          "Action skipped because a dependency failed."
        )
      );
      continue;
    }

    const result = await runWorkflowAction(action, options);
    steps.push(result);

    if (result.status === "failed" && options.stopOnFailure !== false) {
      break;
    }
  }

  const status = getRunStatusFromSteps(steps, "completed");

  return {
    workflowId: graph.id,
    workflowName: graph.name,
    status,
    startedAt,
    finishedAt: nowIso(),
    steps,
    message:
      status === "completed"
        ? "Workflow completed."
        : "Workflow finished with errors.",
  };
}
