const {
  scanProjectFiles,
  readProjectSnapshot,
} = require(
  "./snapshots",
);


function buildFileMap(
  files,
) {
  return new Map(
    files.map(
      (
        file,
      ) => [
        file.relativePath,
        file,
      ],
    ),
  );
}


function compareFileSets(
  baselineFiles,
  currentFiles,
) {
  const baseline =
    buildFileMap(
      baselineFiles,
    );


  const current =
    buildFileMap(
      currentFiles,
    );


  const added =
    [];

  const changed =
    [];

  const removed =
    [];

  const unchanged =
    [];


  for (
    const [
      relativePath,
      currentFile,
    ]
    of current
  ) {
    const baselineFile =
      baseline.get(
        relativePath,
      );


    if (
      !baselineFile
    ) {
      added.push(
        relativePath,
      );

      continue;
    }


    if (
      baselineFile.hash !==
      currentFile.hash
    ) {
      changed.push(
        relativePath,
      );
    } else {
      unchanged.push(
        relativePath,
      );
    }
  }


  for (
    const relativePath
    of baseline.keys()
  ) {
    if (
      !current.has(
        relativePath,
      )
    ) {
      removed.push(
        relativePath,
      );
    }
  }


  added.sort();
  changed.sort();
  removed.sort();
  unchanged.sort();


  return {
    added,
    changed,
    removed,
    unchanged,
  };
}


async function compareSnapshotToProject(
  projectRoot,
  snapshotId,
) {
  const snapshot =
    await readProjectSnapshot(
      projectRoot,
      snapshotId,
    );


  if (
    !snapshot
  ) {
    throw new Error(
      `Unknown snapshot: ${snapshotId}`,
    );
  }


  const currentFiles =
    await scanProjectFiles(
      projectRoot,
    );


  return compareFileSets(
    snapshot.files,
    currentFiles,
  );
}


async function compareSnapshots(
  projectRoot,
  baselineSnapshotId,
  currentSnapshotId,
) {
  const [
    baseline,
    current,
  ] =
    await Promise.all([
      readProjectSnapshot(
        projectRoot,
        baselineSnapshotId,
      ),

      readProjectSnapshot(
        projectRoot,
        currentSnapshotId,
      ),
    ]);


  if (
    !baseline
  ) {
    throw new Error(
      `Unknown snapshot: ${baselineSnapshotId}`,
    );
  }


  if (
    !current
  ) {
    throw new Error(
      `Unknown snapshot: ${currentSnapshotId}`,
    );
  }


  return compareFileSets(
    baseline.files,
    current.files,
  );
}


module.exports = {
  buildFileMap,
  compareFileSets,
  compareSnapshotToProject,
  compareSnapshots,
};
