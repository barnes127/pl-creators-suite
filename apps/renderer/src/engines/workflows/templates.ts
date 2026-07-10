import type {
  WorkflowAction,
  WorkflowGraph,
  WorkflowTrigger,
  WorkflowTriggerKind,
} from "./types";

export type WorkflowTemplateCategory =
  | "general"
  | "project"
  | "docs"
  | "code"
  | "sheets"
  | "movies"
  | "models"
  | "games"
  | "assets"
  | "export"
  | "quality";

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  category: WorkflowTemplateCategory;
  tags: string[];
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
};

export type CreateWorkflowFromTemplateInput = {
  template: WorkflowTemplate;
  name?: string;
  description?: string;
  enabled?: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createManualTrigger(id = "trigger-manual"): WorkflowTrigger {
  return {
    id,
    kind: "manual",
    enabled: true,
  };
}

function createTrigger(
  id: string,
  kind: WorkflowTriggerKind,
  appId?: string,
  eventName?: string
): WorkflowTrigger {
  return {
    id,
    kind,
    enabled: true,
    appId,
    eventName,
  };
}

function createLogAction(
  id: string,
  name: string,
  message: string,
  dependsOn?: string[]
): WorkflowAction {
  return {
    id,
    kind: "log",
    name,
    enabled: true,
    message,
    level: "info",
    dependsOn,
  };
}

function createNoopAction(
  id: string,
  name: string,
  dependsOn?: string[]
): WorkflowAction {
  return {
    id,
    kind: "noop",
    name,
    enabled: true,
    dependsOn,
  };
}

function createRpcAction(
  id: string,
  name: string,
  method: string,
  params: Record<string, unknown> = {},
  dependsOn?: string[]
): WorkflowAction {
  return {
    id,
    kind: "rpc",
    name,
    enabled: true,
    method,
    params,
    dependsOn,
  };
}

export const BUILT_IN_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "manual-project-check",
    name: "Manual Project Check",
    description:
      "Runs a safe manual project workflow with a log step and no-op checkpoint.",
    category: "project",
    tags: ["manual", "project", "starter"],
    triggers: [createManualTrigger()],
    actions: [
      createLogAction(
        "action-log-start",
        "Log project check start",
        "Manual project check started."
      ),
      createNoopAction("action-checkpoint", "Project checkpoint", [
        "action-log-start",
      ]),
    ],
  },
  {
    id: "on-save-quality-check",
    name: "On Save Quality Check",
    description:
      "Template for future save-triggered quality checks. Safe by default until hooked into real save events.",
    category: "quality",
    tags: ["onSave", "quality", "validation"],
    triggers: [createTrigger("trigger-on-save", "onSave")],
    actions: [
      createLogAction(
        "action-log-save",
        "Log save trigger",
        "Save-triggered quality check started."
      ),
      createNoopAction("action-quality-placeholder", "Quality check placeholder", [
        "action-log-save",
      ]),
    ],
  },
  {
    id: "on-export-package-check",
    name: "On Export Package Check",
    description:
      "Template for future export-triggered project/package checks before creating deliverables.",
    category: "export",
    tags: ["onExport", "export", "package"],
    triggers: [createTrigger("trigger-on-export", "onExport")],
    actions: [
      createLogAction(
        "action-log-export",
        "Log export trigger",
        "Export-triggered package check started."
      ),
      createNoopAction("action-package-placeholder", "Package check placeholder", [
        "action-log-export",
      ]),
    ],
  },
  {
    id: "docs-save-log",
    name: "Docs Save Log",
    description:
      "Template for a Docs-focused on-save workflow that can later connect to documentation checks.",
    category: "docs",
    tags: ["docs", "onSave", "documentation"],
    triggers: [createTrigger("trigger-docs-save", "onSave", "docs", "onSave")],
    actions: [
      createLogAction(
        "action-log-docs-save",
        "Log docs save",
        "Docs save workflow started."
      ),
      createNoopAction("action-docs-check-placeholder", "Docs check placeholder", [
        "action-log-docs-save",
      ]),
    ],
  },
  {
    id: "game-preview-preflight",
    name: "Game Preview Preflight",
    description:
      "Template for future Game Studio preflight checks before previewing or packaging.",
    category: "games",
    tags: ["games", "preflight", "preview"],
    triggers: [createManualTrigger("trigger-game-preflight-manual")],
    actions: [
      createLogAction(
        "action-log-game-preflight",
        "Log game preflight",
        "Game preflight workflow started."
      ),
      createNoopAction(
        "action-game-scene-check-placeholder",
        "Game scene check placeholder",
        ["action-log-game-preflight"]
      ),
    ],
  },
  {
    id: "asset-organization-pass",
    name: "Asset Organization Pass",
    description:
      "Template for future asset organization, tagging, and validation workflows.",
    category: "assets",
    tags: ["assets", "organization", "validation"],
    triggers: [createManualTrigger("trigger-asset-pass-manual")],
    actions: [
      createLogAction(
        "action-log-asset-pass",
        "Log asset pass",
        "Asset organization workflow started."
      ),
      createRpcAction(
        "action-assets-list-placeholder",
        "List assets placeholder",
        "assets.list",
        {},
        ["action-log-asset-pass"]
      ),
    ],
  },
];

export function createWorkflowFromTemplate(
  input: CreateWorkflowFromTemplateInput
): WorkflowGraph {
  const now = nowIso();
  const template = input.template;
  const workflowName = input.name?.trim() || template.name;

  return {
    id: `workflow-${template.id}-${Date.now()}`,
    name: workflowName,
    description: input.description ?? template.description,
    version: 1,
    enabled: input.enabled ?? true,
    triggers: cloneJson(template.triggers),
    actions: cloneJson(template.actions),
    createdAt: now,
    updatedAt: now,
  };
}

export function getWorkflowTemplateById(
  templateId: string,
  templates = BUILT_IN_WORKFLOW_TEMPLATES
): WorkflowTemplate | null {
  return templates.find((template) => template.id === templateId) ?? null;
}

export function listWorkflowTemplatesByCategory(
  category: WorkflowTemplateCategory,
  templates = BUILT_IN_WORKFLOW_TEMPLATES
): WorkflowTemplate[] {
  return templates.filter((template) => template.category === category);
}

export function searchWorkflowTemplates(
  query: string,
  templates = BUILT_IN_WORKFLOW_TEMPLATES
): WorkflowTemplate[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return templates;
  }

  return templates.filter((template) => {
    const haystack = [
      template.id,
      template.name,
      template.description,
      template.category,
      ...template.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
