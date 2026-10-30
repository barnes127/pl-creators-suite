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

const {
  createTaskApiAdapter,
} = require("./api");

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

module.exports = {
  TaskManager,
  TaskHandlerNotFoundError,
  normalizeProgress,
  createDesktopTaskManager,
  createTaskApiAdapter,
};

Object.defineProperty(module.exports, "desktopTaskManager", {
  enumerable: true,
  get() {
    return require("../runtime").desktopRuntime.taskManager;
  },
});
