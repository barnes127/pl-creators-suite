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
      options ={},
    ) {
      return saveWorkflow({
        projectRoot,
        name,
        workflow,
        overwrite:
          options.overwrite ===
          true,
      });
    },

    async delete(
      projectRoot,
      name,
      options = {},
    ) {
      return deleteWorkflow({
        projectRoot,
        name,
        destructive:
          options.destructive ===
          true,
      });
    },
  };
}

module.exports = {
  createWorkflowApiAdapter,
};
