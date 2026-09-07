function createTaskDiagnosticsBridge(
  diagnostics,
) {
  if (!diagnostics) {
    return {
      onTaskChanged() {},
    };
  }

  let writeChain =
    Promise.resolve();

  return {
    onTaskChanged(task) {
      writeChain =
        writeChain
          .then(() =>
            diagnostics.job(task),
          )
          .catch((error) => {
            console.error(
              "Failed to persist task diagnostics",
              error,
            );
          });
    },
  };
}

module.exports = {
  createTaskDiagnosticsBridge,
};
