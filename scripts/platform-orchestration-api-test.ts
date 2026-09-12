import {
  CommandApi,
  CommandRegistry,
} from "../packages/platform/src/commands";

import {
  EventApi,
  EventBus,
} from "../packages/platform/src/events";

import {
  SearchApi,
  SearchProviderRegistry,
} from "../packages/platform/src/search";

import {
  TaskApi,
} from "../packages/platform/src/tasks";

import {
  WorkflowApi,
  WORKFLOW_RUN_HANDLER_ID,
} from "../packages/platform/src/workflows";

function assertEqual(
  actual: unknown,
  expected: unknown,
  message: string,
) {
  if (
    actual !==
    expected
  ) {
    throw new Error(
      `${message}: expected ${String(expected)}, received ${String(actual)}`,
    );
  }
}

async function main() {
  const commands =
    new CommandRegistry();

  commands.register({
    id:
      "test.command",

    title:
      "Test Command",

    version:
      "1.0.0",

    async execute() {
      return {
        ok:
          true,

        value:
          "command-result",
      };
    },
  });

  const commandApi =
    new CommandApi(
      commands,
    );

  assertEqual(
    commandApi
      .search(
        "Test Command",
      )
      .length,
    1,
    "CommandApi search delegates to registry",
  );

  console.log(
    "PASS    CommandApi delegates registry operations",
  );

  type TestEvents = {
    "test.event": {
      value: string;
    };
  };

  const bus =
    new EventBus<TestEvents>();

  const eventApi =
    new EventApi(
      bus,
    );

  let eventValue =
    "";

  eventApi.subscribe(
    "test.event",
    (
      event,
    ) => {
      eventValue =
        event.payload.value;
    },
  );

  await eventApi.emit(
    "test.event",
    {
      value:
        "event-result",
    },
    {
      source:
        "engine",
    },
  );

  assertEqual(
    eventValue,
    "event-result",
    "EventApi delegates event emission",
  );

  console.log(
    "PASS    EventApi delegates shared event bus operations",
  );

  const searchRegistry =
    new SearchProviderRegistry();

  const searchApi =
    new SearchApi(
      searchRegistry,
    );

  searchApi.register({
    id:
      "test.search",

    kinds: [
      "task",
    ],

    async search() {
      return [
        {
          id:
            "result-1",

          kind:
            "task",

          title:
            "Test Result",

          score:
            1,

          sourceId:
            "test.search",
        },
      ];
    },
  });

  const searchResults =
    await searchApi.search(
      {
        text:
          "test",
      },
      {
        projectRoot:
          "/test/project",
      },
    );

  assertEqual(
    searchResults.length,
    1,
    "SearchApi delegates provider search",
  );

  console.log(
    "PASS    SearchApi delegates provider aggregation",
  );

  const taskRecords =
    new Map<
      string,
      any
    >();

  const taskApi =
    new TaskApi({
      async start(
        definition,
      ) {
        const record = {
          id:
            "task-test",

          kind:
            definition.kind,

          title:
            definition.title,

          priority:
            definition.priority ??
            "normal",

          status:
            "queued" as const,

          input:
            definition.input,

          progress: {
            phase:
              "pending",

            completed:
              null,

            total:
              null,

            percent:
              null,

            message:
              "",
          },

          warnings:
            [],

          createdAt:
            new Date()
              .toISOString(),
        };

        taskRecords.set(
          record.id,
          record,
        );

        return record;
      },

      async cancel(
        taskId,
      ) {
        return (
          taskRecords.get(
            taskId,
          ) ??
          null
        );
      },

      async get(
        taskId,
      ) {
        return (
          taskRecords.get(
            taskId,
          ) ??
          null
        );
      },

      async list() {
        return Array.from(
          taskRecords.values(),
        );
      },
    });

  const startedTask =
    await taskApi.start({
      kind:
        "maintenance",

      title:
        "Test Task",

      input:
        {},
    });

  assertEqual(
    startedTask.id,
    "task-test",
    "TaskApi delegates task start",
  );

  console.log(
    "PASS    TaskApi delegates shared task service operations",
  );

  const workflowApi =
    new WorkflowApi({
      async list() {
        return [];
      },

      async create(
        _projectRoot,
        name,
      ) {
        return {
          name,

          workflow: {
            name,
          },
        };
      },

      async read(
        _projectRoot,
        name,
      ) {
        return {
          name,

          workflow: {
            name,
          },
        };
      },

      async save(
        _projectRoot,
        name,
        workflow,
      ) {
        return {
          name,
          workflow,
        };
      },

      async delete(
        _projectRoot,
        name,
      ) {
        return {
          name,
          deleted:
            true,
        };
      },
    });

  const workflowTask =
    workflowApi
      .createRunTask(
        "/test/project",
        "build",
      );

  assertEqual(
    workflowTask.kind,
    "workflow",
    "workflow task uses workflow kind",
  );

  assertEqual(
    workflowTask.handlerId,
    WORKFLOW_RUN_HANDLER_ID,
    "workflow task declares shared handler id",
  );

  console.log(
    "PASS    WorkflowApi connects workflow contracts to task contracts",
  );

  console.log(
    "\nPlatform orchestration API test complete: 5/5 PASS",
  );
}

main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    throw error;
  },
);
