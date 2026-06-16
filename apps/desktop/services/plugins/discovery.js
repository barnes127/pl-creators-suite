const fs = require("fs/promises");
const path = require("path");
const { validateManifest } = require("./manifest");
const { writePluginRegistry } = require("./registry");

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function pluginFromManifest(manifest, pluginPath) {
  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    enabled: false,
    type: manifest.type,
    description: manifest.description,
    apiVersion: manifest.apiVersion,
    entry: manifest.entry,
    pluginPath,
  };
}

async function discoverPluginsFromFolder(folderPath) {
  const discovered = [];
  const errors = [];

  if (!(await pathExists(folderPath))) {
    return { plugins: discovered, errors };
  }

  const entries = await fs.readdir(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginPath = path.join(folderPath, entry.name);
    const manifestPath = path.join(pluginPath, "pl-plugin.json");

    if (!(await pathExists(manifestPath))) continue;

    try {
      const raw = await fs.readFile(manifestPath, "utf8");
      const parsed = JSON.parse(raw);
      const result = validateManifest(parsed);

      if (!result.ok) {
        errors.push({
          pluginPath,
          manifestPath,
          errors: result.errors,
        });
        continue;
      }

      discovered.push(pluginFromManifest(result.manifest, pluginPath));
    } catch (error) {
      errors.push({
        pluginPath,
        manifestPath,
        errors: [error.message || String(error)],
      });
    }
  }

  return { plugins: discovered, errors };
}

async function discoverExamplePlugins(repoRoot) {
  const examplesFolder = path.join(repoRoot, "examples", "plugins");
  return discoverPluginsFromFolder(examplesFolder);
}

async function refreshDiscoveredPlugins(repoRoot) {
  const result = await discoverExamplePlugins(repoRoot);

  const registry = await writePluginRegistry({
    version: 1,
    plugins: result.plugins,
  });

  return {
    plugins: registry.plugins,
    errors: result.errors,
  };
}

module.exports = {
  discoverPluginsFromFolder,
  discoverExamplePlugins,
  refreshDiscoveredPlugins,
};
