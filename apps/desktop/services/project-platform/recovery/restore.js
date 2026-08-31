const fs =
  require("fs/promises");

const path =
  require("path");


const {
  ensureDir,
} = require(
  "../../../util/fs",
);


const {
  getSnapshotFilesDir,
} = require(
  "./paths",
);


const {
  assertInsideRoot,
  readProjectSnapshot,
  scanProjectFiles,
} = require(
  "./snapshots",
);


const {
  createPreDestructiveBackup,
} = require(
  "./backup",
);

async function restoreProjectSnapshotUnsafe(
  params = {},
) {
  const projectRoot =
    path.resolve(
      String(
        params.projectRoot ||
        "",
      ),
    );


  if (
    !params.snapshotId
  ) {
    throw new Error(
      "snapshotId is required",
    );
  }


  const snapshot =
    await readProjectSnapshot(
      projectRoot,
      params.snapshotId,
    );


  if (
    !snapshot
  ) {
    throw new Error(
      `Unknown snapshot: ${params.snapshotId}`,
    );
  }


  const snapshotFilesRoot =
    getSnapshotFilesDir(
      projectRoot,
      params.snapshotId,
    );


  const currentFiles =
    await scanProjectFiles(
      projectRoot,
    );


  const snapshotPaths =
    new Set(
      snapshot.files.map(
        (
          file,
        ) =>
          file.relativePath,
      ),
    );


  const restored =
    [];

  const removed =
    [];


  for (
    const currentFile
    of currentFiles
  ) {
    if (
      snapshotPaths.has(
        currentFile.relativePath,
      )
    ) {
      continue;
    }


    const destination =
      assertInsideRoot(
        projectRoot,
        path.join(
          projectRoot,
          ...currentFile.relativePath.split(
            "/",
          ),
        ),
      );


    await fs.rm(
      destination,
      {
        force:
          true,
      },
    );


    removed.push(
      currentFile.relativePath,
    );
  }


  for (
    const file
    of snapshot.files
  ) {
    const source =
      assertInsideRoot(
        snapshotFilesRoot,
        path.join(
          snapshotFilesRoot,
          ...file.relativePath.split(
            "/",
          ),
        ),
      );


    const destination =
      assertInsideRoot(
        projectRoot,
        path.join(
          projectRoot,
          ...file.relativePath.split(
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
      source,
      destination,
    );


    restored.push(
      file.relativePath,
    );
  }


  return {
    snapshotId:
      snapshot.id,

    restored,
    removed,
  };
}

async function restoreProjectSnapshot(
  params = {},
) {
  const backup =
    await createPreDestructiveBackup({
      projectRoot:
        params.projectRoot,

      operation:
        "snapshot restore",

      description:
        `Automatic backup before restoring snapshot ${params.snapshotId}.`,
    });


  const result =
    await restoreProjectSnapshotUnsafe(
      params,
    );


  return {
    ...result,

    backupSnapshotId:
      backup.id,
  };
}

module.exports = {
  restoreProjectSnapshot,
  restoreProjectSnapshotUnsafe,
};
