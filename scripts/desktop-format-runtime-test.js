const assert = require("assert");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const {
  createDesktopFormatRuntime,
} = require(
  "../apps/desktop/services/formats",
);

const {
  createDesktopTaskManager,
} = require(
  "../apps/desktop/services/tasks",
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

function createContext(signal) {
  return {
    signal,
    progress: [],
    warnings: [],

    reportProgress(update) {
      this.progress.push(update);
    },

    reportWarning(warning) {
      this.warnings.push(warning);
    },

    reportResourceUsage() {},
  };
}

async function main() {
  console.log(
    "\nPL Creators Suite — Desktop Format Runtime Test\n",
  );

  const tempRoot =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pl-format-runtime-",
      ),
    );

  try {
    const runtime =
      createDesktopFormatRuntime();

    await check(
      "default format adapters are registered",
      async () => {
        const ids =
          runtime
            .list()
            .map(
              (adapter) =>
                adapter.descriptor.id,
            );

        assert.ok(
          ids.includes("data.json"),
        );

        assert.ok(
          ids.includes("data.csv"),
        );

        assert.ok(
          ids.includes(
            "project.plproj",
          ),
        );
      },
    );

    await check(
      "runtime resolves adapters by extension",
      async () => {
        assert.equal(
          runtime.resolveForPath(
            "example.JSON",
            "import",
          )[0].descriptor.id,
          "data.json",
        );

        assert.equal(
          runtime.resolveForPath(
            "table.csv",
            "export",
          )[0].descriptor.id,
          "data.csv",
        );
      },
    );

    await check(
      "project package adapter previews a valid archive",
      async () => {
        const sourceRoot =
          path.join(
            tempRoot,
            "ProjectPreviewSource",
          );

        await fs.mkdir(
          sourceRoot,
          { recursive: true },
        );

        await fs.writeFile(
          path.join(
            sourceRoot,
            "pl-project.json",
          ),
          JSON.stringify({
            schemaVersion: 1,
            name: "Preview Project",
          }),
          "utf8",
        );

        await fs.writeFile(
          path.join(
            sourceRoot,
            "sample.txt",
          ),
          "preview fixture",
          "utf8",
        );

        const archivePath =
          path.join(
            tempRoot,
            "PreviewProject.plproj",
          );

        const {
          createZipArchive,
        } = require(
          "../apps/desktop/services/formats/archive",
        );

        await createZipArchive(
          sourceRoot,
          archivePath,
        );

        const controller =
          new AbortController();

        const result =
          await runtime.preview(
            "project.plproj",
            {
              sourcePath:
                archivePath,
            },
            createContext(
              controller.signal,
            ),
          );

        assert.equal(
          result.metadata.hasManifest,
          true,
        );

        assert.ok(
          result.metadata.entryCount >= 2,
        );
      },
    );

    await check(
      "JSON adapter round trips structured data",
      async () => {
        const destination =
          path.join(
            tempRoot,
            "roundtrip.json",
          );

        const controller =
          new AbortController();

        const context =
          createContext(
            controller.signal,
          );

        const source = {
          project:
            "PL Creators Suite",

          values: [
            1,
            2,
            3,
          ],
        };

        await runtime.export(
          "data.json",
          {
            value: source,
            destinationPath:
              destination,
            options: {
              indent: 2,
            },
          },
          context,
        );

        const imported =
          await runtime.import(
            "data.json",
            {
              sourcePath:
                destination,
            },
            context,
          );

        assert.deepStrictEqual(
          imported.value,
          source,
        );
      },
    );

    await check(
      "JSON preview returns structured metadata",
      async () => {
        const filePath =
          path.join(
            tempRoot,
            "preview.json",
          );

        await fs.writeFile(
          filePath,
          JSON.stringify({
            alpha: 1,
            beta: 2,
          }),
          "utf8",
        );

        const controller =
          new AbortController();

        const result =
          await runtime.preview(
            "data.json",
            {
              sourcePath:
                filePath,
            },
            createContext(
              controller.signal,
            ),
          );

        assert.equal(
          result.metadata.type,
          "object",
        );

        assert.equal(
          result.metadata.count,
          2,
        );
      },
    );

    await check(
      "CSV adapter preserves quoted fields",
      async () => {
        const filePath =
          path.join(
            tempRoot,
            "roundtrip.csv",
          );

        const rows = [
          [
            "name",
            "description",
          ],
          [
            "Suite",
            "Code, docs, and tools",
          ],
          [
            "Quote",
            "He said \"hello\"",
          ],
        ];

        const controller =
          new AbortController();

        const context =
          createContext(
            controller.signal,
          );

        await runtime.export(
          "data.csv",
          {
            value: rows,
            destinationPath:
              filePath,
          },
          context,
        );

        const imported =
          await runtime.import(
            "data.csv",
            {
              sourcePath:
                filePath,
          },
          context,
        );

        assert.deepStrictEqual(
          imported.value,
          rows,
        );
      },
    );

    await check(
      "pre-cancelled format operation aborts",
      async () => {
        const filePath =
          path.join(
            tempRoot,
            "cancel.json",
          );

        await fs.writeFile(
          filePath,
          "{}",
          "utf8",
        );

        const controller =
          new AbortController();

        controller.abort();

        await assert.rejects(
          () =>
            runtime.import(
              "data.json",
              {
                sourcePath:
                  filePath,
              },
              createContext(
                controller.signal,
              ),
            ),
          (error) =>
            error.name ===
            "AbortError",
        );
      },
    );

    await check(
      "format export executes through shared task manager",
      async () => {
        const filePath =
          path.join(
            tempRoot,
            "task-export.json",
          );

        const manager =
          createDesktopTaskManager();

        const submitted =
          manager.submit({
            handlerId:
              "format.export",

            kind:
              "export",

            title:
              "Export JSON fixture",

            input: {
              adapterId:
                "data.json",

              request: {
                value: {
                  task:
                    true,
                },

                destinationPath:
                  filePath,
              },
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

        const saved =
          JSON.parse(
            await fs.readFile(
              filePath,
              "utf8",
            ),
          );

        assert.equal(
          saved.task,
          true,
        );
      },
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

  console.log(
    `\nDesktop format runtime test complete: ${passed} passed, ${failed} failed.`,
  );

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
