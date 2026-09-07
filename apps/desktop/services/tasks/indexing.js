const {
  createIndexCancellationToken,
} = require(
  "../project-platform/indexing/cancellation",
);

const {
  indexProject,
} = require(
  "../project-platform/indexing/indexer",
);

async function runProjectIndexTask(
  input = {},
  context,
) {
  const cancellationToken =
    createIndexCancellationToken();

  const abortIndexing = () => {
    cancellationToken.cancel();
  };

  if (context.signal.aborted) {
    cancellationToken.cancel();
  } else {
    context.signal.addEventListener(
      "abort",
      abortIndexing,
      { once: true },
    );
  }

  try {
    return await indexProject({
      projectRoot: input.projectRoot,
      ignore: input.ignore,
      cancellationToken,

      onProgress(progress) {
        context.reportProgress({
          phase: progress.phase,
          completed: progress.completed,
          total: progress.total,
          currentItem:
            progress.relativePath ?? null,
          message:
            progress.relativePath
              ? `Indexing ${progress.relativePath}`
              : progress.phase === "complete"
                ? "Indexing complete"
                : "Indexing project",
        });
      },
    });
  } finally {
    context.signal.removeEventListener(
      "abort",
      abortIndexing,
    );
  }
}

module.exports = {
  runProjectIndexTask,
};
