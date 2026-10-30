const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");

const {
  createDesktopRuntime,
} = require(
  "../apps/desktop/services/runtime",
);

const {
  createOperationalMethods,
} = require(
  "../apps/desktop/services/operations",
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
    "\nPL Creators Suite — Desktop Operational RPC Test\n",
  );

  const rootDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-operational-rpc-",
      ),
    );

  try {
    const runtime =
      createDesktopRuntime({
        diagnosticsRoot:
          rootDir,
        pluginRegistry: {
          async listPlugins() {
            return [];
          }
        }
      });

    const operations =
      createOperationalMethods(
        runtime,
      );

    runtime.taskManager
      .registerHandler(
        "test.operation",
        async (input, context) => {
          context.reportProgress({
            phase: "working",
            completed: 1,
            total: 1,
          });

          return {
            value:
              input.value * 2,
          };
        },
      );

    await check(
      "task can be started through operational service",
      async () => {
        const started =
          operations.startTask({
            definition: {
              handlerId:
                "test.operation",

              kind:
                "calculation",

              title:
                "Operation fixture",

              input: {
                value: 4,
              },
            },
          });

        assert.ok(
          started.taskId,
        );

        await runtime
          .taskManager
          .wait(
            started.taskId,
          );

        const result =
          operations.getTask({
            taskId:
              started.taskId,
          });

        assert.equal(
          result.task.status,
          "completed",
        );

        assert.equal(
          result.task.result.value,
          8,
        );
      },
    );

    await check(
      "task list exposes operational history",
      async () => {
        const result =
          operations.listTasks();

        assert.ok(
          result.tasks.length >= 1,
        );
      },
    );

    await check(
      "diagnostics health is available",
      async () => {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              25,
            ),
        );

        const result =
          await operations
            .diagnosticsHealth();

        assert.ok(
          result.health.jobCount >= 1,
        );
      },
    );

    await check(
      "unified health snapshot is available",
      async () => {
        const result =
          await operations
            .healthSnapshot();
        assert.ok(
          result.health,
        );
        assert.ok(
          result.health
            .summary
            .collectorCount >=
            2,
        );
        assert.ok(
          result.health.sources
            .some(
              (source) =>
                source.id ===
                "diagnostics",
            ),
        );
        assert.ok(
          result.health.sources
            .some(
               (source) =>
                 source.id ===
                 "system",
             ),
        );
      },
    );

    await check(
      "diagnostics query returns persisted task history",
      async () => {
        const result =
          await operations
            .queryDiagnostics({
              collection: "jobs",
              filter: {},
            });

        assert.ok(
          result.records.length >= 1,
        );
      },
    );

    await check(
      "resource capture persists a diagnostic record",
      async () => {
        const result =
          await operations
            .captureResource({
              subsystem:
                "operational-test",
            });

        assert.ok(
          result
            .resource
            .memoryBytes >
            0,
        );

        const queried =
          await operations
            .queryDiagnostics({
              collection:
                "resources",

              filter: {
                subsystem:
                  "operational-test",
              },
            });

        assert.equal(
          queried.records.length,
          1,
        );
      },
    );

    await check(
      "startup marks unfinished jobs interrupted",
      async () => {
        await runtime
          .diagnostics
          .job({
            id:
              "startup-interrupted",

            handlerId:
              "fixture",

            kind:
              "other",

            title:
              "Interrupted fixture",

            status:
              "running",
          });

        const result =
          await runtime
            .initialize();

        assert.ok(
          result
            .interruptedJobs
            .some(
              (job) =>
                job.id ===
                "startup-interrupted",
            ),
        );
      },
    );

    await check("overview merges live and read-only history with live precedence", async () => {
      const liveId = "overview-live-collision";
      const started = runtime.taskManager.submit({
        id: liveId,
        handlerId: "test.operation",
        kind: "calculation",
        title: "Live fixture",
        input: {value: 5, credential: "secret-input"},
        metadata: {path: "/secret/project"},
      });
      await started.promise;
      await runtime.diagnostics.job({
        id: liveId, kind: "other", title: "Stale history", status: "failed",
        failure: {code: "OLD", message: "secret-error"},
      });
      await runtime.diagnostics.job({
        id: "history-only", kind: "indexing", title: "Historical fixture",
        status: "completed", progress: {percent: 75, message: "secret-progress",
          currentItem: "/secret/item"},
        warnings: [{code: "SECRET", message: "secret-warning"}],
        metadata: {credential: "secret-metadata"},
        failure: {code: "SAFE_CODE", message: "secret-failure"},
      });
      const overview = await runtime.listUnifiedTaskStates();
      assert.equal(overview.historyAvailable, true);
      const live = overview.tasks.find((task) => task.id === liveId);
      assert.equal(live.source, "live");
      assert.equal(live.status, "completed");
      const historical = overview.tasks.find((task) => task.id === "history-only");
      assert.deepEqual(historical, {
        id: "history-only", kind: "indexing", title: "Historical fixture",
        status: "completed", source: "history", progressPercent: 75,
        failureCode: "SAFE_CODE", warningCount: 1,
      });
      assert.equal(runtime.taskManager.get("history-only"), null);
      assert.equal(operations.cancelTask({taskId: "history-only"}).task, null);
      assert.ok(!JSON.stringify(overview).includes("secret-"));
      assert.ok(!JSON.stringify(overview).includes("/secret/"));
    });

    await check("overview includes interrupted history and skips invalid records", async () => {
      await runtime.diagnostics.job({
        id: "overview-interrupted", kind: "other", title: "Interrupted",
        status: "interrupted", failure: {code: "TASK_INTERRUPTED", message: "private"},
      });
      await runtime.diagnostics.append("jobs", {
        id: "unknown-status", status: "retrying", title: "Invalid",
      });
      await runtime.diagnostics.append("jobs", {
        id: "bad-progress", status: "failed", title: "Bad percent",
        progress: {percent: Infinity},
      });
      await runtime.diagnostics.append("jobs", {status: "completed"});
      const overview = await runtime.listUnifiedTaskStates();
      assert.equal(overview.tasks.find((task) => task.id === "overview-interrupted")
        .failureCode, "TASK_INTERRUPTED");
      assert.ok(!overview.tasks.some((task) => task.id === "unknown-status"));
      assert.ok(!overview.tasks.find((task) => task.id === "bad-progress")
        .hasOwnProperty("progressPercent"));
      assert.ok(!overview.tasks.some((task) => !task.id));
    });

    await check("overview reports empty history as available", async () => {
      const emptyRuntime = createDesktopRuntime({
        diagnosticsRoot: path.join(rootDir, "empty"),
      });
      assert.deepEqual(await emptyRuntime.listUnifiedTaskStates(), {
        tasks: [], historyAvailable: true,
      });
    });

    await check("overview retains live tasks when history read fails", async () => {
      const original = runtime.diagnostics.getLatestJobs;
      runtime.diagnostics.getLatestJobs = async () => {
        throw new Error("secret-diagnostics-path");
      };
      try {
        const overview = await runtime.listUnifiedTaskStates();
        assert.equal(overview.historyAvailable, false);
        assert.ok(overview.tasks.some((task) => task.id === "overview-live-collision"));
        assert.ok(overview.tasks.every((task) => task.source === "live"));
        assert.ok(!JSON.stringify(overview).includes("secret-diagnostics-path"));
      } finally {
        runtime.diagnostics.getLatestJobs = original;
      }
    });
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
    `\nDesktop operational RPC test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
