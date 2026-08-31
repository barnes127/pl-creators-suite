const crypto =
  require("crypto");

const fs =
  require("fs/promises");

const path =
  require("path");


const {
  ensureDir,
  writeJsonFileAtomic,
} = require(
  "../../../util/fs",
);


const {
  RECOVERY_SCHEMA_VERSION,
} = require(
  "./constants",
);


const {
  cleanProjectRoot,
  getSnapshotDir,
  getSnapshotRoot,
  getSnapshotFilesDir,
  getSnapshotMetadataPath,
} = require(
  "./paths",
);


let snapshotSequence =
  0;


const IGNORED_TOP_LEVEL_NAMES =
  new Set([
    ".git",
    ".pl-index",
    ".pl-recovery",
    "node_modules",
  ]);


function createSnapshotId(
  kind =
    "snapshot",
) {
  snapshotSequence +=
    1;


  return [
    kind,
    Date.now(),
    snapshotSequence,
  ].join(
    "-",
  );
}


function normalizeRelativePath(
  value,
) {
  return String(
    value,
  )
    .split(
      path.sep,
    )
    .join(
      "/",
    );
}


function assertInsideRoot(
  root,
  target,
) {
  const resolvedRoot =
    path.resolve(
      root,
    );


  const resolvedTarget =
    path.resolve(
      target,
    );


  if (
    resolvedTarget !==
      resolvedRoot &&
    !resolvedTarget.startsWith(
      `${resolvedRoot}${path.sep}`,
    )
  ) {
    throw new Error(
      "Path escapes project root",
    );
  }


  return resolvedTarget;
}


async function hashFile(
  filePath,
) {
  const hash =
    crypto.createHash(
      "sha256",
    );


  const handle =
    await fs.open(
      filePath,
      "r",
    );


  try {
    const stream =
      handle.createReadStream();


    for await (
      const chunk
      of stream
    ) {
      hash.update(
        chunk,
      );
    }
  } finally {
    await handle.close();
  }


  return hash.digest(
    "hex",
  );
}


async function scanProjectFiles(
  projectRoot,
) {
  const root =
    cleanProjectRoot(
      projectRoot,
    );


  const results =
    [];


  async function visit(
    currentDirectory,
    relativeDirectory =
      "",
  ) {
    const entries =
      await fs.readdir(
        currentDirectory,
        {
          withFileTypes:
            true,
        },
      );


    entries.sort(
      (
        left,
        right,
      ) =>
        left.name.localeCompare(
          right.name,
        ),
    );


    for (
      const entry
      of entries
    ) {
      if (
        !relativeDirectory &&
        IGNORED_TOP_LEVEL_NAMES.has(
          entry.name,
        )
      ) {
        continue;
      }


      const relativePath =
        relativeDirectory
          ? path.join(
              relativeDirectory,
              entry.name,
            )
          : entry.name;


      const absolutePath =
        assertInsideRoot(
          root,
          path.join(
            root,
            relativePath,
          ),
        );


      if (
        entry.isDirectory()
      ) {
        await visit(
          absolutePath,
          relativePath,
        );

        continue;
      }


      if (
        !entry.isFile()
      ) {
        continue;
      }


      const stat =
        await fs.stat(
          absolutePath,
        );


      results.push({
        relativePath:
          normalizeRelativePath(
            relativePath,
          ),

        absolutePath,

        size:
          stat.size,

        hash:
          await hashFile(
            absolutePath,
          ),
      });
    }
  }


  await visit(
    root,
  );


  return results;
}


async function createProjectSnapshot(
  params = {},
) {
  const projectRoot =
    cleanProjectRoot(
      params.projectRoot,
    );


  const kind =
    params.kind ===
      "checkpoint"
      ? "checkpoint"
      : "snapshot";


  const id =
    params.id ||
    createSnapshotId(
      kind,
    );


  const snapshotRoot =
    getSnapshotRoot(
      projectRoot,
      id,
    );


  try {
    await fs.access(
      snapshotRoot,
    );

    throw new Error(
      `Snapshot already exists: ${id}`,
    );
  } catch (
    error
  ) {
    if (
      error?.code !==
      "ENOENT"
    ) {
      throw error;
    }
  }


  const filesDirectory =
    getSnapshotFilesDir(
      projectRoot,
      id,
    );


  await ensureDir(
    filesDirectory,
  );


  const sourceFiles =
    await scanProjectFiles(
      projectRoot,
    );


  const fileRecords =
    [];


  try {
    for (
      const sourceFile
      of sourceFiles
    ) {
      const destination =
        assertInsideRoot(
          filesDirectory,
          path.join(
            filesDirectory,
            ...sourceFile.relativePath.split(
              "/",
            ),
          ),
        );


      await ensureDir(
        path.dirname(
          destination,
        ),
      );


      await fs.copyFile(
        sourceFile.absolutePath,
        destination,
      );


      fileRecords.push({
        relativePath:
          sourceFile.relativePath,

        size:
          sourceFile.size,

        hash:
          sourceFile.hash,
      });
    }


    const createdAt =
      new Date()
        .toISOString();


    const snapshot = {
      schemaVersion:
        RECOVERY_SCHEMA_VERSION,

      id,

      kind,

      name:
        params.name ??
        null,

      description:
        params.description ??
        null,

      projectRoot,

      createdAt,

      files:
        fileRecords,
    };


    await writeJsonFileAtomic(
      getSnapshotMetadataPath(
        projectRoot,
        id,
      ),
      snapshot,
    );


    return snapshot;
  } catch (
    error
  ) {
    await fs.rm(
      snapshotRoot,
      {
        recursive:
          true,

        force:
          true,
      },
    );


    throw error;
  }
}


async function createNamedCheckpoint(
  params = {},
) {
  const name =
    String(
      params.name ||
      "",
    ).trim();


  if (
    !name
  ) {
    throw new Error(
      "Checkpoint name is required",
    );
  }


  return createProjectSnapshot({
    ...params,

    kind:
      "checkpoint",

    name,
  });
}


async function readProjectSnapshot(
  projectRoot,
  snapshotId,
) {
  const metadataPath =
    getSnapshotMetadataPath(
      projectRoot,
      snapshotId,
    );


  let raw;


  try {
    raw =
      await fs.readFile(
        metadataPath,
        "utf8",
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return null;
    }


    throw error;
  }


  const snapshot =
    JSON.parse(
      raw,
    );


  if (
    !Array.isArray(
      snapshot.files,
    )
  ) {
    throw new Error(
      `Invalid snapshot metadata: ${snapshotId}`,
    );
  }


  return snapshot;
}


async function listProjectSnapshots(
  projectRoot,
) {
  const directory =
    getSnapshotDir(
      projectRoot,
    );


  let entries;


  try {
    entries =
      await fs.readdir(
        directory,
        {
          withFileTypes:
            true,
        },
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return [];
    }


    throw error;
  }


  const snapshots =
    [];


  for (
    const entry
    of entries
  ) {
    if (
      !entry.isDirectory()
    ) {
      continue;
    }


    const snapshot =
      await readProjectSnapshot(
        projectRoot,
        entry.name,
      );


    if (
      snapshot
    ) {
      snapshots.push(
        snapshot,
      );
    }
  }


  return snapshots.sort(
    (
      left,
      right,
    ) =>
      String(
        right.createdAt,
      ).localeCompare(
        String(
          left.createdAt,
        ),
      ),
  );
}


async function deleteProjectSnapshot(
  projectRoot,
  snapshotId,
) {
  await fs.rm(
    getSnapshotRoot(
      projectRoot,
      snapshotId,
    ),
    {
      recursive:
        true,

      force:
        true,
    },
  );


  return true;
}


module.exports = {
  IGNORED_TOP_LEVEL_NAMES,
  createSnapshotId,
  normalizeRelativePath,
  assertInsideRoot,
  hashFile,
  scanProjectFiles,
  createProjectSnapshot,
  createNamedCheckpoint,
  readProjectSnapshot,
  listProjectSnapshots,
  deleteProjectSnapshot,
};
