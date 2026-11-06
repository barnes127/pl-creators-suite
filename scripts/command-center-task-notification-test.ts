import type {
  PlatformRuntime,
} from "../packages/platform/src";

import {
  createTaskNotificationBridge,
} from "../apps/renderer/src/platform/tasks/taskNotificationBridge";

import {
  MAX_TRACKED_TASK_IDS,
  taskNotificationIntent,
  toSafeObservedTasks,
} from "../apps/renderer/src/platform/tasks/taskNotificationPolicy";

import type {
  ObservedTask,
} from "../apps/renderer/src/platform/tasks/taskNotificationPolicy";

type BridgePlatform =
  Pick<
    PlatformRuntime,
    "notifications" | "eventApi"
  >;

type CapturedEvent = {
  type: string;
  payload: unknown;
  metadata: unknown;
};

type CapturedNotification =
  Record<string, unknown>;

let passed =
  0;

const assert = {
  equal(
    actual: unknown,
    expected: unknown,
  ) {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)}, received ${String(actual)}`,
      );
    }
  },

  deepEqual(
    actual: unknown,
    expected: unknown,
  ) {
    const actualJson =
      JSON.stringify(actual);

    const expectedJson =
      JSON.stringify(expected);

    if (actualJson !== expectedJson) {
      throw new Error(
        `Expected ${expectedJson}, received ${actualJson}`,
      );
    }
  },

  ok(
    condition: unknown,
  ) {
    if (!condition) {
      throw new Error(
        "Expected condition to be truthy",
      );
    }
  },
};

function pass(
  message: string,
) {
  passed +=
    1;

  console.log(
    `PASS ${passed}: ${message}`,
  );
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

function createPlatform(
  options: {
    rejectEvents?: boolean;
    notifications?: CapturedNotification[];
  } = {},
) {
  const notifications =
    options.notifications ?? [];

  const events:
    CapturedEvent[] = [];

  const platform = {
    notifications: {
      push(
        input: CapturedNotification,
      ) {
        notifications.push({
          ...input,
        });

        return input;
      },
    },

    eventApi: {
      async emit(
        type: string,
        payload: unknown,
        metadata: unknown,
      ) {
        if (options.rejectEvents) {
          throw new Error(
            "fixture listener failure",
          );
        }

        events.push({
          type,
          payload,
          metadata,
        });
      },
    },
  } as unknown as BridgePlatform;

  return {
    events,
    notifications,
    platform,
  };
}

function createScenario(
  initialTasks: ObservedTask[],
  options: {
    rejectEvents?: boolean;
    notifications?: CapturedNotification[];
  } = {},
) {
  let tasks =
    initialTasks;

  let reads =
    0;

  const captured =
    createPlatform(options);

  const bridge =
    createTaskNotificationBridge({
      async readTasks() {
        reads +=
          1;

        return tasks;
      },

      platform:
        captured.platform,

      intervalMs:
        60_000,
    });

  return {
    ...captured,
    bridge,

    get reads() {
      return reads;
    },

    setTasks(
      nextTasks: ObservedTask[],
    ) {
      tasks =
        nextTasks;
    },
  };
}

async function seed(
  scenario: ReturnType<typeof createScenario>,
) {
  scenario.bridge.start();
  await settle();
}

async function testCompletedLifecycle() {
  const scenario =
    createScenario([
      {
        id:
          "task-completed",
        kind:
          "fixture",
        status:
          "queued",
      },
    ]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "task-completed",
        kind:
          "fixture",
        status:
          "running",
        progress: {
          percent:
            25,
        },
      },
    ]);

    await scenario.bridge.refresh();

    scenario.setTasks([
      {
        id:
          "task-completed",
        kind:
          "fixture",
        status:
          "completed",
        progress: {
          percent:
            100,
        },
      },
    ]);

    await scenario.bridge.refresh();
    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      1,
    );

    assert.deepEqual(
      scenario.events.map(
        (event) => event.type,
      ),
      [
        "task.started",
        "task.progress",
        "task.completed",
      ],
    );

    assert.deepEqual(
      scenario.events[2]?.payload,
      {
        taskId:
          "task-completed",
        success:
          true,
      },
    );

    pass(
      "queued to running to completed emits safe lifecycle events and one success notice",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testCancellation() {
  const scenario =
    createScenario([
      {
        id:
          "task-cancelled",
        status:
          "queued",
      },
    ]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "task-cancelled",
        status:
          "cancelled",
      },
    ]);

    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      1,
    );

    assert.equal(
      scenario.notifications[0]?.severity,
      "warning",
    );

    assert.equal(
      scenario.events.length,
      0,
    );

    pass(
      "an observed queued task cancellation produces one warning without a completion event",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testFailure() {
  const scenario =
    createScenario([
      {
        id:
          "task-failed",
        status:
          "running",
      },
    ]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "task-failed",
        status:
          "failed",
      },
    ]);

    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications[0]?.severity,
      "error",
    );

    assert.deepEqual(
      scenario.events[0]?.payload,
      {
        taskId:
          "task-failed",
        success:
          false,
      },
    );

    pass(
      "running to failed produces one error notice and a failed completion event",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testInitialTerminalAndDuplicateSuppression() {
  const scenario =
    createScenario([
      {
        id:
          "historical-terminal",
        status:
          "completed",
      },
    ]);

  try {
    await seed(scenario);
    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      0,
    );

    scenario.setTasks([
      {
        id:
          "historical-terminal",
        status:
          "completed",
      },
      {
        id:
          "new-terminal",
        status:
          "completed",
      },
    ]);

    await scenario.bridge.refresh();
    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      0,
    );

    pass(
      "initial and first-seen terminal records do not replay or duplicate notices",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testProgressAndPrivacy() {
  const secret =
    "/private/secret-project/token.txt";

  const projected =
    toSafeObservedTasks([
      {
        id:
          "privacy-task",
        kind:
          "fixture",
        status:
          "running",
        title:
          secret,
        input: {
          token:
            secret,
        },
        result:
          secret,
        metadata: {
          path:
            secret,
        },
        failure: {
          message:
            secret,
        },
        progress: {
          percent:
            150,
          message:
            secret,
        },
      },
    ]);

  assert.equal(
    projected[0]?.progress?.percent,
    100,
  );

  assert.ok(
    !JSON.stringify(projected).includes(
      secret,
    ),
  );

  const intent =
    taskNotificationIntent({
      id:
        "privacy-task",
      status:
        "completed",
      title:
        secret,
    });

  assert.ok(
    !JSON.stringify(intent).includes(
      secret,
    ),
  );

  const scenario =
    createScenario([
      {
        id:
          "progress-task",
        status:
          "running",
        progress: {
          percent:
            10,
        },
      },
    ]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "progress-task",
        status:
          "running",
        progress: {
          percent:
            20,
        },
      },
    ]);

    await scenario.bridge.refresh();
    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      0,
    );

    assert.equal(
      scenario.events.length,
      1,
    );

    assert.ok(
      !JSON.stringify(
        scenario.events,
      ).includes("message"),
    );

    pass(
      "progress is clamped and emitted once without task payloads, labels, paths, or messages",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testReadRecovery() {
  const unrelated = {
    title:
      "Existing notification",
    category:
      "system",
  };

  const captured =
    createPlatform({
      notifications: [
        unrelated,
      ],
    });

  let tasks: ObservedTask[] = [
    {
      id:
        "recovered-task",
      status:
        "queued",
    },
  ];

  let rejectNext =
    true;

  const bridge =
    createTaskNotificationBridge({
      async readTasks() {
        if (rejectNext) {
          rejectNext =
            false;

          throw new Error(
            "fixture read failure",
          );
        }

        return tasks;
      },

      platform:
        captured.platform,

      intervalMs:
        60_000,
    });

  try {
    bridge.start();
    await settle();
    await bridge.refresh();

    tasks = [
      {
        id:
          "recovered-task",
        status:
          "completed",
      },
    ];

    await bridge.refresh();

    assert.equal(
      captured.notifications[0],
      unrelated,
    );

    assert.equal(
      captured.notifications.length,
      2,
    );

    pass(
      "a rejected read preserves unrelated notices and later observation recovers",
    );
  } finally {
    bridge.stop();
  }
}

async function testConcurrencyCleanupAndRestart() {
  let resolveFirst:
    ((tasks: ObservedTask[]) => void) |
      undefined;

  let tasks: ObservedTask[] = [
    {
      id:
        "restart-task",
      status:
        "queued",
    },
  ];

  let reads =
    0;

  const captured =
    createPlatform();

  const bridge =
    createTaskNotificationBridge({
      readTasks() {
        reads +=
          1;

        if (reads === 1) {
          return new Promise<ObservedTask[]>(
            (resolve) => {
              resolveFirst =
                resolve;
            },
          );
        }

        return Promise.resolve(tasks);
      },

      platform:
        captured.platform,

      intervalMs:
        60_000,
    });

  bridge.start();
  void bridge.refresh();
  void bridge.refresh();

  assert.equal(
    reads,
    1,
  );

  bridge.stop();
  bridge.start();
  await settle();

  assert.equal(
    reads,
    2,
  );

  resolveFirst?.([
    {
      id:
        "stale-task",
      status:
        "completed",
    },
  ]);

  await settle();

  assert.equal(
    captured.notifications.length,
    0,
  );

  tasks = [
    {
      id:
        "restart-task",
      status:
        "completed",
    },
  ];

  await bridge.refresh();

  assert.equal(
    captured.notifications.length,
    1,
  );

  bridge.stop();

  const readsAfterStop =
    reads;

  await bridge.refresh();

  assert.equal(
    reads,
    readsAfterStop,
  );

  pass(
    "refreshes do not overlap, stale results are ignored, cleanup stops reads, and restart re-seeds",
  );
}

async function testIndependentTasks() {
  const scenario =
    createScenario([
      {
        id:
          "task-one",
        status:
          "queued",
      },
      {
        id:
          "task-two",
        status:
          "running",
      },
    ]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "task-one",
        status:
          "failed",
      },
      {
        id:
          "task-two",
        status:
          "completed",
      },
    ]);

    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      2,
    );

    assert.equal(
      scenario.events.length,
      2,
    );

    pass(
      "multiple task IDs reconcile independently across success and failure",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testListenerFailureIsolation() {
  const scenario =
    createScenario(
      [
        {
          id:
            "listener-task",
          status:
            "queued",
        },
      ],
      {
        rejectEvents:
          true,
      },
    );

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "listener-task",
        status:
          "running",
      },
    ]);

    await scenario.bridge.refresh();

    scenario.setTasks([
      {
        id:
          "listener-task",
        status:
          "completed",
      },
    ]);

    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      1,
    );

    pass(
      "rejected event listeners do not suppress terminal notifications",
    );
  } finally {
    scenario.bridge.stop();
  }
}

async function testMissedIntermediateState() {
  const scenario =
    createScenario([]);

  try {
    await seed(scenario);

    scenario.setTasks([
      {
        id:
          "between-polls",
        status:
          "completed",
      },
    ]);

    await scenario.bridge.refresh();

    assert.equal(
      scenario.notifications.length,
      0,
    );

    pass(
      "a task first observed terminal demonstrates the accepted between-polls delivery limitation",
    );
  } finally {
    scenario.bridge.stop();
  }
}

function testProjectionBound() {
  const terminal =
    Array.from(
      {
        length:
          MAX_TRACKED_TASK_IDS + 5,
      },
      (_, index) => ({
        id:
          `terminal-${index}`,
        status:
          "completed",
      }),
    );

  const active = [
    {
      id:
        "active-one",
      status:
        "queued",
    },
    {
      id:
        "active-two",
      status:
        "running",
    },
  ];

  const bounded =
    toSafeObservedTasks([
      ...terminal,
      ...active,
    ]);

  assert.equal(
    bounded.length,
    MAX_TRACKED_TASK_IDS,
  );

  assert.ok(
    active.every(
      ({id}) =>
        bounded.some(
          (task) => task.id === id,
        ),
    ),
  );

  const activeOverflow =
    toSafeObservedTasks(
      Array.from(
        {
          length:
            MAX_TRACKED_TASK_IDS + 1,
        },
        (_, index) => ({
          id:
            `active-${index}`,
          status:
            "queued",
        }),
      ),
    );

  assert.equal(
    activeOverflow.length,
    MAX_TRACKED_TASK_IDS + 1,
  );

  pass(
    "safe projection caps retained history at 100 IDs without discarding active tasks",
  );
}

async function main() {
  await testCompletedLifecycle();
  await testCancellation();
  await testFailure();
  await testInitialTerminalAndDuplicateSuppression();
  await testProgressAndPrivacy();
  await testReadRecovery();
  await testConcurrencyCleanupAndRestart();
  await testIndependentTasks();
  await testListenerFailureIsolation();
  await testMissedIntermediateState();
  testProjectionBound();

  console.log(
    `\nCommand Center task notification test complete: ${passed}/${passed} PASS`,
  );
}

main().catch(
  (error) => {
    console.error(error);

    throw error;
  },
);
