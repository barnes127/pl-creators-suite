const assert = require("assert");

const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const {
  TaskManager,
  createDesktopTaskManager,
} = require(
  "../apps/desktop/services/tasks",
);

let passed = 0;
let failed = 0;

async function check(message, operation) {
  try {
    await operation();

    passed += 1;
    console.log(`PASS    ${message}`);
  } catch (error) {
    failed += 1;

    console.error(`FAIL    ${message}`);
    console.error(error);
  }
}

async function main() {
  console.log(
    "\nPL Creators Suite — Desktop Task Service Test\n",
  );

  await check(
    "registered handler executes and completes task",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.success",
        async (input, context) => {
          context.reportProgress({
            phase: "working",
            completed: 1,
            total: 1,
          });

          return {
            value: input.value * 2,
          };
        },
      );

      const submitted = manager.submit({
        handlerId: "test.success",
        kind: "calculation",
        title: "Success task",
        input: {
          value: 4,
        },
      });

      await submitted.promise;

      const task =
        manager.get(submitted.taskId);

      assert.equal(
        task.status,
        "completed",
      );

      assert.equal(
        task.result.value,
        8,
      );

      assert.equal(
        task.progress.percent,
        100,
      );
    },
  );

  await check(
    "task warnings are accumulated",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.warning",
        async (_input, context) => {
          context.reportWarning({
            code: "TEST_WARNING",
            message: "Warning recorded",
          });

          return true;
        },
      );

      const submitted = manager.submit({
        handlerId: "test.warning",
        kind: "other",
        title: "Warning task",
        input: null,
      });

      await submitted.promise;

      const task =
        manager.get(submitted.taskId);

      assert.equal(
        task.warnings.length,
        1,
      );

      assert.equal(
        task.warnings[0].code,
        "TEST_WARNING",
      );
    },
  );

  await check(
    "task resource usage is recorded",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.resources",
        async (_input, context) => {
          context.reportResourceUsage({
            memoryBytes: 1024,
            elapsedMs: 25,
          });

          return true;
        },
      );

      const submitted = manager.submit({
        handlerId: "test.resources",
        kind: "other",
        title: "Resource task",
        input: null,
      });

      await submitted.promise;

      const task =
        manager.get(submitted.taskId);

      assert.equal(
        task.resourceUsage.memoryBytes,
        1024,
      );

      assert.equal(
        task.resourceUsage.elapsedMs,
        25,
      );
    },
  );

  await check(
    "handler failure creates structured task failure",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.failure",
        async () => {
          const error =
            new Error("Expected failure");

          error.code =
            "EXPECTED_FAILURE";

          throw error;
        },
      );

      const submitted = manager.submit({
        handlerId: "test.failure",
        kind: "other",
        title: "Failure task",
        input: null,
      });

      await assert.rejects(
        () => submitted.promise,
        /Expected failure/,
      );

      const task =
        manager.get(submitted.taskId);

      assert.equal(
        task.status,
        "failed",
      );

      assert.equal(
        task.failure.code,
        "EXPECTED_FAILURE",
      );
    },
  );

  await check(
    "running task can be cancelled",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.cancel",
        async (_input, context) => {
          await new Promise(
            (resolve, reject) => {
              const timer = setTimeout(
                resolve,
                1000,
              );

              context.signal.addEventListener(
                "abort",
                () => {
                  clearTimeout(timer);

                  const error =
                    new Error(
                      "Operation cancelled",
                    );

                  error.name = "AbortError";
                  reject(error);
                },
                { once: true },
              );
            },
          );

          return true;
        },
      );

      const submitted = manager.submit({
        handlerId: "test.cancel",
        kind: "other",
        title: "Cancellation task",
        input: null,
        supportsCancellation: true,
      });

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 20),
      );

      manager.cancel(
        submitted.taskId,
      );

      await submitted.promise;

      const task =
        manager.get(submitted.taskId);

      assert.equal(
        task.status,
        "cancelled",
      );
    },
  );

  await check(
    "unknown task handler is rejected",
    async () => {
      const manager = new TaskManager();

      assert.throws(
        () =>
          manager.submit({
            handlerId: "missing.handler",
            kind: "other",
            title: "Missing handler",
            input: null,
          }),
        /No task handler registered/,
      );
    },
  );

  await check(
    "desktop task manager indexes a real project",
    async () => {
      const tempRoot =
        await fs.mkdtemp(
          path.join(
            os.tmpdir(),
            "pl-task-index-",
          ),
        );

      try {
        const projectRoot =
          path.join(
            tempRoot,
            "FixtureProject",
          );

        await fs.mkdir(
          projectRoot,
          {
            recursive: true,
          },
        );

        await fs.writeFile(
          path.join(
            projectRoot,
            "alpha.txt",
          ),
          "alpha",
          "utf8",
        );

        const manager =
          createDesktopTaskManager();

        const submitted =
          manager.submit({
            handlerId:
              "project.index",

            kind:
              "indexing",

            title:
              "Index fixture",

            input: {
              projectRoot,
            },

            supportsCancellation:
              true,
          });

        await submitted.promise;

        const task =
          manager.get(
            submitted.taskId,
          );

        assert.equal(
          task.status,
          "completed",
        );

        assert.equal(
          task.result.summary.scanned,
          1,
        );

        assert.equal(
          task.result.summary.hashed,
          1,
        );
      } finally {
        await fs.rm(
          tempRoot,
          {
            recursive: true,
            force: true,
          },
        );
      }
    },
  );

  console.log(
    `\nDesktop task service test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
