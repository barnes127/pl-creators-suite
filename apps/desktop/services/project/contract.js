const PROJECT_SCHEMA_VERSION = 1;
const PROJECT_MANIFEST_NAME = "pl-project.json";
const PROJECT_ARCHIVE_EXTENSION = ".plproj";

class ProjectFormatError extends Error {
  constructor(message, code = "PROJECT_FORMAT_ERROR") {
    super(message);
    this.name = "ProjectFormatError";
    this.code = code;
  }
}

function validateProjectManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new ProjectFormatError(
      "Project manifest must be an object",
      "INVALID_MANIFEST",
    );
  }

  if (!Number.isInteger(manifest.schemaVersion)) {
    throw new ProjectFormatError(
      "Project manifest is missing a valid schemaVersion",
      "INVALID_SCHEMA_VERSION",
    );
  }

  if (manifest.schemaVersion < 1) {
    throw new ProjectFormatError(
      `Unsupported project schema version: ${manifest.schemaVersion}`,
      "UNSUPPORTED_SCHEMA_VERSION",
    );
  }

  if (manifest.schemaVersion > PROJECT_SCHEMA_VERSION) {
    throw new ProjectFormatError(
      `Project requires schema version ${manifest.schemaVersion}, but this build supports up to ${PROJECT_SCHEMA_VERSION}`,
      "PROJECT_FROM_NEWER_VERSION",
    );
  }

  if (typeof manifest.name !== "string" || !manifest.name.trim()) {
    throw new ProjectFormatError(
      "Project manifest requires a name",
      "INVALID_PROJECT_NAME",
    );
  }

  if (
    typeof manifest.createdAt !== "string" ||
    Number.isNaN(Date.parse(manifest.createdAt))
  ) {
    throw new ProjectFormatError(
      "Project manifest has an invalid createdAt timestamp",
      "INVALID_CREATED_AT",
    );
  }

  if (
    typeof manifest.updatedAt !== "string" ||
    Number.isNaN(Date.parse(manifest.updatedAt))
  ) {
    throw new ProjectFormatError(
      "Project manifest has an invalid updatedAt timestamp",
      "INVALID_UPDATED_AT",
    );
  }

  return manifest;
}

module.exports = {
  PROJECT_SCHEMA_VERSION,
  PROJECT_MANIFEST_NAME,
  PROJECT_ARCHIVE_EXTENSION,
  ProjectFormatError,
  validateProjectManifest,
};
