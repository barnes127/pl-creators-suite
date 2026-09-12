const fs =
  require("fs/promises");

const path =
  require("path");

const {
  writeTextFileSafely,
} =
  require(
    "../formats/output",
  );

class ProjectFileBoundaryError
  extends Error {
  constructor(
    relativePath,
  ) {
    super(
      `Project file path escapes project root: ${relativePath}`,
    );

    this.name =
      "ProjectFileBoundaryError";

    this.code =
      "PROJECT_FILE_OUTSIDE_ROOT";

    this.relativePath =
      relativePath;
  }
}

function cleanProjectRoot(
  projectRoot,
) {
  const root =
    String(
      projectRoot || "",
    ).trim();

  if (!root) {
    throw new Error(
      "projectRoot is required",
    );
  }

  return path.resolve(
    root,
  );
}

function cleanRelativePath(
  relativePath,
) {
  const value =
    String(
      relativePath || "",
    ).trim();

  if (
    value &&
    path.isAbsolute(
      value,
    )
  ) {
    throw new ProjectFileBoundaryError(
      value,
    );
  }

  return value;
}

function isWithinRoot(
  root,
  target,
) {
  return (
    target === root ||
    target.startsWith(
      `${root}${path.sep}`,
    )
  );
}

async function getRealProjectRoot(
  projectRoot,
) {
  const root =
    cleanProjectRoot(
      projectRoot,
    );

  const realRoot =
    await fs.realpath(
      root,
    );

  const stats =
    await fs.stat(
      realRoot,
    );

  if (!stats.isDirectory()) {
    throw new Error(
      "projectRoot must be a directory",
    );
  }

  return realRoot;
}

async function resolveExistingPath(
  projectRoot,
  relativePath,
) {
  const realRoot =
    await getRealProjectRoot(
      projectRoot,
    );

  const relative =
    cleanRelativePath(
      relativePath,
    );

  const lexicalPath =
    path.resolve(
      realRoot,
      relative || ".",
    );

  if (
    !isWithinRoot(
      realRoot,
      lexicalPath,
    )
  ) {
    throw new ProjectFileBoundaryError(
      relative,
    );
  }

  const realPath =
    await fs.realpath(
      lexicalPath,
    );

  if (
    !isWithinRoot(
      realRoot,
      realPath,
    )
  ) {
    throw new ProjectFileBoundaryError(
      relative,
    );
  }

  return {
    realRoot,
    realPath,
  };
}

async function resolveWritablePath(
  projectRoot,
  relativePath,
) {
  const realRoot =
    await getRealProjectRoot(
      projectRoot,
    );

  const relative =
    cleanRelativePath(
      relativePath,
    );

  if (!relative) {
    throw new Error(
      "relativePath is required",
    );
  }

  const lexicalPath =
    path.resolve(
      realRoot,
      relative,
    );

  if (
    !isWithinRoot(
      realRoot,
      lexicalPath,
    )
  ) {
    throw new ProjectFileBoundaryError(
      relative,
    );
  }

  const parentPath =
    path.dirname(
      lexicalPath,
    );

  const realParent =
    await fs.realpath(
      parentPath,
    );

  if (
    !isWithinRoot(
      realRoot,
      realParent,
    )
  ) {
    throw new ProjectFileBoundaryError(
      relative,
    );
  }

  return path.join(
    realParent,
    path.basename(
      lexicalPath,
    ),
  );
}

function entryKind(
  entry,
) {
  if (
    entry.isFile()
  ) {
    return "file";
  }

  if (
    entry.isDirectory()
  ) {
    return "directory";
  }

  return "other";
}

async function readText(
  projectRoot,
  relativePath,
) {
  const {
    realPath,
  } =
    await resolveExistingPath(
      projectRoot,
      relativePath,
    );

  return fs.readFile(
    realPath,
    "utf8",
  );
}

async function list(
  projectRoot,
  relativePath = "",
) {
  const {
    realRoot,
    realPath,
  } =
    await resolveExistingPath(
      projectRoot,
      relativePath,
    );

  const entries =
    await fs.readdir(
      realPath,
      {
        withFileTypes:
          true,
      },
    );

  return entries
    .map(
      (
        entry,
      ) => {
        const absolutePath =
          path.join(
            realPath,
            entry.name,
          );

        return {
          name:
            entry.name,

          relativePath:
            path
              .relative(
                realRoot,
                absolutePath,
              )
              .replace(
                /\\/g,
                "/",
              ),

          kind:
            entryKind(
              entry,
            ),
        };
      },
    )
    .sort(
      (
        left,
        right,
      ) =>
        left.name.localeCompare(
          right.name,
        ),
    );
}

async function stat(
  projectRoot,
  relativePath,
) {
  const {
    realRoot,
    realPath,
  } =
    await resolveExistingPath(
      projectRoot,
      relativePath,
    );

  const stats =
    await fs.stat(
      realPath,
    );

  let kind =
    "other";

  if (
    stats.isFile()
  ) {
    kind =
      "file";
  } else if (
    stats.isDirectory()
  ) {
    kind =
      "directory";
  }

  return {
    relativePath:
      path
        .relative(
          realRoot,
          realPath,
        )
        .replace(
          /\\/g,
          "/",
        ),

    kind,

    size:
      stats.size,

    modifiedAt:
      stats.mtime
        .toISOString(),
  };
}

async function writeText(
  projectRoot,
  relativePath,
  content,
  options = {},
) {
  const destinationPath =
    await resolveWritablePath(
      projectRoot,
      relativePath,
    );

  await writeTextFileSafely(
    destinationPath,
    String(
      content ?? "",
    ),
    {
      overwrite:
        options.overwrite ===
        true,

      signal:
        options.signal,
    },
  );
}

function createFileApiAdapter() {
  return {
    readText,
    list,
    stat,
    writeText,
  };
}

module.exports = {
  ProjectFileBoundaryError,
  resolveExistingPath,
  resolveWritablePath,
  readText,
  list,
  stat,
  writeText,
  createFileApiAdapter,
};
