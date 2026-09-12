const {
  listWorkflows,
  createWorkflow,
  readWorkflow,
  saveWorkflow,
  deleteWorkflow,
} = require("./index");

function createWorkflowApiAdapter() {
  return {
    async list(
      projectRoot,
    ) {
      const result =
        await listWorkflows({
          projectRoot,
        });

      return result.workflows;
    },

    async create(
      projectRoot,
      name,
    ) {
      return createWorkflow({
        projectRoot,
        name,
      });
    },

    async read(
      projectRoot,
      name,
    ) {
      return readWorkflow({
        projectRoot,
        name,
      });
    },

    async save(
      projectRoot,
      name,
      workflow,
    ) {
      return saveWorkflow({
        projectRoot,
        name,
        workflow,
      });
    },

    async delete(
      projectRoot,
      name,
    ) {
      return deleteWorkflow({
        projectRoot,
        name,
      });
    },
  };
}

module.exports = {
  createWorkflowApiAdapter,
};
