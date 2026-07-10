const fs = require("fs/promises");
const path = require("path");

const WORKFLOW_EXTENSION = ".plworkflow.json";

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();

  if (!root) {
    throw new Error("projectRoot is required");
  }

  return root;
}

function getWorkflowsDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "workflows");
}

function safeWorkflowName(name) {
  const clean = String(name || "").trim();

  if (!clean) {
    throw new Error("Workflow name is required");
  }

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Workflow name must be a simple filename");
  }

  if (clean.endsWith(WORKFLOW_EXTENSION)) return clean;
  if (clean.endsWith(".json")) return clean;

  return `${clean}${WORKFLOW_EXTENSION}`;
}

function nowIso() {
  return new Date().toISOString();
}

function createDefaultWorkflow(name) {
  const now = nowIso();
  const displayName = name.replace(WORKFLOW_EXTENSION, "");

  return {
    id: `workflow-${displayName}`,
    name: displayName,
    description: "Project workflow.",
    version: 1,
    enabled: true,
    triggers: [
      {
        id: "trigger-manual",
        kind: "manual",
        enabled: true,
      },
    ],
    actions: [
      {
        id: "action-log-start",
        kind: "log",
        name: "Log workflow start",
        enabled: true,
        message: `Workflow "${displayName}" started.`,
        level: "info",
      },
      {
        id: "action-noop",
        kind: "noop",
        name: "No-op",
        enabled: true,
        dependsOn: ["action-log-start"],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeTrigger(trigger) {
  return {
    id: String(trigger?.id || `trigger-${Date.now()}`),
    kind: String(trigger?.kind || "manual"),
    enabled: Boolean(trigger?.enabled ?? true),
    appId:
      typeof trigger?.appId === "string" && trigger.appId.trim()
        ? trigger.appId
        : undefined,
    eventName:
      typeof trigger?.eventName === "string" && trigger.eventName.trim()
        ? trigger.eventName
        : undefined,
  };
}

function normalizeAction(action) {
  const kind = String(action?.kind || "noop");
  const base = {
    id: String(action?.id || `action-${Date.now()}`),
    kind,
    name: String(action?.name || "Workflow Action"),
    enabled: Boolean(action?.enabled ?? true),
    dependsOn: Array.isArray(action?.dependsOn)
      ? action.dependsOn.map((dependencyId) => String(dependencyId))
      : undefined,
  };

  if (kind === "rpc") {
    return {
      ...base,
      method: String(action?.method || ""),
      params:
        action?.params && typeof action.params === "object"
          ? action.params
          : {},
    };
  }

  if (kind === "log") {
    return {
      ...base,
      message: String(action?.message || ""),
      level: String(action?.level || "info"),
    };
  }

  if (kind === "condition") {
    return {
      ...base,
      expression: String(action?.expression || ""),
      trueActionIds: Array.isArray(action?.trueActionIds)
        ? action.trueActionIds.map((actionId) => String(actionId))
        : [],
      falseActionIds: Array.isArray(action?.falseActionIds)
        ? action.falseActionIds.map((actionId) => String(actionId))
        : [],
    };
  }

  if (kind === "delay") {
    return {
      ...base,
      durationMs: Number(action?.durationMs || 0),
    };
  }

  return {
    ...base,
    kind: "noop",
  };
}

function normalizeWorkflow(workflow, fallbackName) {
  const now = nowIso();
  const name = String(workflow?.name || fallbackName || "Untitled Workflow");

  return {
    id: String(workflow?.id || `workflow-${name}`),
    name,
    description: String(workflow?.description || ""),
    version: Number(workflow?.version || 1),
    enabled: Boolean(workflow?.enabled ?? true),
    triggers: Array.isArray(workflow?.triggers)
      ? workflow.triggers.map(normalizeTrigger)
      : [],
    actions: Array.isArray(workflow?.actions)
      ? workflow.actions.map(normalizeAction)
      : [],
    createdAt: String(workflow?.createdAt || now),
    updatedAt: String(workflow?.updatedAt || now),
  };
}

async function ensureWorkflowsStorage(projectRoot) {
  const workflowsDir = getWorkflowsDir(projectRoot);
  await fs.mkdir(workflowsDir, { recursive: true });

  return { workflowsDir };
}

async function listWorkflows(params) {
  const workflowsDir = getWorkflowsDir(params?.projectRoot);
  await ensureWorkflowsStorage(params?.projectRoot);

  const entries = await fs.readdir(workflowsDir, { withFileTypes: true });

  const workflows = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(workflowsDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { workflows };
}

async function createWorkflow(params) {
  const workflowsDir = getWorkflowsDir(params?.projectRoot);
  await ensureWorkflowsStorage(params?.projectRoot);

  const name = safeWorkflowName(params?.name || "untitled-workflow");
  const workflowPath = path.join(workflowsDir, name);
  const workflow = createDefaultWorkflow(name);

  try {
    await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Workflow already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: workflowPath,
    workflow,
  };
}

async function readWorkflow(params) {
  const workflowsDir = getWorkflowsDir(params?.projectRoot);
  const name = safeWorkflowName(params?.name);
  const workflowPath = path.join(workflowsDir, name);

  const raw = await fs.readFile(workflowPath, "utf8");
  const parsed = JSON.parse(raw);
  const workflow = normalizeWorkflow(parsed, name.replace(WORKFLOW_EXTENSION, ""));

  return {
    name,
    path: workflowPath,
    workflow,
  };
}

async function saveWorkflow(params) {
  const workflowsDir = getWorkflowsDir(params?.projectRoot);
  await ensureWorkflowsStorage(params?.projectRoot);

  const name = safeWorkflowName(params?.name);
  const workflowPath = path.join(workflowsDir, name);

  const workflow = normalizeWorkflow(
    {
      ...params?.workflow,
      updatedAt: nowIso(),
    },
    name.replace(WORKFLOW_EXTENSION, "")
  );

  const tmpPath = `${workflowPath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(workflow, null, 2), "utf8");
  await fs.rename(tmpPath, workflowPath);

  return {
    name,
    path: workflowPath,
    workflow,
  };
}

async function deleteWorkflow(params) {
  const workflowsDir = getWorkflowsDir(params?.projectRoot);
  const name = safeWorkflowName(params?.name);
  const workflowPath = path.join(workflowsDir, name);

  await fs.unlink(workflowPath);

  return {
    name,
    path: workflowPath,
    deleted: true,
  };
}

module.exports = {
  WORKFLOW_EXTENSION,
  getWorkflowsDir,
  ensureWorkflowsStorage,
  listWorkflows,
  createWorkflow,
  readWorkflow,
  saveWorkflow,
  deleteWorkflow,
};
