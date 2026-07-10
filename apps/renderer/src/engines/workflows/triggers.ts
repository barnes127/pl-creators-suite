import type {
  WorkflowGraph,
  WorkflowTrigger,
  WorkflowTriggerKind,
} from "./types";

export type WorkflowTriggerEvent = {
  kind: WorkflowTriggerKind;
  appId?: string;
  eventName?: string;
  projectRoot?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type WorkflowTriggerMatch = {
  workflow: WorkflowGraph;
  trigger: WorkflowTrigger;
  event: WorkflowTriggerEvent;
};

export function createWorkflowTriggerEvent(
  kind: WorkflowTriggerKind,
  options: Omit<WorkflowTriggerEvent, "kind"> = {}
): WorkflowTriggerEvent {
  return {
    kind,
    appId: options.appId,
    eventName: options.eventName,
    projectRoot: options.projectRoot,
    source: options.source,
    metadata: options.metadata ?? {},
  };
}

export function workflowTriggerMatchesEvent(
  trigger: WorkflowTrigger,
  event: WorkflowTriggerEvent
): boolean {
  if (!trigger.enabled) return false;
  if (trigger.kind !== event.kind) return false;

  if (trigger.appId && trigger.appId !== event.appId) {
    return false;
  }

  if (trigger.eventName && trigger.eventName !== event.eventName) {
    return false;
  }

  return true;
}

export function workflowHasTrigger(
  workflow: WorkflowGraph,
  event: WorkflowTriggerEvent
): boolean {
  if (!workflow.enabled) return false;

  return workflow.triggers.some((trigger) =>
    workflowTriggerMatchesEvent(trigger, event)
  );
}

export function findWorkflowTriggerMatches(
  workflows: WorkflowGraph[],
  event: WorkflowTriggerEvent
): WorkflowTriggerMatch[] {
  const matches: WorkflowTriggerMatch[] = [];

  for (const workflow of workflows) {
    if (!workflow.enabled) continue;

    for (const trigger of workflow.triggers) {
      if (workflowTriggerMatchesEvent(trigger, event)) {
        matches.push({
          workflow,
          trigger,
          event,
        });
      }
    }
  }

  return matches;
}

export function findWorkflowsForTrigger(
  workflows: WorkflowGraph[],
  event: WorkflowTriggerEvent
): WorkflowGraph[] {
  const matchedIds = new Set<string>();

  return findWorkflowTriggerMatches(workflows, event)
    .map((match) => match.workflow)
    .filter((workflow) => {
      if (matchedIds.has(workflow.id)) return false;

      matchedIds.add(workflow.id);
      return true;
    });
}

export function describeWorkflowTrigger(trigger: WorkflowTrigger): string {
  const parts: string[] = [trigger.kind];

  if (trigger.appId) {
    parts.push(`app:${trigger.appId}`);
  }

  if (trigger.eventName) {
    parts.push(`event:${trigger.eventName}`);
  }

  return parts.join(" · ");
}
