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

module.exports = {
  ASSET_FOLDERS,
  getAssetsDir,
  getAssetRegistryPath,
  ensureAssetStorage,
  readAssetRegistry,
  writeAssetRegistry,
  listAssets,
};
