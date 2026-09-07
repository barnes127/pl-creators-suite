const assert = require("assert");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const {
  DiagnosticsService,
  getProcessResourceSnapshot,
} = require(
  "../apps/desktop/services/diagnostics",
);

const {
  createTaskDiagnosticsBridge,
} = require(
  "../apps/desktop/services/diagnostics/tasks",
);

const {
  createDesktopTaskManager,
} = require(
  "../apps/desktop/services/tasks",
);

const {
  createRpcLogger,
} = require(
  "../apps/desktop/rpc/logging",
);

const {
  createRpcDiagnosticsSink,
} = require(
  "../apps/desktop/services/diagnostics/rpc",
);

let passed = 0;
let failed = 0;

async function check(
  message,
  operation,
) {
  try {
    await operation();

    passed += 1;
    console.log(
      `PASS    ${message}`,
    );
  } catch (error) {
    failed += 1;

    console.error(
      `FAIL    ${message}`,
    );

    console.error(error);
  }
}

async function main() {
  console.log(
    "\nPL Creators Suite — Desktop Diagnostics Service Test\n",
  );

  const rootDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-diagnostics-",
      ),
    );

  try {
    const diagnostics =
      new DiagnosticsService({
        rootDir,
        maxRecords: 3,
      });

    await check(
      "structured logs persist and query",
      async () => {
        await diagnostics.log({
          level: "info",
          subsystem: "test",
          event: "fixture",
          message: "Fixture log",
          correlationId: "corr-1",
        });

        const logs =
          await diagnostics.query(
            "logs",
            {
              subsystem: "test",
            },
          );

        assert.equal(
          logs.length,
          1,
        );

        assert.equal(
          logs[0].message,
          "Fixture log",
        );
      },
    );

    await check(
      "problem records persist",
      async () => {
        await diagnostics.problem({
          severity: "error",
          code: "TEST_PROBLEM",
          message: "Fixture problem",
          subsystem: "test",
        });

        const problems =
          await diagnostics.query(
            "problems",
          );

        assert.equal(
          problems[0].code,
          "TEST_PROBLEM",
        );
      },
    );

    await check(
      "crash records persist structured error data",
      async () => {
        await diagnostics.crash({
          subsystem: "renderer",
          name: "FixtureCrash",
          message: "Expected crash",
          stack: "fixture-stack",
          fatal: false,
        });

        const crashes =
          await diagnostics.query(
            "crashes",
          );

        assert.equal(
          crashes[0].name,
          "FixtureCrash",
        );

        assert.equal(
          crashes[0].stack,
          "fixture-stack",
        );
      },
    );

    await check(
      "process resource snapshot can be persisted",
      async () => {
        const snapshot =
          getProcessResourceSnapshot({
            subsystem: "test",
          });

        await diagnostics.resource(
          snapshot,
        );

        const resources =
          await diagnostics.query(
            "resources",
          );

        assert.ok(
          resources[0].memoryBytes >
            0,
        );

        assert.ok(
          resources[0]
            .details
            .uptimeSeconds >=
            0,
        );
      },
    );

    await check(
      "task lifecycle feeds job history",
      async () => {
        const bridge =
          createTaskDiagnosticsBridge(
            diagnostics,
          );

        const manager =
          createDesktopTaskManager({
            onTaskChanged:
              bridge.onTaskChanged,
          });

        manager.registerHandler(
          "test.diagnostic",
          async (_input, context) => {
            context.reportProgress({
              phase: "working",
              completed: 1,
              total: 1,
            });

            return {
              ok: true,
            };
          },
        );

        const submitted =
          manager.submit({
            handlerId:
              "test.diagnostic",

            kind:
              "calculation",

            title:
              "Diagnostic task",

            input: null,
          });

        await submitted.promise;

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              25,
            ),
        );

        const jobs =
          await diagnostics
            .getLatestJobs();

        const task =
          jobs.find(
            (job) =>
              job.id ===
              submitted.taskId,
          );

        assert.ok(task);

        assert.equal(
          task.status,
          "completed",
        );

        assert.equal(
          task.progress.percent,
          100,
        );
      },
    );

    await check(
      "unfinished persisted jobs become interrupted",
      async () => {
        await diagnostics.job({
          id: "interrupted-fixture",
          handlerId:
            "test.interrupted",
          kind: "other",
          title:
            "Interrupted fixture",
          status: "running",
          progress: {
            phase: "working",
          },
          warnings: [],
          createdAt:
            new Date()
              .toISOString(),
        });

        const interrupted =
          await diagnostics
            .markInterruptedJobs();

        assert.ok(
          interrupted.some(
            (job) =>
              job.id ===
              "interrupted-fixture",
          ),
        );

        const jobs =
          await diagnostics
            .getLatestJobs();

        const task =
          jobs.find(
            (job) =>
              job.id ===
              "interrupted-fixture",
          );

        assert.equal(
          task.status,
          "interrupted",
        );

        assert.equal(
          task.failure.code,
          "TASK_INTERRUPTED",
        );
      },
    );

    await check(
      "RPC logger can feed shared diagnostics",
      async () => {
        const rpcBridge =
          createRpcDiagnosticsSink(
            diagnostics,
          );

        const logger =
          createRpcLogger({
            sink: {
              log() {},
              warn() {},
              error() {},
            },

            onEntry:
              rpcBridge.persist,
          });

        logger.failure({
          correlationId:
            "rpc-corr",

          requestId:
            "rpc-request",

          method:
            "fixture.method",

          error: {
            type:
              "FixtureError",

            code:
              "FIXTURE_FAILURE",

            retryable:
              false,
          },
        });

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              25,
            ),
        );

        const logs =
          await diagnostics.query(
            "logs",
            {
              correlationId:
                "rpc-corr",
            },
          );

        const problems =
          await diagnostics.query(
            "problems",
            {
              correlationId:
                "rpc-corr",
            },
          );

        assert.equal(
          logs.length,
          1,
        );

        assert.equal(
          problems[0].code,
          "FIXTURE_FAILURE",
        );
      },
    );

    await check(
      "retention prunes oldest records",
      async () => {
        for (
          let index = 0;
          index < 5;
          index += 1
        ) {
          await diagnostics.log({
            level: "info",
            subsystem:
              "retention",
            event:
              `event-${index}`,
          });
        }

        const result =
          await diagnostics.prune(
            "logs",
          );

        assert.ok(
          result.removed > 0,
        );

        const logs =
          await diagnostics.query(
            "logs",
          );

        assert.equal(
          logs.length,
          3,
        );
      },
    );

    await check(
      "corrupt diagnostics lines fail visibly",
      async () => {
        const logsPath =
          path.join(
            rootDir,
            "logs.jsonl",
          );

        await fs.writeFile(
          logsPath,
          "{not valid json}\n",
          "utf8",
        );

        await assert.rejects(
          () =>
            diagnostics.query(
              "logs",
            ),
          (error) =>
            error.code ===
            "CORRUPT_DIAGNOSTICS_RECORD",
        );
      },
    );
  } finally {
    await fs.rm(
      rootDir,
      {
        recursive: true,
        force: true,
      },
    );
  }

  console.log(
    `\nDesktop diagnostics service test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
