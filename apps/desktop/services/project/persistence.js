const fs = require("fs/promises");

const {
  fileExists,
  writeJsonFileAtomic,
} = require("../../util/fs");

const {
  ProjectFormatError,
  validateProjectManifest,
} = require("./contract");

const {
  migrateProjectManifest,
} = require("./migrations");

async function readProjectManifest(manifestPath) {
  let raw;

  try {
    raw = await fs.readFile(manifestPath, "utf8");
  } catch (error) {
    throw new ProjectFormatError(
      `Unable to read project manifest: ${error.message}`,
      "MANIFEST_READ_FAILED",
    );
  }

  let sourceManifest;

  try {
    sourceManifest = JSON.parse(raw);
  } catch {
    throw new ProjectFormatError(
      "Project manifest contains invalid JSON",
      "CORRUPT_MANIFEST",
    );
  }

  const sourceVersion = sourceManifest.schemaVersion;
  const manifest = migrateProjectManifest(sourceManifest);

  return {
    manifest,
    sourceVersion,
    migrated: sourceVersion !== manifest.schemaVersion,
  };
}

async function backupProjectManifest(manifestPath) {
  if (!(await fileExists(manifestPath))) {
    return null;
  }

  const backupPath = `${manifestPath}.bak`;

  await fs.copyFile(manifestPath, backupPath);

  return backupPath;
}

async function writeProjectManifest(
  manifestPath,
  manifest,
  { backupExisting = false } = {},
) {
  const validated = validateProjectManifest(manifest);

  let backupPath = null;

  if (backupExisting) {
    backupPath = await backupProjectManifest(manifestPath);
  }

  await writeJsonFileAtomic(manifestPath, validated);

  return {
    manifest: validated,
    backupPath,
  };
}

module.exports = {
  readProjectManifest,
  backupProjectManifest,
  writeProjectManifest,
};
