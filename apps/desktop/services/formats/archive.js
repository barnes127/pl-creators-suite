const { spawn } = require("child_process");

class ArchiveCommandError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ArchiveCommandError";
    this.code = "ARCHIVE_COMMAND_FAILED";
    this.details = details;
  }
}

function createAbortError(message = "Archive operation cancelled") {
  const error = new Error(message);
  error.name = "AbortError";
  error.code = "OPERATION_CANCELLED";
  return error;
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function runArchiveCommand(
  command,
  args,
  cwd,
  options = {},
) {
  const signal = options.signal;

  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener(
        "abort",
        abortOperation,
      );
    };

    const finish = (operation) => {
      if (settled) return;

      settled = true;
      cleanup();
      operation();
    };

    const abortOperation = () => {
      child.kill();

      finish(() => {
        reject(createAbortError());
      });
    };

    signal?.addEventListener(
      "abort",
      abortOperation,
      { once: true },
    );

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      finish(() => reject(error));
    });

    child.on("close", (code) => {
      finish(() => {
        if (signal?.aborted) {
          reject(createAbortError());
          return;
        }

        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }

        reject(
          new ArchiveCommandError(
            `${command} failed (${code}): ${stderr || stdout}`,
            {
              command,
              args,
              code,
              stderr,
              stdout,
            },
          ),
        );
      });
    });
  });
}

function validateArchiveEntries(entries) {
  for (const entry of entries) {
    const normalizedEntry =
      String(entry || "").trim();

    if (!normalizedEntry) continue;

    const segments = normalizedEntry
      .replace(/\\/g, "/")
      .split("/")
      .filter(Boolean);

    const isAbsolute =
      normalizedEntry.startsWith("/") ||
      normalizedEntry.startsWith("\\") ||
      /^[A-Za-z]:/.test(normalizedEntry);

    const escapesRoot =
      segments.includes("..");

    if (isAbsolute || escapesRoot) {
      const error = new Error(
        `Unsafe project archive entry: ${normalizedEntry}`,
      );

      error.code =
        "UNSAFE_ARCHIVE_ENTRY";

      throw error;
    }
  }

  return entries;
}

async function listZipArchiveEntries(
  filePath,
  options = {},
) {
  const result =
    await runArchiveCommand(
      "unzip",
      ["-Z1", filePath],
      options.cwd || process.cwd(),
      options,
    );

  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean);
}

async function createZipArchive(
  sourceRoot,
  outPath,
  options = {},
) {
  await runArchiveCommand(
    "zip",
    ["-r", outPath, "."],
    sourceRoot,
    options,
  );

  return { outPath };
}

async function extractZipArchive(
  filePath,
  destinationRoot,
  options = {},
) {
  await runArchiveCommand(
    "unzip",
    [
      "-q",
      filePath,
      "-d",
      destinationRoot,
    ],
    options.cwd || process.cwd(),
    options,
  );

  return {
    destinationRoot,
  };
}

module.exports = {
  ArchiveCommandError,
  createAbortError,
  throwIfAborted,
  runArchiveCommand,
  validateArchiveEntries,
  listZipArchiveEntries,
  createZipArchive,
  extractZipArchive,
};
