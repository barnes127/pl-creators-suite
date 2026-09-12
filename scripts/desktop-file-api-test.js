const assert =
  require("assert");

const fs =
  require("fs/promises");

const os =
  require("os");

const path =
  require("path");

const {
  createFileApiAdapter,
} =
  require(
    "../apps/desktop/services/project-platform/files",
  );

async function main() {
  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-file-api-test-",
      ),
    );

  const projectRoot =
    path.join(
      tempRoot,
      "Project",
    );

  const outsideRoot =
    path.join(
      tempRoot,
      "Outside",
    );

  await fs.mkdir(
    projectRoot,
    {
      recursive:
        true,
    },
  );

  await fs.mkdir(
    outsideRoot,
    {
      recursive:
        true,
    },
  );

  await fs.writeFile(
    path.join(
      projectRoot,
      "existing.txt",
    ),
    "original",
    "utf8",
  );

  await fs.writeFile(
    path.join(
      outsideRoot,
      "secret.txt",
    ),
    "outside",
    "utf8",
  );

  const api =
    createFileApiAdapter();

  assert.strictEqual(
    await api.readText(
      projectRoot,
      "existing.txt",
    ),
    "original",
  );

  console.log(
    "PASS    project file read succeeds",
  );

  const entries =
    await api.list(
      projectRoot,
    );

  assert.ok(
    entries.some(
      (
        entry,
      ) =>
        entry.name ===
        "existing.txt",
    ),
  );

  console.log(
    "PASS    project directory listing succeeds",
  );

  const stats =
    await api.stat(
      projectRoot,
      "existing.txt",
    );

  assert.strictEqual(
    stats.kind,
    "file",
  );

  console.log(
    "PASS    project file stat succeeds",
  );

  await api.writeText(
    projectRoot,
    "new.txt",
    "new",
  );

  assert.strictEqual(
    await fs.readFile(
      path.join(
        projectRoot,
        "new.txt",
      ),
      "utf8",
    ),
    "new",
  );

  console.log(
    "PASS    controlled project file write succeeds",
  );

  await assert.rejects(
    () =>
      api.writeText(
        projectRoot,
        "existing.txt",
        "replacement",
      ),
    (
      error,
    ) =>
      error.code ===
      "OUTPUT_EXISTS",
  );

  assert.strictEqual(
    await fs.readFile(
      path.join(
        projectRoot,
        "existing.txt",
      ),
      "utf8",
    ),
    "original",
  );

  console.log(
    "PASS    silent overwrite is refused",
  );

  await api.writeText(
    projectRoot,
    "existing.txt",
    "replacement",
    {
      overwrite:
        true,
    },
  );

  assert.strictEqual(
    await fs.readFile(
      path.join(
        projectRoot,
        "existing.txt",
      ),
      "utf8",
    ),
    "replacement",
  );

  console.log(
    "PASS    explicit overwrite succeeds",
  );

  await assert.rejects(
    () =>
      api.readText(
        projectRoot,
        "../Outside/secret.txt",
      ),
    (
      error,
    ) =>
      error.code ===
      "PROJECT_FILE_OUTSIDE_ROOT",
  );

  console.log(
    "PASS    lexical traversal is rejected",
  );

  const symlinkPath =
    path.join(
      projectRoot,
      "outside-link.txt",
    );

  await fs.symlink(
    path.join(
      outsideRoot,
      "secret.txt",
    ),
    symlinkPath,
  );

  await assert.rejects(
    () =>
      api.readText(
        projectRoot,
        "outside-link.txt",
      ),
    (
      error,
    ) =>
      error.code ===
      "PROJECT_FILE_OUTSIDE_ROOT",
  );

  console.log(
    "PASS    symlink escape is rejected",
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
    "\nDesktop File API test complete: 8/8 PASS",
  );
}

main().catch(
  async (
    error,
  ) => {
    console.error(
      error,
    );

    process.exitCode =
      1;
  },
);
