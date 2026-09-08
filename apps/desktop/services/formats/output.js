const fs = require("fs/promises");
const path = require("path");

class OutputExistsError extends Error {
  constructor(destinationPath) {
    super(
      `Output already exists: ${destinationPath}`,
    );

    this.name =
      "OutputExistsError";

    this.code =
      "OUTPUT_EXISTS";

    this.destinationPath =
      destinationPath;
  }
}

function createOutputAbortError() {
  const error =
    new Error(
      "Output operation cancelled",
    );

  error.name =
    "AbortError";

  error.code =
    "OPERATION_CANCELLED";

  return error;
}

function throwIfOutputAborted(
  signal,
) {
  if (signal?.aborted) {
    throw createOutputAbortError();
  }
}

async function fileExists(
  filePath,
) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function createStagingPath(
  destinationPath,
) {
  return path.join(
    path.dirname(
      destinationPath,
    ),
    `.${path.basename(
      destinationPath,
    )}.tmp-${process.pid}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
  );
}

async function publishStagedFile(
  stagedPath,
  destinationPath,
  options = {},
) {
  const overwrite =
    options.overwrite === true;

  const signal =
    options.signal;

  throwIfOutputAborted(
    signal,
  );

  await fs.mkdir(
    path.dirname(
      destinationPath,
    ),
    {
      recursive: true,
    },
  );

  if (!overwrite) {
    try {
      await fs.link(
        stagedPath,
        destinationPath,
      );
    } catch (error) {
      if (
        error.code ===
        "EEXIST"
      ) {
        throw new OutputExistsError(
          destinationPath,
        );
      }

      throw error;
    }

    await fs.rm(
      stagedPath,
      { force: true },
    );

    return destinationPath;
  }

  const destinationExists =
    await fileExists(
      destinationPath,
    );

  let backupPath = null;

  if (destinationExists) {
    backupPath =
      `${destinationPath}.bak-${process.pid}-${Date.now()}`;

    await fs.rename(
      destinationPath,
      backupPath,
    );
  }

  try {
    throwIfOutputAborted(
      signal,
    );

    await fs.rename(
      stagedPath,
      destinationPath,
    );
  } catch (error) {
    if (backupPath) {
      await fs.rename(
        backupPath,
        destinationPath,
      ).catch(() => {});
    }

    throw error;
  }

  if (backupPath) {
    await fs.rm(
      backupPath,
      { force: true },
    ).catch(() => {});
  }

  return destinationPath;
}

async function writeTextFileSafely(
  destinationPath,
  content,
  options = {},
) {
  const stagedPath =
    createStagingPath(
      destinationPath,
    );

  await fs.mkdir(
    path.dirname(
      destinationPath,
    ),
    {
      recursive: true,
    },
  );

  try {
    throwIfOutputAborted(
      options.signal,
    );

    await fs.writeFile(
      stagedPath,
      content,
      "utf8",
    );

    throwIfOutputAborted(
      options.signal,
    );

    await publishStagedFile(
      stagedPath,
      destinationPath,
      options,
    );

    return destinationPath;
  } finally {
    await fs.rm(
      stagedPath,
      { force: true },
    ).catch(() => {});
  }
}

module.exports = {
  OutputExistsError,
  createOutputAbortError,
  throwIfOutputAborted,
  fileExists,
  createStagingPath,
  publishStagedFile,
  writeTextFileSafely,
};
