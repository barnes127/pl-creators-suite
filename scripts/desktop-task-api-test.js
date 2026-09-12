const assert =
  require("assert");

const {
  TaskManager,
} =
  require(
    "../apps/desktop/services/tasks/manager",
  );

const {
  createTaskApiAdapter,
} =
  require(
    "../apps/desktop/services/tasks/api",
  );

async function main() {
  const manager =
    new TaskManager();

  manager.registerHandler(
    "test.handler",
    async (
      input,
    ) => ({
      value:
        input.value,
    }),
  );

  const api =
    createTaskApiAdapter(
      manager,
    );

  const started =
    await api.start({
      kind:
        "maintenance",

      handlerId:
        "test.handler",

      title:
        "Task API Test",

      input: {
        value:
          42,
      },
    });

  assert.strictEqual(
    started.kind,
    "maintenance",
  );

  console.log(
    "PASS    Task API starts through desktop manager",
  );

  const listed =
    await api.list();

  assert.strictEqual(
    listed.length,
    1,
  );

  console.log(
    "PASS    Task API lists desktop tasks",
  );

  const fetched =
    await api.get(
      started.id,
    );

  assert.strictEqual(
    fetched.id,
    started.id,
  );

  console.log(
    "PASS    Task API gets desktop task state",
  );

  console.log(
    "\nDesktop Task API test complete: 3/3 PASS",
  );
}

main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);
