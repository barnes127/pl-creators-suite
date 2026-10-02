const os = require("os");
const path = require("path");
const {DiagnosticsService, getProcessResourceSnapshot} = require("./diagnostics");
const {
  HealthService,
  createDiagnosticsHealthCollector,
  createSystemHealthCollector,
  createPluginHealthCollector,
  createLocalAiHealthCollector,
  createRecoveryHealthCollector,
  createIndexHealthCollector,
  createSyncHealthCollector,
  createEngineHealthCollector,
} = require("./health");
const {createTaskDiagnosticsBridge} = require("./diagnostics/tasks");
const {createRpcDiagnosticsSink} = require("./diagnostics/rpc");
const {createDesktopTaskManager} = require("./tasks");
const localAi = require("./ai/local");
const recovery = require("./project-platform/recovery");
const indexing = require("./project-platform/indexing");
function createDesktopRuntime(options = {}) {
  const diagnosticsRoot =
    options.diagnosticsRoot ||
    path.join(
      os.homedir(),
      ".plcs",
      "diagnostics",
    );
  const diagnostics =
    new DiagnosticsService({
      rootDir: diagnosticsRoot,
      maxRecords: options.maxDiagnosticRecords ?? 1000,
    });
  const pluginRegistry =
    options.pluginRegistry || {
      async listPlugins() {
        const plugins =
          require(
            "./plugins/registry",
          );
        return plugins
          .listPlugins();
      },
    };
  const health = new HealthService();
  health.registerCollector(
    createDiagnosticsHealthCollector(diagnostics),
  );
  const taskBridge = createTaskDiagnosticsBridge(diagnostics);
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
  health.registerCollector(
    createPluginHealthCollector(
      pluginRegistry,
    ),
  );
  health.registerCollector(
    createLocalAiHealthCollector(
      localAi,
    ),
  );
  health.registerCollector(
    createRecoveryHealthCollector(
      recovery,
    ),
  );
  health.registerCollector(
    createIndexHealthCollector(
      indexing,
    ),
  );
  health.registerCollector(
    createSyncHealthCollector(),
  );
  health.registerCollector(
    createEngineHealthCollector(),
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
