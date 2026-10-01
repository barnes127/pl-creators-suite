const os = require("os");
const path = require("path");
const {DiagnosticsService, getProcessResourceSnapshot} = require("./diagnostics");
const {HealthService, createDiagnosticsHealthCollector, createSystemHealthCollector} = require("./health");
const {createTaskDiagnosticsBridge} = require("./diagnostics/tasks");
const {createRpcDiagnosticsSink} = require("./diagnostics/rpc");
const {createDesktopTaskManager} = require("./tasks");

function createDesktopRuntime(
  options = {},
) {
  const diagnosticsRoot =
    options.diagnosticsRoot ||
    path.join(
      os.homedir(),
      ".plcs",
      "diagnostics",
    );

  const diagnostics =
    new DiagnosticsService({
      rootDir:
        diagnosticsRoot,

      maxRecords:
        options.maxDiagnosticRecords ??
        1000,
    });

  const health =
    new HealthService();
  health.registerCollector(
    createDiagnosticsHealthCollector(
      diagnostics,
    ),
  );

  const taskBridge =
    createTaskDiagnosticsBridge(
      diagnostics,
    );

  const taskManager =
    createDesktopTaskManager({
      onTaskChanged:
        taskBridge.onTaskChanged,
    });

  health.registerCollector(
    createSystemHealthCollector({
      taskManager,
    }),
  );

  const rpcBridge =
    createRpcDiagnosticsSink(
      diagnostics,
    );

  async function initialize() {
    const interrupted =
      await diagnostics
        .markInterruptedJobs();

    await diagnostics.log({
      level: "info",
      subsystem: "desktop",
      event: "runtime.initialize",
      message:
        "Desktop runtime initialized",

      details: {
        interruptedJobs:
          interrupted.length,
      },
    });

    return {
      interruptedJobs:
        interrupted,
    };
  }

  async function captureResources(
    subsystem = "desktop",
  ) {
    const snapshot =
      getProcessResourceSnapshot({
        subsystem,
      });

    return diagnostics.resource(
      snapshot,
    );
  }

  return {
    diagnostics,
    health,
    taskManager,
    rpcBridge,
    initialize,
    captureResources,
  };
}

const desktopRuntime =
  createDesktopRuntime();

module.exports = {
  createDesktopRuntime,
  desktopRuntime,
};
