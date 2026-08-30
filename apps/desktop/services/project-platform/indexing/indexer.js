const {
  scanProjectFiles,
} =
  require(
    "./scanner",
  );

const {
  hashFile,
} =
  require(
    "./hash",
  );

const {
  classifyIndexChanges,
} =
  require(
    "./diff",
  );

const {
  readProjectIndex,
  writeProjectIndex,
} =
  require(
    "./storage",
  );


function nowIso() {
  return new Date()
    .toISOString();
}


function createIndexRecord(
  file,
  contentHash,
) {
  return {
    relativePath:
      file.relativePath,

    size:
      file.size,

    modifiedTimeMs:
      file.modifiedTimeMs,

    contentHash,

    indexedAt:
      nowIso(),

    stale:
      false,
  };
}


async function indexProject(
  params = {},
) {
  const projectRoot =
    params.projectRoot;


  const cancellationToken =
    params.cancellationToken;


  const onProgress =
    typeof params.onProgress ===
      "function"
      ? params.onProgress
      : () => {};


  cancellationToken
    ?.throwIfCancelled();


  const previousIndex =
    await readProjectIndex(
      projectRoot,
    );


  cancellationToken
    ?.throwIfCancelled();


  const scannedFiles =
    await scanProjectFiles({
      projectRoot,

      ignore:
        params.ignore,
    });


  cancellationToken
    ?.throwIfCancelled();


  const changes =
    classifyIndexChanges(
      previousIndex,
      scannedFiles,
    );


  const files = {
    ...previousIndex.files,
  };


  for (
    const removedPath
    of changes.removed
  ) {
    delete files[
      removedPath
    ];
  }


  const requiresHash =
    [
      ...changes.added,
      ...changes.changed,
    ];


  let completed =
    0;


  const total =
    requiresHash.length;


  for (
    const file
    of requiresHash
  ) {
    cancellationToken
      ?.throwIfCancelled();


    onProgress({
      phase:
        "hashing",

      completed,

      total,

      relativePath:
        file.relativePath,
    });


    const contentHash =
      await hashFile(
        file.absolutePath,
      );


    cancellationToken
      ?.throwIfCancelled();


    files[
      file.relativePath
    ] =
      createIndexRecord(
        file,
        contentHash,
      );


    completed +=
      1;


    onProgress({
      phase:
        "hashing",

      completed,

      total,

      relativePath:
        file.relativePath,
    });
  }


  for (
    const file
    of changes.unchanged
  ) {
    const previous =
      files[
        file.relativePath
      ];


    if (
      previous
    ) {
      files[
        file.relativePath
      ] = {
        ...previous,

        stale:
          false,
      };
    }
  }


  cancellationToken
    ?.throwIfCancelled();


  const nextIndex = {
    schemaVersion:
      1,

    generatedAt:
      nowIso(),

    files,
  };


  await writeProjectIndex(
    projectRoot,
    nextIndex,
  );


  onProgress({
    phase:
      "complete",

    completed:
      scannedFiles.length,

    total:
      scannedFiles.length,

    relativePath:
      null,
  });


  return {
    index:
      nextIndex,

    summary: {
      scanned:
        scannedFiles.length,

      added:
        changes.added.length,

      changed:
        changes.changed.length,

      unchanged:
        changes.unchanged.length,

      removed:
        changes.removed.length,

      hashed:
        requiresHash.length,
    },
  };
}


module.exports = {
  createIndexRecord,
  indexProject,
};
