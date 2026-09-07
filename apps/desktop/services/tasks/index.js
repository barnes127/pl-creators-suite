const {
  TaskManager,
  TaskHandlerNotFoundError,
  normalizeProgress,
} = require("./manager");

const {
  runProjectIndexTask,
} = require("./indexing");

const {
  desktopFormatRuntime,
} = require("../formats");

const {
  createFormatTaskHandlers,
} = require("./formats");

function createDesktopTaskManager(options = {}) {
  const manager = new TaskManager({
    onTaskChanged:
      options.onTaskChanged,
  });

  manager.registerHandler(
    "project.index",
    runProjectIndexTask,
  );

  const formatHandlers =
    createFormatTaskHandlers(
      desktopFormatRuntime,
    );

  manager.registerHandler(
    "format.preview",
    formatHandlers.preview,
  );

  manager.registerHandler(
    "format.import",
    formatHandlers.import,
  );

  manager.registerHandler(
    "format.export",
    formatHandlers.export,
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
