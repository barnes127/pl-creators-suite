function classifyIndexChanges(
  previousIndex,
  scannedFiles,
) {
  const previousFiles =
    previousIndex?.files ??
    {};


  const currentByPath =
    new Map(
      scannedFiles.map(
        (
          file,
        ) => [
          file.relativePath,
          file,
        ],
      ),
    );


  const added =
    [];

  const changed =
    [];

  const unchanged =
    [];

  const removed =
    [];


  for (
    const file
    of scannedFiles
  ) {
    const previous =
      previousFiles[
        file.relativePath
      ];


    if (
      !previous
    ) {
      added.push(
        file,
      );

      continue;
    }


    const metadataChanged =
      previous.size !==
        file.size ||
      previous.modifiedTimeMs !==
        file.modifiedTimeMs;


    if (
      metadataChanged
    ) {
      changed.push(
        file,
      );
    } else {
      unchanged.push(
        file,
      );
    }
  }


  for (
    const previousPath
    of Object.keys(
      previousFiles,
    )
  ) {
    if (
      !currentByPath.has(
        previousPath,
      )
    ) {
      removed.push(
        previousPath,
      );
    }
  }


  return {
    added,
    changed,
    unchanged,
    removed,
  };
}


module.exports = {
  classifyIndexChanges,
};
