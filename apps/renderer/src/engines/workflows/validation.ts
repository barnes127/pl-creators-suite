import type {
  WorkflowAction,
  WorkflowGraph,
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from "./types";

function createIssue(
  severity: WorkflowValidationIssue["severity"],
  message: string,
  actionId?: string,
  triggerId?: string
): WorkflowValidationIssue {
  return {
    severity,
    message,
    actionId,
    triggerId,
  };
}

function hasDuplicateIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size !== items.length;
}

function findDuplicateIds(items: Array<{ id: string }>): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }

    seen.add(item.id);
  }

  return [...duplicates];
}

function validateActionDependencies(
  actions: WorkflowAction[],
  issues: WorkflowValidationIssue[]
) {
  const actionIds = new Set(actions.map((action) => action.id));

  for (const action of actions) {
    for (const dependencyId of action.dependsOn ?? []) {
      if (!actionIds.has(dependencyId)) {
        issues.push(
          createIssue(
            "error",
            `Action "${action.name}" depends on missing action "${dependencyId}".`,
            action.id
          )
        );
      }

      if (dependencyId === action.id) {
        issues.push(
          createIssue(
            "error",
            `Action "${action.name}" cannot depend on itself.`,
            action.id
          )
        );
      }
    }
  }
}

function validateActionShape(
  action: WorkflowAction,
  issues: WorkflowValidationIssue[]
) {
  if (!action.id.trim()) {
    issues.push(createIssue("error", "Action id is required.", action.id));
  }

  if (!action.name.trim()) {
    issues.push(createIssue("error", "Action name is required.", action.id));
  }

  if (action.kind === "rpc" && !action.method.trim()) {
    issues.push(
      createIssue("error", "RPC action method is required.", action.id)
    );
  }

  if (action.kind === "delay" && action.durationMs < 0) {
    issues.push(
      createIssue("error", "Delay action duration must be 0 or greater.", action.id)
    );
  }

  if (action.kind === "condition" && !action.expression.trim()) {
    issues.push(
      createIssue("error", "Condition action expression is required.", action.id)
    );
  }

  if (action.kind === "log" && !action.message.trim()) {
    issues.push(
      createIssue("warning", "Log action message is empty.", action.id)
    );
  }
}

export function validateWorkflowGraph(
  graph: WorkflowGraph
): WorkflowValidationResult {
  const issues: WorkflowValidationIssue[] = [];

  if (!graph.id.trim()) {
    issues.push(createIssue("error", "Workflow id is required."));
  }

  if (!graph.name.trim()) {
    issues.push(createIssue("error", "Workflow name is required."));
  }

  if (graph.version < 1) {
    issues.push(createIssue("error", "Workflow version must be 1 or greater."));
  }

  if (graph.triggers.length === 0) {
    issues.push(createIssue("warning", "Workflow has no triggers."));
  }

  if (graph.actions.length === 0) {
    issues.push(createIssue("warning", "Workflow has no actions."));
  }

  if (hasDuplicateIds(graph.triggers)) {
    for (const duplicateId of findDuplicateIds(graph.triggers)) {
      issues.push(
        createIssue(
          "error",
          `Duplicate trigger id "${duplicateId}" found.`,
          undefined,
          duplicateId
        )
      );
    }
  }

  if (hasDuplicateIds(graph.actions)) {
    for (const duplicateId of findDuplicateIds(graph.actions)) {
      issues.push(
        createIssue("error", `Duplicate action id "${duplicateId}" found.`, duplicateId)
      );
    }
  }

  for (const trigger of graph.triggers) {
    if (!trigger.id.trim()) {
      issues.push(createIssue("error", "Trigger id is required.", undefined, trigger.id));
    }
  }

  for (const action of graph.actions) {
    validateActionShape(action, issues);
  }

  validateActionDependencies(graph.actions, issues);

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}
