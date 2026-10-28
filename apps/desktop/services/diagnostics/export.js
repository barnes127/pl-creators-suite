
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

const SCHEMA_VERSION = 1;
const PACKAGE_KIND = "pl-diagnostic-export";

const COLLECTIONS = Object.freeze([
  "logs",
  "problems",
  "crashes",
  "resources",
  "jobs",
]);

const MAX_RECORDS = 250;

const SEVERITIES = new Set([
  "healthy",
  "info",
  "warning",
  "error",
  "critical",
  "unavailable",
  "unknown",
]);

const STATUSES = new Set([
  "healthy",
  "degraded",
  "failed",
  "unavailable",
  "unknown",
  "disabled",
]);

const LEVELS = new Set([
  "debug",
  "info",
  "warn",
  "warning",
  "error",
  "fatal",
]);

const JOB_STATUSES = new Set([
  "queued",
  "running",
  "cancelling",
  "completed",
  "failed",
  "cancelled",
  "interrupted",
]);

function safeEnum(value, allowed) {
  return typeof value === "string" &&
    allowed.has(value)
    ? value
    : "unknown";
}

function safeTime(value) {
  if (
    typeof value !== "string" ||
    value.length > 64
  ) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function safeCount(value) {
  return Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : 0;
}

function safeNumber(value) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function safeRecord(collection, record) {
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    return { invalid: true };
  }

  switch (collection) {
    case "logs":
      return {
        timestamp: safeTime(record.timestamp),
        level: safeEnum(record.level, LEVELS),
      };

    case "problems":
      return {
        timestamp: safeTime(record.timestamp),
        severity: safeEnum(
          record.severity,
          SEVERITIES,
        ),
      };

    case "crashes":
      return {
        timestamp: safeTime(record.timestamp),
        recorded: true,
      };

    case "resources":
      return {
        timestamp: safeTime(record.timestamp),
        cpuPercent: safeNumber(
          record.cpuPercent,
        ),
        memoryBytes: safeNumber(
          record.memoryBytes,
        ),
      };

    case "jobs":
      return {
        status: safeEnum(
          record.status,
          JOB_STATUSES,
        ),
        createdAt: safeTime(
          record.createdAt,
        ),
        finishedAt: safeTime(
          record.finishedAt,
        ),
      };

    default:
      return { invalid: true };
  }
}

function sanitizeCounts(value) {
  const result = {};

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return result;
  }

  for (const severity of SEVERITIES) {
    if (Object.hasOwn(value, severity)) {
      result[severity] = safeCount(
        value[severity],
      );
    }
  }

  return result;
}

function sanitizeHealth(health = {}) {
  const summary = health?.summary || {};

  return {
    generatedAt: safeTime(
      health?.generatedAt,
    ),

    overallSeverity: safeEnum(
      health?.overallSeverity,
      SEVERITIES,
    ),

    summary: {
      collectorCount: safeCount(
        summary.collectorCount,
      ),

      sourceCount: safeCount(
        summary.sourceCount,
      ),

      findingCount: safeCount(
        summary.findingCount,
      ),

      sourceCounts: sanitizeCounts(
        summary.sourceCounts,
      ),

      findingCounts: sanitizeCounts(
        summary.findingCounts,
      ),
    },

    sources: Array.isArray(health?.sources)
      ? health.sources.slice(0, 100).map(
          (source) => ({
            category:
              typeof source?.category === "string" &&
              [
                "system", "diagnostics",
                "project", "recovery",
                "engine", "extension",
                "index", "backup",
                "ai", "sync", "task",
                "cache",
              ].includes(source.category)
                ? source.category
                : "unknown",

            status: safeEnum(
              source?.status,
              STATUSES,
            ),

            severity: safeEnum(
              source?.severity,
              SEVERITIES,
            ),
          }),
        )
      : [],

    findings: Array.isArray(health?.findings)
      ? health.findings.slice(0, 250).map(
          (finding) => ({
            status: safeEnum(
              finding?.status,
              STATUSES,
            ),

            severity: safeEnum(
              finding?.severity,
              SEVERITIES,
            ),
          }),
        )
      : [],
  };
}

function buildDiagnosticPackage(input = {}) {
  const diagnostics = {};

  for (const collection of COLLECTIONS) {
    const records =
      input.diagnostics?.[collection];

    diagnostics[collection] =
      Array.isArray(records)
        ? records.slice(-MAX_RECORDS).map(
            (record) =>
              safeRecord(collection, record),
          )
        : [];
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    kind: PACKAGE_KIND,

    generatedAt:
      new Date().toISOString(),

    privacy: {
      localOnly: true,
      userInitiated: true,
      projectContentIncluded: false,
      sensitiveValuesRedacted: true,
      dataMinimized: true,
    },

    context: {
      projectOpen:
        input.projectOpen === true,
    },

    health: sanitizeHealth(
      input.health,
    ),

    diagnostics,
  };
}

function defaultExportPath() {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const id = crypto.randomUUID()
    .slice(0, 8);

  return path.join(
    os.homedir(),
    ".plcs",
    "diagnostic-exports",
    `pl-diagnostics-${stamp}-${id}.json`,
  );
}

async function writeDiagnosticPackage(
  diagnosticPackage,
  outPath,
) {
  if (
    outPath !== undefined &&
    (
      typeof outPath !== "string" ||
      !outPath.trim()
    )
  ) {
    throw new TypeError(
      "outPath must be a non-empty string.",
    );
  }

  const destination = path.resolve(
    outPath || defaultExportPath(),
  );

  if (
    path.extname(destination).toLowerCase() !==
    ".json"
  ) {
    throw new Error(
      "Diagnostic export must use .json.",
    );
  }

  if (
    diagnosticPackage?.kind !== PACKAGE_KIND ||
    diagnosticPackage?.schemaVersion !==
      SCHEMA_VERSION
  ) {
    throw new Error(
      "Invalid diagnostic package.",
    );
  }

  const payload =
    JSON.stringify(
      diagnosticPackage,
      null,
      2,
    ) + "\n";

  const directory =
    path.dirname(destination);

  await fs.mkdir(directory, {
    recursive: true,
    mode: 0o700,
  });

  const temporary = path.join(
    directory,
    `.pl-diagnostic-${crypto.randomUUID()}.tmp`,
  );

  let temporaryCreated = false;

  try {
    await fs.writeFile(
      temporary,
      payload,
      {
        flag: "wx",
        mode: 0o600,
        encoding: "utf8",
      },
    );

    temporaryCreated = true;

    // Exclusive creation prevents replacing
    // an existing final export.
    await fs.link(
      temporary,
      destination,
    );

    await fs.unlink(temporary);
    temporaryCreated = false;

    return {
      path: destination,
      schemaVersion: SCHEMA_VERSION,
      bytes: Buffer.byteLength(payload),
    };
  } finally {
    if (temporaryCreated) {
      await fs.rm(temporary, {
        force: true,
      });
    }
  }
}

module.exports = {
  SCHEMA_VERSION,
  PACKAGE_KIND,
  COLLECTIONS,
  safeRecord,
  sanitizeHealth,
  buildDiagnosticPackage,
  writeDiagnosticPackage,
};
