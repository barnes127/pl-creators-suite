const {
  TaskManager,
  TaskHandlerNotFoundError,
  normalizeProgress,
} = require("./manager");

const {
  runProjectIndexTask,
} = require("./indexing");

function createDesktopTaskManager() {
  const manager = new TaskManager();

  manager.registerHandler(
    "project.index",
    runProjectIndexTask,
  );

  return manager;
}

const desktopTaskManager =
  createDesktopTaskManager();

module.exports = {
  TaskManager,
  TaskHandlerNotFoundError,
  normalizeProgress,
  createDesktopTaskManager,
  desktopTaskManager,
};
