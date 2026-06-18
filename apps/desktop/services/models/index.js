const fs = require("fs/promises");
const path = require("path");

const MODEL_EXTENSION = ".plmodel.json";

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getModelsDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "models");
}

function safeModelName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Model scene name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Model scene name must be a simple filename");
  }

  if (clean.endsWith(MODEL_EXTENSION)) return clean;
  if (clean.endsWith(".json")) return clean;

  return `${clean}${MODEL_EXTENSION}`;
}

function createDefaultModel(name) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name,
    title: name.replace(MODEL_EXTENSION, ""),
    units: "meters",
    gridEnabled: true,
    objects: [],
    notes: "Start planning your 3D model scene here.",
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeVector3(value, fallback) {
  if (!Array.isArray(value)) return fallback;

  return [
    Number(value[0] ?? fallback[0]),
    Number(value[1] ?? fallback[1]),
    Number(value[2] ?? fallback[2]),
  ];
}

function normalizeModelObject(object) {
  return {
    id: String(object?.id || `object-${Date.now()}`),
    name: String(object?.name || "Object"),
    primitive: String(object?.primitive || "cube"),
    position: normalizeVector3(object?.position, [0, 0, 0]),
    rotation: normalizeVector3(object?.rotation, [0, 0, 0]),
    scale: normalizeVector3(object?.scale, [1, 1, 1]),
  };
}

function normalizeModel(model, fallbackName) {
  const now = new Date().toISOString();

  return {
    version: 1,
    name: String(model?.name || fallbackName || "untitled.plmodel.json"),
    title: String(model?.title || fallbackName || "Untitled Model"),
    units: String(model?.units || "meters"),
    gridEnabled: Boolean(model?.gridEnabled ?? true),
    objects: Array.isArray(model?.objects)
      ? model.objects.map(normalizeModelObject)
      : [],
    notes: String(model?.notes || ""),
    createdAt: String(model?.createdAt || now),
    updatedAt: String(model?.updatedAt || now),
  };
}

async function ensureModelsStorage(projectRoot) {
  const modelsDir = getModelsDir(projectRoot);
  await fs.mkdir(modelsDir, { recursive: true });

  return { modelsDir };
}

async function listModels(params) {
  const modelsDir = getModelsDir(params?.projectRoot);
  await ensureModelsStorage(params?.projectRoot);

  const entries = await fs.readdir(modelsDir, { withFileTypes: true });

  const models = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(modelsDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { models };
}

async function createModel(params) {
  const modelsDir = getModelsDir(params?.projectRoot);
  await ensureModelsStorage(params?.projectRoot);

  const name = safeModelName(params?.name || "untitled");
  const modelPath = path.join(modelsDir, name);
  const model = createDefaultModel(name);

  try {
    await fs.writeFile(modelPath, JSON.stringify(model, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Model scene already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: modelPath,
    model,
  };
}

async function readModel(params) {
  const modelsDir = getModelsDir(params?.projectRoot);
  const name = safeModelName(params?.name);
  const modelPath = path.join(modelsDir, name);

  const raw = await fs.readFile(modelPath, "utf8");
  const parsed = JSON.parse(raw);
  const model = normalizeModel(parsed, name);

  return {
    name,
    path: modelPath,
    model,
  };
}

async function saveModel(params) {
  const modelsDir = getModelsDir(params?.projectRoot);
  await ensureModelsStorage(params?.projectRoot);

  const name = safeModelName(params?.name);
  const modelPath = path.join(modelsDir, name);

  const model = normalizeModel(
    {
      ...params?.model,
      name,
      updatedAt: new Date().toISOString(),
    },
    name
  );

  const tmpPath = `${modelPath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(model, null, 2), "utf8");
  await fs.rename(tmpPath, modelPath);

  return {
    name,
    path: modelPath,
    model,
  };
}

module.exports = {
  getModelsDir,
  ensureModelsStorage,
  listModels,
  createModel,
  readModel,
  saveModel,
};
