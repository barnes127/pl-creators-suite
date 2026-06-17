const fs = require("fs/promises");
const path = require("path");

const ASSET_FOLDERS = ["images", "audio", "video", "models", "docs", "other"];

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getAssetsDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "assets");
}

function getAssetRegistryPath(projectRoot) {
  return path.join(getAssetsDir(projectRoot), "asset-registry.json");
}

function createDefaultRegistry() {
  return {
    version: 1,
    assets: [],
  };
}

async function ensureAssetStorage(projectRoot) {
  const assetsDir = getAssetsDir(projectRoot);

  await fs.mkdir(assetsDir, { recursive: true });

  for (const folder of ASSET_FOLDERS) {
    await fs.mkdir(path.join(assetsDir, folder), { recursive: true });
  }

  const registryPath = getAssetRegistryPath(projectRoot);

  try {
    await fs.access(registryPath);
  } catch {
    await writeAssetRegistry(projectRoot, createDefaultRegistry());
  }

  return {
    assetsDir,
    registryPath,
    folders: ASSET_FOLDERS.map((folder) => path.join(assetsDir, folder)),
  };
}

function createAssetId(name) {
  const base = String(name || "asset")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${base || "asset"}-${Date.now()}`;
}

function safeFileName(filePath) {
  const fileName = path.basename(String(filePath || "").trim());

  if (!fileName) throw new Error("Source file path is required");
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    throw new Error("Invalid source file name");
  }

  return fileName;
}

function normalizeAsset(asset) {
  return {
    id: String(asset?.id || "").trim(),
    name: String(asset?.name || "").trim(),
    type: String(asset?.type || "other").trim(),
    relativePath: String(asset?.relativePath || "").trim(),
    sourcePath: String(asset?.sourcePath || "").trim(),
    createdAt: String(asset?.createdAt || new Date().toISOString()),
    updatedAt: String(asset?.updatedAt || new Date().toISOString()),
  };
}

function isValidAsset(asset) {
  return Boolean(asset.id && asset.name && asset.relativePath);
}

async function readAssetRegistry(projectRoot) {
  await ensureAssetStorage(projectRoot);

  const registryPath = getAssetRegistryPath(projectRoot);

  try {
    const raw = await fs.readFile(registryPath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      version: Number(parsed?.version || 1),
      assets: Array.isArray(parsed?.assets)
        ? parsed.assets.map(normalizeAsset).filter(isValidAsset)
        : [],
    };
  } catch {
    const registry = createDefaultRegistry();
    await writeAssetRegistry(projectRoot, registry);
    return registry;
  }
}

async function writeAssetRegistry(projectRoot, registry) {
  const assetsDir = getAssetsDir(projectRoot);
  await fs.mkdir(assetsDir, { recursive: true });

  const safeRegistry = {
    version: 1,
    assets: Array.isArray(registry?.assets)
      ? registry.assets.map(normalizeAsset).filter(isValidAsset)
      : [],
  };

  const registryPath = getAssetRegistryPath(projectRoot);
  const tmpPath = `${registryPath}.tmp`;

  await fs.writeFile(tmpPath, JSON.stringify(safeRegistry, null, 2), "utf8");
  await fs.rename(tmpPath, registryPath);

  return safeRegistry;
}

async function listAssets(params) {
  const projectRoot = cleanProjectRoot(params?.projectRoot);
  const registry = await readAssetRegistry(projectRoot);

  return {
    assets: registry.assets,
  };
}

async function registerAsset(params) {
  const projectRoot = cleanProjectRoot(params?.projectRoot);
  const name = String(params?.name || "").trim();
  const type = String(params?.type || "other").trim();
  const relativePath = String(params?.relativePath || "").trim();
  const sourcePath = String(params?.sourcePath || "").trim();

  if (!name) throw new Error("Asset name is required");
  if (!relativePath) throw new Error("Asset relativePath is required");

  if (relativePath.includes("..") || relativePath.startsWith("/") || relativePath.startsWith("\\")) {
    throw new Error("Asset relativePath must stay inside the project");
  }

  const registry = await readAssetRegistry(projectRoot);
  const now = new Date().toISOString();

  const asset = normalizeAsset({
    id: createAssetId(name),
    name,
    type: ASSET_FOLDERS.includes(type) ? type : "other",
    relativePath,
    sourcePath,
    createdAt: now,
    updatedAt: now,
  });

  const saved = await writeAssetRegistry(projectRoot, {
    version: 1,
    assets: [...registry.assets, asset],
  });

  return {
    asset,
    assets: saved.assets,
  };
}

async function importAsset(params) {
  const projectRoot = cleanProjectRoot(params?.projectRoot);
  const sourcePath = String(params?.sourcePath || "").trim();
  const name = String(params?.name || "").trim();
  const type = String(params?.type || "other").trim();

  if (!sourcePath) throw new Error("sourcePath is required");

  const assetType = ASSET_FOLDERS.includes(type) ? type : "other";
  const assetsDir = getAssetsDir(projectRoot);
  const targetFolder = path.join(assetsDir, assetType);

  await ensureAssetStorage(projectRoot);

  const fileName = safeFileName(sourcePath);
  const targetPath = path.join(targetFolder, fileName);
  const relativePath = path.join("assets", assetType, fileName);

  await fs.copyFile(sourcePath, targetPath);

  return registerAsset({
    projectRoot,
    name: name || fileName,
    type: assetType,
    relativePath,
    sourcePath,
  });
}

module.exports = {
  ASSET_FOLDERS,
  getAssetsDir,
  getAssetRegistryPath,
  ensureAssetStorage,
  readAssetRegistry,
  writeAssetRegistry,
  listAssets,
  registerAsset,
  importAsset,
};
