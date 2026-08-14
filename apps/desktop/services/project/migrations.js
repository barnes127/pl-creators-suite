const {
  PROJECT_SCHEMA_VERSION,
  ProjectFormatError,
  validateProjectManifest,
} = require("./contract");

const migrations = new Map();

function registerMigration(fromVersion, migration) {
  if (!Number.isInteger(fromVersion) || fromVersion < 1) {
    throw new Error("Migration version must be a positive integer");
  }

  if (typeof migration !== "function") {
    throw new Error("Migration must be a function");
  }

  migrations.set(fromVersion, migration);
}

function migrateProjectManifest(inputManifest) {
  let manifest = structuredClone(inputManifest);

  if (!Number.isInteger(manifest.schemaVersion)) {
    throw new ProjectFormatError(
      "Cannot migrate project without a valid schemaVersion",
      "INVALID_SCHEMA_VERSION",
    );
  }

  if (manifest.schemaVersion > PROJECT_SCHEMA_VERSION) {
    throw new ProjectFormatError(
      `Project schema ${manifest.schemaVersion} is newer than supported schema ${PROJECT_SCHEMA_VERSION}`,
      "PROJECT_FROM_NEWER_VERSION",
    );
  }

  while (manifest.schemaVersion < PROJECT_SCHEMA_VERSION) {
    const migration = migrations.get(manifest.schemaVersion);

    if (!migration) {
      throw new ProjectFormatError(
        `No migration exists from schema version ${manifest.schemaVersion}`,
        "MIGRATION_NOT_FOUND",
      );
    }

    const previousVersion = manifest.schemaVersion;
    manifest = migration(structuredClone(manifest));

    if (
      !manifest ||
      manifest.schemaVersion !== previousVersion + 1
    ) {
      throw new ProjectFormatError(
        `Migration from schema ${previousVersion} did not produce schema ${previousVersion + 1}`,
        "INVALID_MIGRATION_RESULT",
      );
    }
  }

  return validateProjectManifest(manifest);
}

module.exports = {
  registerMigration,
  migrateProjectManifest,
};
