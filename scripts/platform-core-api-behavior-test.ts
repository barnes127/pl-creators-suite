import {
  FileApi,
} from "../packages/platform/src/files";

import {
  ProjectApi,
} from "../packages/platform/src/projects";

import {
  SettingsApi,
  SettingsStore,
} from "../packages/platform/src/settings";

import {
  NotificationCenter,
} from "../packages/platform/src/notifications";

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
  const projectApi =
    new ProjectApi({
      async getMetadata(
        projectRoot,
      ) {
        return {
          name:
            "API Test",

          projectRoot,

          schemaVersion:
            1,
        };
      },

      async listRecents() {
        return [];
      },

      async getTree(
        projectRoot,
      ) {
        return {
          id:
            ".",

          name:
            projectRoot,

          relativePath:
            "",

          kind:
            "directory",

          children:
            [],
        };
      },
    });

  const metadata =
    await projectApi
      .getMetadata(
        "/test/project",
      );

  assertEqual(
    metadata.name,
    "API Test",
    "ProjectApi delegates metadata access",
  );

  console.log(
    "PASS    ProjectApi delegates through adapter",
  );

  let written =
    "";

  const fileApi =
    new FileApi({
      async readText() {
        return written;
      },

      async list() {
        return [];
      },

      async stat(
        _projectRoot,
        relativePath,
      ) {
        return {
          relativePath,
          kind:
            "file",
          size:
            written.length,
        };
      },

      async writeText(
        _projectRoot,
        _relativePath,
        content,
      ) {
        written =
          content;
      },
    });

  await fileApi.writeText(
    "/test/project",
    "hello.txt",
    "hello",
  );

  assertEqual(
    await fileApi.readText(
      "/test/project",
      "hello.txt",
    ),
    "hello",
    "FileApi delegates reads and writes",
  );

  console.log(
    "PASS    FileApi delegates controlled file operations",
  );

  const settingsStore =
    new SettingsStore();

  const settingsApi =
    new SettingsApi(
      settingsStore,
    );

  const applicationScope = {
    kind:
      "application" as const,
  };

  settingsApi.set(
    applicationScope,
    "theme",
    "dark",
  );

  assertEqual(
    settingsApi.get(
      applicationScope,
      "theme",
    ),
    "dark",
    "SettingsApi wraps SettingsStore",
  );

  console.log(
    "PASS    SettingsApi wraps shared settings store",
  );

  const notifications =
    new NotificationCenter();

  const notification =
    notifications.push({
      title:
        "Build finished",

      category:
        "task",

      severity:
        "success",

      sourceId:
        "build.test",
    });

  assertEqual(
    notifications
      .list()
      .length,
    1,
    "notification appears in active list",
  );

  notifications.dismiss(
    notification.id,
  );

  assertEqual(
    notifications
      .list()
      .length,
    0,
    "dismissed notification hidden by default",
  );

  assertEqual(
    notifications
      .list({
        includeDismissed:
          true,
      })
      .length,
    1,
    "dismissed notification retained",
  );

  console.log(
    "PASS    NotificationCenter supports lifecycle and filtering",
  );

  console.log(
    "\nPlatform core API behavior test complete: 4/4 PASS",
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
