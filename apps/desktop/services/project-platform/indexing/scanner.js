const fs =
  require("fs/promises");

const path =
  require("path");

const {
  DEFAULT_IGNORED_NAMES,
} =
  require(
    "./constants",
  );

const {
  cleanProjectRoot,
} =
  require(
    "./storage",
  );


async function scanProjectFiles(
  params = {},
) {
  const projectRoot =
    cleanProjectRoot(
      params.projectRoot,
    );


  const ignoredNames =
    new Set([
      ...DEFAULT_IGNORED_NAMES,
      ...(
        Array.isArray(
          params.ignore,
        )
          ? params.ignore
          : []
      ),
    ]);


  const files =
    [];


  async function walk(
    directory,
    relativeDirectory,
  ) {
    const entries =
      await fs.readdir(
        directory,
        {
          withFileTypes:
            true,
        },
      );


    entries.sort(
      (
        left,
        right,
      ) =>
        left.name.localeCompare(
          right.name,
        ),
    );


    for (
      const entry
      of entries
    ) {
      if (
        ignoredNames.has(
          entry.name,
        )
      ) {
        continue;
      }


      const absolutePath =
        path.join(
          directory,
          entry.name,
        );


      const relativePath =
        (
          relativeDirectory
            ? path.join(
                relativeDirectory,
                entry.name,
              )
            : entry.name
        )
          .replace(
            /\\/g,
            "/",
          );


      if (
        entry.isDirectory()
      ) {
        await walk(
          absolutePath,
          relativePath,
        );

        continue;
      }


      if (
        !entry.isFile()
      ) {
        continue;
      }


      const stats =
        await fs.stat(
          absolutePath,
        );


      files.push({
        absolutePath,

        relativePath,

        size:
          stats.size,

        modifiedTimeMs:
          stats.mtimeMs,
      });
    }
  }


  await walk(
    projectRoot,
    "",
  );


  return files;
}


module.exports = {
  scanProjectFiles,
};
