function createTaskApiAdapter(
  taskManager,
) {
  if (!taskManager) {
    throw new Error(
      "taskManager is required",
    );
  }

  return {
    async start(
      definition,
    ) {
      return taskManager.start(
        definition,
      );
    },

    async cancel(
      taskId,
    ) {
      return taskManager.cancel(
        taskId,
      );
    },

    async get(
      taskId,
    ) {
      return taskManager.get(
        taskId,
      );
    },

    async list() {
      return taskManager.list();
    },
  };
}

module.exports = {
  createTaskApiAdapter,
};
