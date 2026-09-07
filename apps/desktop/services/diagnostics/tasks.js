function createTaskDiagnosticsBridge(
  diagnostics,
) {
  if (!diagnostics) {
    return {
      onTaskChanged() {},
    };
  }

  return {
    onTaskChanged(task) {
      diagnostics
        .job(task)
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
