const fs = require("fs/promises");
const path = require("path");
const { USER_DATA_DIR } = require("../../storage/paths");

const PLUGINS_DIR = path.join(USER_DATA_DIR, "plugins");
const PLUGIN_REGISTRY_PATH = path.join(PLUGINS_DIR, "registry.json");

const DEFAULT_REGISTRY = {
  version: 1,
  plugins: [],
};

async function ensurePluginStorage() {
  await fs.mkdir(PLUGINS_DIR, { recursive: true });
}

function normalizePlugin(plugin) {
  return {
    id: String(plugin?.id || "").trim(),
    name: String(plugin?.name || "").trim(),
    version: String(plugin?.version || "0.0.0").trim(),
    enabled: Boolean(plugin?.enabled),
    type: String(plugin?.type || "unknown").trim(),
    description: String(plugin?.description || "").trim(),
  };
}

function isValidPlugin(plugin) {
  return Boolean(plugin.id && plugin.name && plugin.version);
}

async function writePluginRegistry(registry) {
  await ensurePluginStorage();

  const safeRegistry = {
    version: 1,
    plugins: Array.isArray(registry?.plugins)
      ? registry.plugins.map(normalizePlugin).filter(isValidPlugin)
      : [],
  };

  const tmpPath = `${PLUGIN_REGISTRY_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(safeRegistry, null, 2), "utf8");
  await fs.rename(tmpPath, PLUGIN_REGISTRY_PATH);

  return safeRegistry;
}

async function readPluginRegistry() {
  await ensurePluginStorage();

  try {
    const raw = await fs.readFile(PLUGIN_REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw);

    const plugins = Array.isArray(parsed?.plugins)
      ? parsed.plugins.map(normalizePlugin).filter(isValidPlugin)
      : [];

    return {
      version: Number(parsed?.version || 1),
      plugins,
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("[plugins] Failed to read registry, using default:", error.message);
    }

    return writePluginRegistry(DEFAULT_REGISTRY);
  }
}

async function listPlugins() {
  const registry = await readPluginRegistry();
  return registry.plugins;
}

module.exports = {
  PLUGINS_DIR,
  PLUGIN_REGISTRY_PATH,
  readPluginRegistry,
  writePluginRegistry,
  listPlugins,
};
