const assert = require("node:assert");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const {
  TaskManager,
} = require(
  "../apps/desktop/services/tasks/manager",
);

const {
  listUnifiedTaskStates,
} = require(
  "../apps/desktop/services/tasks/overview",
);

const {
  createOperationalMethods,
} = require(
  "../apps/desktop/services/operations",
);

const ROOT = path.resolve(
  __dirname,
  "..",
);

let passed = 0;
let failed = 0;

function read(relativePath) {
  return fs.readFileSync(
    path.join(ROOT, relativePath),
    "utf8",
  );
}

function loadTypeScriptModule(
  relativePath,
) {
  const filename =
    path.join(ROOT, relativePath);

  const output =
    ts.transpileModule(
      fs.readFileSync(
        filename,
        "utf8",
      ),
      {
        compilerOptions: {
          module:
            ts.ModuleKind.CommonJS,
          target:
            ts.ScriptTarget.ES2022,
        },
        fileName:
          filename,
      },
    ).outputText;

  const loaded =
    new Module(
      filename,
      module,
    );

  loaded.filename = filename;
  loaded.paths =
    Module._nodeModulePaths(
      path.dirname(filename),
    );

  loaded._compile(
    output,
    filename,
  );

  return loaded.exports;
}

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

function waitForStatus(
  manager,
  taskId,
  expected,
) {
  return new Promise(
    (resolve, reject) => {
      let attempts = 0;

      const inspect = () => {
        const task =
          manager.get(taskId);

        if (task?.status === expected) {
          resolve(task);
          return;
        }

        attempts += 1;

        if (attempts > 100) {
          reject(
            new Error(
              `Task ${taskId} did not reach ${expected}.`,
            ),
          );
          return;
        }

        setImmediate(inspect);
      };

      inspect();
    },
  );
}

async function main() {
  console.log(
    "\nPL Creators Suite — Command Center Jobs UI Test\n",
  );

  const selectors =
    loadTypeScriptModule(
      "apps/renderer/src/platform/operations/selectors.ts",
    );

  await check(
    "live tasks sort before stable history rows",
    () => {
      const rows = [
        {
          id: "history-b",
          status: "completed",
          source: "history",
          createdAt:
            "2026-01-02T00:00:00.000Z",
        },
        {
          id: "live-a",
          status: "running",
          source: "live",
          createdAt:
            "2026-01-01T00:00:00.000Z",
        },
        {
          id: "history-a",
          status: "failed",
          source: "history",
          createdAt:
            "2026-01-02T00:00:00.000Z",
        },
      ];

      assert.deepStrictEqual(
        selectors
          .sortOperationalTasks(rows)
          .map((row) => row.id),
        [
          "live-a",
          "history-a",
          "history-b",
        ],
      );
    },
  );

  await check(
    "task search and normalization expose safe fields only",
    () => {
      const normalized =
        selectors.toOperationalTaskResult({
          historyAvailable: true,
          tasks: [
            {
              id: "task-safe",
              title: "Visible title",
              kind: "indexing",
              status: "running",
              source: "live",
              supportsCancellation: true,
              progressPercent: 140,
              input: {
                secret: "private-input",
              },
              result: {
                secret: "private-result",
              },
              metadata: {
                path: "/private/path",
              },
            },
          ],
        });

      assert.deepStrictEqual(
        normalized,
        {
          historyAvailable: true,
          tasks: [
            {
              id: "task-safe",
              title: "Visible title",
              kind: "indexing",
              status: "running",
              source: "live",
              supportsCancellation: true,
              progressPercent: 100,
            },
          ],
        },
      );

      assert.strictEqual(
        selectors.filterOperationalTasks(
          normalized.tasks,
          "private-input",
        ).length,
        0,
      );
    },
  );

  await check(
    "history and unsupported live rows are not cancellable",
    () => {
      assert.strictEqual(
        selectors.canCancelTask({
          id: "history",
          status: "running",
          source: "history",
          supportsCancellation: true,
        }),
        false,
      );

      assert.strictEqual(
        selectors.canCancelTask({
          id: "unsupported",
          status: "running",
          source: "live",
        }),
        false,
      );

      assert.strictEqual(
        selectors.canCancelTask({
          id: "eligible",
          status: "running",
          source: "live",
          supportsCancellation: true,
        }),
        true,
      );
    },
  );

  await check(
    "notification filters group safe display fields and reveal dismissed on request",
    () => {
      const rows = [
        {
          id: "notice-1",
          title: "Build finished",
          message: "Ready",
          severity: "success",
          category: "task",
          createdAt:
            "2026-01-01T00:00:00.000Z",
          metadata: {
            secret: "metadata-secret",
          },
        },
        {
          id: "notice-2",
          title: "Security review",
          severity: "warning",
          category: "security",
          createdAt:
            "2026-01-02T00:00:00.000Z",
          dismissedAt:
            "2026-01-03T00:00:00.000Z",
        },
      ];

      assert.strictEqual(
        selectors.filterNotifications(
          rows,
          "metadata-secret",
          "all",
          "all",
          true,
        ).length,
        0,
      );

      assert.strictEqual(
        selectors.filterNotifications(
          rows,
          "",
          "security",
          "warning",
          false,
        ).length,
        0,
      );

      const visible =
        selectors.filterNotifications(
          rows,
          "",
          "all",
          "all",
          true,
        );

      const groups =
        selectors
          .groupNotificationsByCategory(
            visible,
          );

      assert.strictEqual(
        groups.task.length,
        1,
      );
      assert.strictEqual(
        groups.security.length,
        1,
      );
    },
  );

  await check(
    "overview is bounded and strips private task and diagnostic data",
    async () => {
      const manager =
        new TaskManager();

      manager.registerHandler(
        "fixture.quick",
        async () => ({
          secret: "private-result",
        }),
      );

      const started =
        manager.submit({
          id: "live-private",
          handlerId: "fixture.quick",
          kind: "fixture",
          title: "Safe title",
          input: {
            secret: "private-input",
          },
          metadata: {
            path: "/private/project",
          },
        });

      await started.promise;

      const overview =
        await listUnifiedTaskStates(
          manager,
          {
            async getLatestJobs() {
              return [
                {
                  id: "history-private",
                  status: "failed",
                  kind: "fixture",
                  title: "History title",
                  failure: {
                    code: "SAFE_FAILURE",
                    message:
                      "private-failure",
                  },
                  metadata: {
                    secret:
                      "private-metadata",
                  },
                },
              ];
            },
          },
        );

      const serialized =
        JSON.stringify(overview);

      assert.ok(
        serialized.includes(
          "SAFE_FAILURE",
        ),
      );
      assert.ok(
        !serialized.includes(
          "private-",
        ),
      );
      assert.ok(
        !serialized.includes(
          "/private/",
        ),
      );

      const manyManager = {
        tasks: new Map(),
        list() {
          return Array.from(
            {length: 251},
            (_, index) => ({
              id: `task-${index}`,
              status: "completed",
            }),
          );
        },
      };

      const bounded =
        await listUnifiedTaskStates(
          manyManager,
          {
            async getLatestJobs() {
              return [];
            },
          },
        );

      assert.strictEqual(
        bounded.tasks.length,
        250,
      );
    },
  );

  await check(
    "eligible live cancellation is observed and history IDs cannot cancel",
    async () => {
      const manager =
        new TaskManager();

      manager.registerHandler(
        "fixture.blocking",
        async (_input, context) =>
          await new Promise(
            (resolve, reject) => {
              context.signal
                .addEventListener(
                  "abort",
                  () => {
                    const error =
                      new Error(
                        "fixture cancellation",
                      );

                    error.name =
                      "AbortError";
                    reject(error);
                  },
                  {once: true},
                );

              void resolve;
            },
          ),
      );

      const diagnostics = {
        async getLatestJobs() {
          return [
            {
              id: "history-only",
              status: "completed",
              title: "History",
            },
          ];
        },
      };

      const runtime = {
        taskManager: manager,
        diagnostics,
        listUnifiedTaskStates() {
          return listUnifiedTaskStates(
            manager,
            diagnostics,
          );
        },
      };

      const operations =
        createOperationalMethods(
          runtime,
        );

      const submitted =
        manager.submit({
          id: "cancel-live",
          handlerId:
            "fixture.blocking",
          kind: "fixture",
          title:
            "Cancellable fixture",
          supportsCancellation: true,
        });

      await waitForStatus(
        manager,
        submitted.taskId,
        "running",
      );

      const before =
        await operations
          .listTaskOverview();

      assert.strictEqual(
        before.tasks.find(
          (task) =>
            task.id ===
            submitted.taskId,
        ).supportsCancellation,
        true,
      );

      const cancellation =
        operations.cancelTask({
          taskId:
            submitted.taskId,
        });

      assert.strictEqual(
        cancellation.task.status,
        "cancelling",
      );

      await submitted.promise;

      assert.strictEqual(
        manager.get(
          submitted.taskId,
        ).status,
        "cancelled",
      );

      assert.strictEqual(
        operations.cancelTask({
          taskId: "history-only",
        }).task,
        null,
      );
    },
  );

  await check(
    "history failures retain live rows and report unavailability",
    async () => {
      const manager = {
        tasks: new Map(),
        list() {
          return [
            {
              id: "live-retained",
              status: "running",
            },
          ];
        },
      };

      const result =
        await listUnifiedTaskStates(
          manager,
          {
            async getLatestJobs() {
              throw new Error(
                "private diagnostics path",
              );
            },
          },
        );

      assert.deepStrictEqual(
        result,
        {
          tasks: [
            {
              id: "live-retained",
              status: "running",
              source: "live",
            },
          ],
          historyAvailable: false,
        },
      );
    },
  );

  await check(
    "operations UI uses shared event invalidation without another poller",
    () => {
      const taskHook =
        read(
          "apps/renderer/src/platform/operations/useOperationalTasks.ts",
        );

      const noticeHook =
        read(
          "apps/renderer/src/platform/operations/useNotifications.ts",
        );

      const panel =
        read(
          "apps/renderer/src/components/operations/OperationsPanel.tsx",
        );

      assert.ok(
        taskHook.includes(
          '"tasks.overview"',
        ),
      );
      assert.ok(
        taskHook.includes(
          "eventApi.subscribe",
        ),
      );
      assert.ok(
        noticeHook.includes(
          '"task.completed"',
        ),
      );
      assert.ok(
        noticeHook.includes(
          "notifications.dismiss",
        ),
      );
      assert.ok(
        !taskHook.includes(
          "setInterval",
        ) &&
        !noticeHook.includes(
          "setInterval",
        ),
      );
      assert.ok(
        panel.includes(
          '"tasks.cancel"',
        ) &&
        !panel.includes(
          '"rpc.cancel"',
        ),
      );
      assert.ok(
        panel.includes(
          "Task history is unavailable",
        ),
      );
    },
  );

  await check(
    "notification actions omit metadata and arbitrary command arguments",
    () => {
      const inbox =
        read(
          "apps/renderer/src/components/operations/NotificationInbox.tsx",
        );

      assert.ok(
        inbox.includes(
          "commandApi.get",
        ),
      );
      assert.ok(
        inbox.includes(
          "requiredPermissions.length === 0",
        ),
      );
      assert.ok(
        !inbox.includes(
          "item.metadata",
        ),
      );
      assert.ok(
        inbox.includes(
          "commandId,\n          undefined,",
        ),
      );
    },
  );

  await check(
    "widget IDs, dashboard state, accessibility, and overflow remain compatible",
    () => {
      const definitions =
        read(
          "apps/renderer/src/platform/command-center/firstPartyWidgets.ts",
        );

      const workspace =
        read(
          "apps/renderer/src/components/workspaces/CommandCenterWorkspace.tsx",
        );

      const taskList =
        read(
          "apps/renderer/src/components/operations/TaskList.tsx",
        );

      const inbox =
        read(
          "apps/renderer/src/components/operations/NotificationInbox.tsx",
        );

      const styles =
        read(
          "apps/renderer/src/components/operations/OperationsPanel.css",
        );

      for (const widgetId of [
        "tasks",
        "milestones",
        "notifications",
      ]) {
        assert.ok(
          new RegExp(
            `id:\\s*"${widgetId}"`,
          ).test(definitions),
        );
      }

      assert.ok(
        workspace.includes(
          "useDashboardState",
        ) &&
        workspace.includes(
          "OperationsPanel",
        ) &&
        workspace.includes(
          "Back to dashboard",
        ),
      );
      assert.ok(
        taskList.includes(
          'aria-label="Operational tasks"',
        ) &&
        inbox.includes(
          'type="search"',
        ) &&
        inbox.includes(
          "Include dismissed",
        ),
      );
      assert.ok(
        styles.includes(
          ":focus-visible",
        ) &&
        styles.includes(
          "overflow-wrap: anywhere",
        ) &&
        styles.includes(
          "overflow: hidden",
        ),
      );
    },
  );

  console.log(
    `\nCommand Center jobs UI test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);

