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
