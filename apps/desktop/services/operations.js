function createOperationalMethods(
  runtime,
) {
  const {
    taskManager,
    diagnostics,
    captureResources,
  } = runtime;

  return {
    startTask(params = {}) {
      const definition =
        params.definition;

      if (
        !definition ||
        typeof definition !== "object" ||
        Array.isArray(definition)
      ) {
        throw new Error(
          "Task definition is required",
        );
      }

      const submitted =
        taskManager.submit(
          definition,
        );

      return {
        taskId:
          submitted.taskId,

        task:
          submitted.task,
      };
    },

    getTask(params = {}) {
      return {
        task:
          taskManager.get(
            params.taskId,
          ) ?? null,
      };
    },

    listTasks() {
      return {
        tasks:
          taskManager.list(),
      };
    },

    cancelTask(params = {}) {
      return {
        task:
          taskManager.cancel(
            params.taskId,
          ) ?? null,
      };
    },

    async queryDiagnostics(
      params = {},
    ) {
      return {
        records:
          await diagnostics.query(
            params.collection,
            params.filter || {},
          ),
      };
    },

    async diagnosticsHealth() {
      return {
        health:
          await diagnostics.health(),
      };
    },

    async captureResource(
      params = {},
    ) {
      return {
        resource:
          await captureResources(
            params.subsystem ||
            "desktop",
          ),
      };
    },
  };
}

module.exports = {
  createOperationalMethods,
};
