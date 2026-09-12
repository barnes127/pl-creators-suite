const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");

const {
  createWorkflowApiAdapter,
} =
  require(
    "../apps/desktop/services/workflows/api",
  );

async function main() {
  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-workflow-api-",
      ),
    );

  const api =
    createWorkflowApiAdapter();

  const created =
    await api.create(
      tempRoot,
      "test-workflow",
    );

  assert.strictEqual(
    created.workflow.name,
    "test-workflow",
  );

  console.log(
    "PASS    Workflow API creates through existing persistence service",
  );

  const listed =
    await api.list(
      tempRoot,
    );

  assert.strictEqual(
    listed.length,
    1,
  );

  console.log(
    "PASS    Workflow API lists existing workflows",
  );

  const read =
    await api.read(
      tempRoot,
      "test-workflow",
    );

  assert.strictEqual(
    read.workflow.name,
    "test-workflow",
  );

  console.log(
    "PASS    Workflow API reads existing workflow",
  );

  await api.delete(
    tempRoot,
    "test-workflow",
  );

  const afterDelete =
    await api.list(
      tempRoot,
    );

  assert.strictEqual(
    afterDelete.length,
    0,
  );

  console.log(
    "PASS    Workflow API deletes existing workflow",
  );

  await fs.rm(
    tempRoot,
    {
      recursive:
        true,

      force:
        true,
    },
  );

  console.log(
    "\nDesktop Workflow API test complete: 4/4 PASS",
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
