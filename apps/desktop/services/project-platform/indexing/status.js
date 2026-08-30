const {
  scanProjectFiles,
} =
  require(
    "./scanner",
  );

const {
  classifyIndexChanges,
} =
  require(
    "./diff",
  );

const {
  readProjectIndex,
} =
  require(
    "./storage",
  );


async function getIndexStatus(
  params = {},
) {
  const previousIndex =
    await readProjectIndex(
      params.projectRoot,
    );


  const scannedFiles =
    await scanProjectFiles({
      projectRoot:
        params.projectRoot,

      ignore:
        params.ignore,
    });


  const changes =
    classifyIndexChanges(
      previousIndex,
      scannedFiles,
    );


  const stale =
    changes.added.length +
    changes.changed.length +
    changes.removed.length;


  return {
    generatedAt:
      previousIndex.generatedAt,

    indexedFiles:
      Object.keys(
        previousIndex.files,
      ).length,

    scannedFiles:
      scannedFiles.length,

    stale,

    current:
      stale ===
      0,

    changes: {
      added:
        changes.added.map(
          (
            file,
          ) =>
            file.relativePath,
        ),

      changed:
        changes.changed.map(
          (
            file,
          ) =>
            file.relativePath,
        ),

      removed:
        changes.removed,
    },
  };
}


module.exports = {
  getIndexStatus,
};
