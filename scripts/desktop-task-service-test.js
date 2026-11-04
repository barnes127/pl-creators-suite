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

const {
  ProjectIndexJobManager,
} = require(
  "../apps/desktop/services/project-platform/indexing/jobs",
);

const {
  createDesktopRuntime,
} = require(
  "../apps/desktop/services/runtime",
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

function gate() {
  let release;

  const promise = new Promise((resolve) => {
    release = resolve;
  });

  return {
    promise,
    release,
  };
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
    "queue respects maxConcurrentTasks = 1",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const blocker = gate();
      const started = [];

      manager.registerHandler(
        "test.block",
        async (input) => {
          started.push(input.id);

          if (input.id === "first") {
            await blocker.promise;
          }

          return input.id;
        },
      );

      const first = manager.submit({
        handlerId: "test.block",
        kind: "other",
        title: "First",
        input: { id: "first" },
      });

      const second = manager.submit({
        handlerId: "test.block",
        kind: "other",
        title: "Second",
        input: { id: "second" },
      });

      try {
        await Promise.resolve();

        assert.equal(
          manager.get(first.taskId).status,
          "running",
        );

        assert.equal(
          manager.get(second.taskId).status,
          "queued",
        );

        assert.deepEqual(
          started,
          ["first"],
        );

        blocker.release();

        await Promise.all([
          first.promise,
          second.promise,
        ]);

        assert.deepEqual(
          started,
          ["first", "second"],
        );
      } finally {
        blocker.release();
      }
    },
  );

  await check(
    "queue dispatches priority order with FIFO ties",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const blocker = gate();
      const started = [];

      manager.registerHandler(
        "test.priority",
        async (input) => {
          started.push(input.id);

          if (input.id === "blocker") {
            await blocker.promise;
          }

          return input.id;
        },
      );

      const running = manager.submit({
        handlerId: "test.priority",
        kind: "other",
        title: "Blocker",
        input: { id: "blocker" },
      });

      await Promise.resolve();

      const definitions = [
        ["low", "low"],
        ["high-first", "high"],
        ["high-second", "high"],
        ["critical", "critical"],
        ["normal", "normal"],
      ];

      const queued = definitions.map(
        ([id, priority]) =>
          manager.submit({
            handlerId: "test.priority",
            kind: "other",
            title: id,
            priority,
            input: { id },
          }),
      );

      try {
        assert.deepEqual(
          started,
          ["blocker"],
        );

        blocker.release();

        await Promise.all([
          running.promise,
          ...queued.map(
            (task) => task.promise,
          ),
        ]);

        assert.deepEqual(
          started,
          [
            "blocker",
            "critical",
            "high-first",
            "high-second",
            "normal",
            "low",
          ],
        );

        assert.throws(
          () =>
            manager.submit({
              handlerId: "test.priority",
              kind: "other",
              title: "Invalid priority",
              priority: "urgent",
              input: { id: "invalid" },
            }),
          /Invalid task priority: urgent/,
        );
      } finally {
        blocker.release();
      }
    },
  );

  await check(
    "queue enforces its parallelism cap",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 2,
      });

      const blockers =
        Array.from(
          { length: 5 },
          gate,
        );

      let active = 0;
      let maximumActive = 0;
      const started = [];

      manager.registerHandler(
        "test.parallel",
        async (input) => {
          active += 1;
          maximumActive = Math.max(
            maximumActive,
            active,
          );
          started.push(input.id);

          try {
            await blockers[input.id].promise;
            return input.id;
          } finally {
            active -= 1;
          }
        },
      );

      const tasks = blockers.map(
        (_blocker, id) =>
          manager.submit({
            handlerId: "test.parallel",
            kind: "other",
            title: `Parallel ${id}`,
            input: { id },
          }),
      );

      try {
        await Promise.resolve();

        assert.deepEqual(
          started,
          [0, 1],
        );

        for (const blocker of blockers) {
          blocker.release();
        }

        await Promise.all(
          tasks.map(
            (task) => task.promise,
          ),
        );

        assert.equal(maximumActive, 2);
        assert.equal(started.length, 5);
      } finally {
        for (const blocker of blockers) {
          blocker.release();
        }
      }

      for (
        const value of [
          0,
          -1,
          1.5,
          Number.NaN,
          "2",
        ]
      ) {
        assert.throws(
          () =>
            new TaskManager({
              maxConcurrentTasks: value,
            }),
          /positive safe integer/,
        );
      }
    },
  );

  await check(
    "desktop constructors carry queue configuration",
    async () => {
      const defaultManager =
        createDesktopTaskManager();

      const configuredManager =
        createDesktopTaskManager({
          maxConcurrentTasks: 1,
        });

      assert.equal(
        defaultManager.maxConcurrentTasks,
        2,
      );

      assert.equal(
        configuredManager.maxConcurrentTasks,
        1,
      );

      const tempRoot =
        await fs.mkdtemp(
          path.join(
            os.tmpdir(),
            "pl-task-runtime-",
          ),
        );

      try {
        const runtime =
          createDesktopRuntime({
            diagnosticsRoot:
              path.join(
                tempRoot,
                "diagnostics",
              ),
            maxConcurrentTasks: 1,
          });

        assert.equal(
          runtime.taskManager
            .maxConcurrentTasks,
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

  await check(
    "queued cancellation never invokes its handler",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const blocker = gate();
      const started = [];

      manager.registerHandler(
        "test.queued-cancel",
        async (input) => {
          started.push(input.id);

          if (input.id === "first") {
            await blocker.promise;
          }

          return input.id;
        },
      );

      const first = manager.submit({
        handlerId: "test.queued-cancel",
        kind: "other",
        title: "First",
        input: { id: "first" },
      });

      const second = manager.submit({
        handlerId: "test.queued-cancel",
        kind: "other",
        title: "Second",
        input: { id: "second" },
      });

      try {
        await Promise.resolve();

        const cancelled =
          manager.cancel(second.taskId);

        assert.equal(
          cancelled.status,
          "cancelled",
        );

        assert.equal(
          cancelled.startedAt,
          undefined,
        );

        assert.ok(cancelled.finishedAt);

        assert.equal(
          await second.promise,
          undefined,
        );

        blocker.release();
        await first.promise;

        assert.deepEqual(
          started,
          ["first"],
        );
      } finally {
        blocker.release();
      }
    },
  );

  await check(
    "running cancellation retains its slot until settlement",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const finish = gate();
      const abortObserved = gate();
      const started = [];

      manager.registerHandler(
        "test.running-cancel",
        async (input, context) => {
          started.push(input.id);

          if (input.id === "first") {
            context.signal.addEventListener(
              "abort",
              abortObserved.release,
              { once: true },
            );

            await finish.promise;
          }

          return input.id;
        },
      );

      const first = manager.submit({
        handlerId: "test.running-cancel",
        kind: "other",
        title: "First",
        input: { id: "first" },
      });

      const second = manager.submit({
        handlerId: "test.running-cancel",
        kind: "other",
        title: "Second",
        input: { id: "second" },
      });

      try {
        await Promise.resolve();
        manager.cancel(first.taskId);
        await abortObserved.promise;

        assert.equal(
          manager.get(first.taskId).status,
          "cancelling",
        );

        assert.equal(
          manager.get(second.taskId).status,
          "queued",
        );

        assert.deepEqual(
          started,
          ["first"],
        );

        assert.equal(
          manager.cancel(first.taskId).status,
          "cancelling",
        );

        finish.release();

        assert.equal(
          await first.promise,
          undefined,
        );

        await second.promise;

        assert.equal(
          manager.get(first.taskId).status,
          "cancelled",
        );

        assert.deepEqual(
          started,
          ["first", "second"],
        );
      } finally {
        finish.release();
        abortObserved.release();
      }
    },
  );

  await check(
    "handler failures do not stop later scheduling",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const started = [];

      manager.registerHandler(
        "test.scheduling-failure",
        async (input) => {
          started.push(input.id);

          if (input.fail) {
            const error =
              new Error("Scheduled failure");

            error.code = "SCHEDULED_FAILURE";
            throw error;
          }

          return input.id;
        },
      );

      const failedTask = manager.submit({
        handlerId: "test.scheduling-failure",
        kind: "other",
        title: "Failure",
        input: {
          id: "failure",
          fail: true,
        },
      });

      const successfulTask = manager.submit({
        handlerId: "test.scheduling-failure",
        kind: "other",
        title: "Success",
        input: {
          id: "success",
          fail: false,
        },
      });

      await assert.rejects(
        failedTask.promise,
        /Scheduled failure/,
      );

      assert.equal(
        await successfulTask.promise,
        "success",
      );

      assert.equal(
        manager.get(failedTask.taskId)
          .failure.code,
        "SCHEDULED_FAILURE",
      );

      assert.deepEqual(
        started,
        ["failure", "success"],
      );

      assert.equal(manager.activeCount, 0);
      assert.equal(manager.pending.length, 0);
    },
  );

  await check(
    "reporting observers remain isolated and terminal state is stable",
    async () => {
      const manager = new TaskManager();
      const observed = [];
      let contextReference;
      const originalConsoleError =
        console.error;

      manager.registerHandler(
        "test.reporting",
        async (_input, context) => {
          contextReference = context;

          context.reportProgress({
            phase: "complete",
            completed: 1,
            total: 1,
          });

          context.reportWarning({
            code: "REPORT_WARNING",
            message: "warning",
          });

          context.reportResourceUsage({
            memoryBytes: 2048,
          });

          return true;
        },
      );

      try {
        console.error = () => {};

        const submitted = manager.submit(
          {
            handlerId: "test.reporting",
            kind: "other",
            title: "Reporting",
            input: null,
          },
          {
            onProgress(progress) {
              observed.push([
                "progress",
                progress.percent,
              ]);
              throw new Error(
                "Observer failure",
              );
            },

            onWarning(warning) {
              observed.push([
                "warning",
                warning.code,
              ]);
            },

            onResourceUsage(usage) {
              observed.push([
                "resource",
                usage.memoryBytes,
              ]);
            },
          },
        );

        await submitted.promise;

        const completed =
          manager.get(submitted.taskId);

        assert.equal(
          completed.status,
          "completed",
        );

        assert.deepEqual(
          observed,
          [
            ["progress", 100],
            ["warning", "REPORT_WARNING"],
            ["resource", 2048],
          ],
        );

        contextReference.reportProgress({
          phase: "late",
          percent: 0,
        });

        assert.equal(
          manager.get(submitted.taskId)
            .progress.percent,
          100,
        );
      } finally {
        console.error = originalConsoleError;
      }
    },
  );

  await check(
    "queued handler removal fails task without stalling queue",
    async () => {
      const manager = new TaskManager({
        maxConcurrentTasks: 1,
      });

      const blocker = gate();

      manager.registerHandler(
        "test.removal-blocker",
        async () => {
          await blocker.promise;
          return true;
        },
      );

      manager.registerHandler(
        "test.removed",
        async () => true,
      );

      const first = manager.submit({
        handlerId: "test.removal-blocker",
        kind: "other",
        title: "Blocker",
        input: null,
      });

      const removed = manager.submit({
        handlerId: "test.removed",
        kind: "other",
        title: "Removed",
        input: null,
      });

      try {
        await Promise.resolve();

        assert.equal(
          manager.unregisterHandler(
            "test.removed",
          ),
          true,
        );

        blocker.release();
        await first.promise;

        await assert.rejects(
          removed.promise,
          /No task handler registered/,
        );

        assert.equal(
          manager.get(removed.taskId)
            .failure.code,
          "TASK_HANDLER_NOT_FOUND",
        );

        assert.equal(manager.activeCount, 0);
      } finally {
        blocker.release();
      }
    },
  );

  await check(
    "start failures stay awaitable without unhandled rejection",
    async () => {
      const manager = new TaskManager();
      const unhandled = [];

      const onUnhandled = (reason) => {
        unhandled.push(reason);
      };

      process.on(
        "unhandledRejection",
        onUnhandled,
      );

      manager.registerHandler(
        "test.start-failure",
        async () => {
          throw new Error("Start failure");
        },
      );

      try {
        const started = await manager.start({
          id: "start-failure",
          handlerId: "test.start-failure",
          kind: "other",
          title: "Start failure",
          input: null,
        });

        await assert.rejects(
          manager.wait(started.id),
          /Start failure/,
        );

        await new Promise(
          (resolve) => setImmediate(resolve),
        );

        assert.deepEqual(unhandled, []);
      } finally {
        process.removeListener(
          "unhandledRejection",
          onUnhandled,
        );
      }
    },
  );

  await check(
    "task change observer failures cannot deadlock queue",
    async () => {
      const originalConsoleError =
        console.error;

      const manager = new TaskManager({
        maxConcurrentTasks: 1,
        onTaskChanged() {
          throw new Error(
            "Task observer failure",
          );
        },
      });

      manager.registerHandler(
        "test.observer-isolation",
        async (input) => input,
      );

      try {
        console.error = () => {};

        const first = manager.submit({
          handlerId: "test.observer-isolation",
          kind: "other",
          title: "First",
          input: "first",
        });

        const second = manager.submit({
          handlerId: "test.observer-isolation",
          kind: "other",
          title: "Second",
          input: "second",
        });

        assert.deepEqual(
          await Promise.all([
            first.promise,
            second.promise,
          ]),
          ["first", "second"],
        );

        assert.equal(manager.activeCount, 0);
      } finally {
        console.error = originalConsoleError;
      }
    },
  );

  await check(
    "duplicate IDs and cancellation no-ops remain compatible",
    async () => {
      const manager = new TaskManager();

      manager.registerHandler(
        "test.compatibility",
        async () => true,
      );

      const submitted = manager.submit({
        id: "duplicate-task",
        handlerId: "test.compatibility",
        kind: "other",
        title: "Compatibility",
        input: null,
      });

      assert.throws(
        () =>
          manager.submit({
            id: "duplicate-task",
            handlerId: "test.compatibility",
            kind: "other",
            title: "Duplicate",
            input: null,
          }),
        /Task id already exists/,
      );

      assert.equal(
        manager.cancel("missing-task"),
        null,
      );

      await submitted.promise;

      assert.equal(
        manager.cancel(submitted.taskId)
          .status,
        "completed",
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

        const legacyManager =
          new ProjectIndexJobManager(
            manager,
          );

        const legacy =
          legacyManager.start({
            projectRoot,
          });

        await legacy.promise;

        assert.equal(
          legacyManager.get(
            legacy.jobId,
          ).status,
          "complete",
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
