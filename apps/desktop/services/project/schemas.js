const {
  ProjectFormatError,
} = require("./contract");

const SCHEMA_VERSION = 1;

const RESOURCE_STATES = Object.freeze([
  "embedded",
  "linked",
  "external",
  "generated",
  "cached",
  "stale",
  "missing",
  "shared",
  "derived",
]);

const DATA_KINDS = Object.freeze([
  "slice",
  "asset",
  "extension",
  "workflow",
  "cloud-sync",
]);

function validateVersionedEnvelope(
  envelope,
  {
    expectedKind = null,
    supportedVersion = SCHEMA_VERSION,
  } = {},
) {
  if (
    !envelope ||
    typeof envelope !== "object" ||
    Array.isArray(envelope)
  ) {
    throw new ProjectFormatError(
      "Versioned project data must be an object",
      "INVALID_DATA_ENVELOPE",
    );
  }

  if (!Number.isInteger(envelope.schemaVersion)) {
    throw new ProjectFormatError(
      "Versioned project data requires schemaVersion",
      "INVALID_SCHEMA_VERSION",
    );
  }

  if (envelope.schemaVersion < 1) {
    throw new ProjectFormatError(
      `Unsupported schema version: ${envelope.schemaVersion}`,
      "UNSUPPORTED_SCHEMA_VERSION",
    );
  }

  if (envelope.schemaVersion > supportedVersion) {
    throw new ProjectFormatError(
      `Data schema ${envelope.schemaVersion} is newer than supported schema ${supportedVersion}`,
      "DATA_FROM_NEWER_VERSION",
    );
  }

  if (
    typeof envelope.kind !== "string" ||
    !DATA_KINDS.includes(envelope.kind)
  ) {
    throw new ProjectFormatError(
      `Invalid project data kind: ${envelope.kind}`,
      "INVALID_DATA_KIND",
    );
  }

  if (
    expectedKind &&
    envelope.kind !== expectedKind
  ) {
    throw new ProjectFormatError(
      `Expected ${expectedKind} data but received ${envelope.kind}`,
      "DATA_KIND_MISMATCH",
    );
  }

  if (
    !Object.prototype.hasOwnProperty.call(
      envelope,
      "data",
    )
  ) {
    throw new ProjectFormatError(
      "Versioned project data requires a data field",
      "MISSING_DATA",
    );
  }

  return envelope;
}

function createVersionedEnvelope(
  kind,
  data,
  metadata = {},
) {
  if (!DATA_KINDS.includes(kind)) {
    throw new ProjectFormatError(
      `Invalid project data kind: ${kind}`,
      "INVALID_DATA_KIND",
    );
  }

  const envelope = {
    schemaVersion: SCHEMA_VERSION,
    kind,
    data,
    metadata: {
      updatedAt: new Date().toISOString(),
      ...metadata,
    },
  };

  return validateVersionedEnvelope(
    envelope,
    {
      expectedKind: kind,
    },
  );
}

function validateResourceState(state) {
  if (!RESOURCE_STATES.includes(state)) {
    throw new ProjectFormatError(
      `Invalid resource state: ${state}`,
      "INVALID_RESOURCE_STATE",
    );
  }

  return state;
}

function validateAssetMetadata(asset) {
  const envelope = validateVersionedEnvelope(
    asset,
    {
      expectedKind: "asset",
    },
  );

  if (
    !envelope.data ||
    typeof envelope.data !== "object" ||
    Array.isArray(envelope.data)
  ) {
    throw new ProjectFormatError(
      "Asset metadata requires an object data payload",
      "INVALID_ASSET_METADATA",
    );
  }

  if (
    typeof envelope.data.id !== "string" ||
    !envelope.data.id.trim()
  ) {
    throw new ProjectFormatError(
      "Asset metadata requires an id",
      "INVALID_ASSET_ID",
    );
  }

  validateResourceState(
    envelope.data.state,
  );

  return envelope;
}

module.exports = {
  SCHEMA_VERSION,
  RESOURCE_STATES,
  DATA_KINDS,
  validateVersionedEnvelope,
  createVersionedEnvelope,
  validateResourceState,
  validateAssetMetadata,
};
