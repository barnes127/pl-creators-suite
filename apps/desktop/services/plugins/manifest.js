const SUPPORTED_PLUGIN_API_VERSION = "0.1";

const VALID_PLUGIN_TYPES = new Set([
  "tool",
  "app",
  "theme",
  "workflow",
  "engine",
]);

function cleanString(value) {
  return String(value || "").trim();
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanString).filter(Boolean);
}

function normalizeManifest(manifest) {
  return {
    id: cleanString(manifest?.id),
    name: cleanString(manifest?.name),
    version: cleanString(manifest?.version || "0.0.0"),
    apiVersion: cleanString(manifest?.apiVersion || SUPPORTED_PLUGIN_API_VERSION),
    type: cleanString(manifest?.type || "tool"),
    entry: cleanString(manifest?.entry || "index.js"),
    description: cleanString(manifest?.description),
    permissions: cleanStringArray(manifest?.permissions),
    contributes:
      manifest?.contributes && typeof manifest.contributes === "object" && !Array.isArray(manifest.contributes)
        ? manifest.contributes
        : {},
  };
}

function validateManifest(manifest) {
  const normalized = normalizeManifest(manifest);
  const errors = [];

  if (!normalized.id) errors.push("Plugin id is required");
  if (!normalized.name) errors.push("Plugin name is required");
  if (!normalized.version) errors.push("Plugin version is required");
  if (!normalized.apiVersion) errors.push("Plugin apiVersion is required");
  if (!normalized.entry) errors.push("Plugin entry is required");

  if (normalized.id && !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(normalized.id)) {
    errors.push("Plugin id must use lowercase letters, numbers, dots, or hyphens");
  }

  if (!VALID_PLUGIN_TYPES.has(normalized.type)) {
    errors.push(`Plugin type must be one of: ${Array.from(VALID_PLUGIN_TYPES).join(", ")}`);
  }

  if (normalized.apiVersion !== SUPPORTED_PLUGIN_API_VERSION) {
    errors.push(`Unsupported plugin apiVersion: ${normalized.apiVersion}`);
  }

  if (normalized.entry.includes("..") || normalized.entry.startsWith("/") || normalized.entry.startsWith("\\")) {
    errors.push("Plugin entry must be a relative path inside the plugin folder");
  }

  return {
    ok: errors.length === 0,
    manifest: normalized,
    errors,
  };
}

module.exports = {
  SUPPORTED_PLUGIN_API_VERSION,
  VALID_PLUGIN_TYPES,
  normalizeManifest,
  validateManifest,
};
