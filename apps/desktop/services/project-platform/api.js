const {
  getProjectMetadata,
  listProjectRecents,
} = require("./projects");

const {
  buildProjectTree,
} = require("./tree");

function createProjectApiAdapter() {
  return {
    async getMetadata(
      projectRoot,
    ) {
      return getProjectMetadata({
        projectRoot,
      });
    },

    async listRecents() {
      return listProjectRecents();
    },

    async getTree(
      projectRoot,
      options = {},
    ) {
      return buildProjectTree({
        projectRoot,

        ignore:
          Array.isArray(
            options.ignore,
          )
            ? options.ignore
            : [],
      });
    },
  };
}

module.exports = {
  createProjectApiAdapter,
};
