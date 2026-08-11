const fs = require("fs");
const path = require("path");

const REGISTRY_DIR = path.resolve(
  __dirname,
  "../../docs/capabilities/registry",
);

const REQUIRED_REGISTRY_FILES = new Set([
  "animation.json",
  "code.json",
  "command-bridge.json",
  "command-center.json",
  "core.json",
  "docs.json",
  "game.json",
  "modeler.json",
  "spreadsheets.json",
  "terminal-workflows.json",
  "engines.json",
  "physics-research.json",
  "cloud-services.json",
  "collaboration.json",
  "copilot.json",
  "extensions-marketplace.json",
  "research-hardware.json",
]);

const VALID_STATUSES = new Set([
  "complete",
  "partial",
  "missing",
  "blocked",
  "deferred",
]);

function loadRegistryFiles() {
  if (!fs.existsSync(REGISTRY_DIR)) {
    throw new Error(`Capability registry directory not found: ${REGISTRY_DIR}`);
  }

  return fs
    .readdirSync(REGISTRY_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

function validateCapability(capability, fileName, seenIds) {
  if (!capability.id) {
    throw new Error(`${fileName}: capability is missing an id`);
  }

  if (seenIds.has(capability.id)) {
    throw new Error(`Duplicate capability ID: ${capability.id}`);
  }

  seenIds.add(capability.id);

  if (!VALID_STATUSES.has(capability.status)) {
    throw new Error(
      `${capability.id}: invalid status "${capability.status}"`,
    );
  }

  if (!capability.name) {
    throw new Error(`${capability.id}: missing name`);
  }

  if (!capability.area) {
    throw new Error(`${capability.id}: missing area`);
  }

  if (!capability.targetMilestone) {
    throw new Error(`${capability.id}: missing target milestone`);
  }

  if (
    capability.status === "blocked" &&
    (!Array.isArray(capability.blockedBy) ||
      capability.blockedBy.length === 0)
  ) {
    throw new Error(
      `${capability.id}: blocked capability must identify blockedBy`,
    );
  }

  if (
    capability.status === "deferred" &&
    !capability.deferralReason
  ) {
    throw new Error(
      `${capability.id}: deferred capability must include deferralReason`,
    );
  }

  if (!capability.slice) {
    throw new Error(`${capability.id}: missing slice`);
  }

  if (!capability.description) {
    throw new Error(`${capability.id}: missing description`);
  }

  if (!capability.source) {
    throw new Error(`${capability.id}: missing source`);
  }

  if (!Array.isArray(capability.implementation)) {
    throw new Error(
      `${capability.id}: implementation must be an array`,
    );
  }

  if (!Array.isArray(capability.validation)) {
    throw new Error(
      `${capability.id}: validation must be an array`,
    );
  }
}

function main() {
  const files = loadRegistryFiles();

  for (const requiredFile of REQUIRED_REGISTRY_FILES) {
    if (!files.includes(requiredFile)) {
      throw new Error(
        `Required capability registry file is missing: ${requiredFile}`,
      );
    }
  }

  const seenIds = new Set();

  let capabilityCount = 0;

  const allCapabilities = [];

  for (const fileName of files) {
    const filePath = path.join(REGISTRY_DIR, fileName);
    const registry = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(registry.capabilities)) {
      throw new Error(`${fileName}: capabilities must be an array`);
    }

    for (const capability of registry.capabilities) {
      validateCapability(capability, fileName, seenIds);
      allCapabilities.push(capability);
      capabilityCount += 1;
    }
  }

  for (const capability of allCapabilities) {
  if (!Array.isArray(capability.blockedBy)) {
    throw new Error(
      `${capability.id}: blockedBy must be an array`,
    );
  }

  for (const dependencyId of capability.blockedBy) {
    if (!seenIds.has(dependencyId)) {
      throw new Error(
        `${capability.id}: unknown blockedBy capability "${dependencyId}"`,
      );
    }

    if (dependencyId === capability.id) {
      throw new Error(
        `${capability.id}: capability cannot block itself`,
      );
    }
  }
}

  console.log(
    `Capability registry valid: ${capabilityCount} capabilities across ${files.length} file(s).`,
  );
}

try {
  main();
} catch (error) {
  console.error(`Capability registry validation failed: ${error.message}`);
  process.exitCode = 1;
}
