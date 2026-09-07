const fs = require("fs/promises");
const path = require("path");

const RECORD_FILES = Object.freeze({
  logs: "logs.jsonl",
  problems: "problems.jsonl",
  jobs: "jobs.jsonl",
  crashes: "crashes.jsonl",
  resources: "resources.jsonl",
});

function getRecordPath(
  rootDir,
  collection,
) {
  const fileName =
    RECORD_FILES[collection];

  if (!fileName) {
    throw new Error(
      `Unknown diagnostics collection: ${collection}`,
    );
  }

  return path.join(
    rootDir,
    fileName,
  );
}

async function ensureDiagnosticsRoot(rootDir) {
  if (!rootDir) {
    throw new Error(
      "Diagnostics root directory is required",
    );
  }

  await fs.mkdir(
    rootDir,
    { recursive: true },
  );

  return rootDir;
}

async function appendDiagnosticRecord(
  rootDir,
  collection,
  record,
) {
  await ensureDiagnosticsRoot(
    rootDir,
  );

  const filePath =
    getRecordPath(
      rootDir,
      collection,
    );

  const line =
    `${JSON.stringify(record)}\n`;

  await fs.appendFile(
    filePath,
    line,
    "utf8",
  );

  return record;
}

async function readDiagnosticRecords(
  rootDir,
  collection,
) {
  const filePath =
    getRecordPath(
      rootDir,
      collection,
    );

  let raw;

  try {
    raw = await fs.readFile(
      filePath,
      "utf8",
    );
  } catch (error) {
    if (
      error.code ===
      "ENOENT"
    ) {
      return [];
    }

    throw error;
  }

  const records = [];

  for (
    const line
    of raw.split(/\r?\n/)
  ) {
    if (!line.trim()) continue;

    try {
      records.push(
        JSON.parse(line),
      );
    } catch (error) {
      const parseError =
        new Error(
          `Corrupt diagnostics record in ${filePath}`,
        );

      parseError.name =
        "DiagnosticsCorruptRecordError";

      parseError.code =
        "CORRUPT_DIAGNOSTICS_RECORD";

      parseError.details = {
        filePath,
        line,
        cause:
          error.message,
      };

      throw parseError;
    }
  }

  return records;
}

async function rewriteDiagnosticRecords(
  rootDir,
  collection,
  records,
) {
  await ensureDiagnosticsRoot(
    rootDir,
  );

  const filePath =
    getRecordPath(
      rootDir,
      collection,
    );

  const tempPath =
    `${filePath}.tmp-${process.pid}-${Date.now()}`;

  const body =
    records.length > 0
      ? `${records
          .map((record) =>
            JSON.stringify(record),
          )
          .join("\n")}\n`
      : "";

  try {
    await fs.writeFile(
      tempPath,
      body,
      "utf8",
    );

    await fs.rename(
      tempPath,
      filePath,
    );
  } finally {
    await fs.rm(
      tempPath,
      { force: true },
    ).catch(() => {});
  }
}

module.exports = {
  RECORD_FILES,
  getRecordPath,
  ensureDiagnosticsRoot,
  appendDiagnosticRecord,
  readDiagnosticRecords,
  rewriteDiagnosticRecords,
};
