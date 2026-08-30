const fs =
  require("fs/promises");

const path =
  require("path");


const DEFAULT_IGNORED_NAMES =
  new Set([
    ".git",
    "node_modules",
  ]);


function cleanProjectRoot(
  projectRoot,
) {
  const root =
    String(
      projectRoot ||
      "",
    ).trim();


  if (
    !root
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  return path.resolve(
    root,
  );
}


function relativeNodeId(
  relativePath,
) {
  return (
    relativePath ||
    "."
  )
    .replace(
      /\\/g,
      "/",
    );
}


async function buildProjectTree(
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


  async function walk(
    absoluteDir,
    relativeDir,
  ) {
    const entries =
      await fs.readdir(
        absoluteDir,
        {
          withFileTypes:
            true,
        },
      );


    entries.sort(
      (
        left,
        right,
      ) => {
        if (
          left.isDirectory() &&
          !right.isDirectory()
        ) {
          return -1;
        }


        if (
          !left.isDirectory() &&
          right.isDirectory()
        ) {
          return 1;
        }


        return left.name.localeCompare(
          right.name,
        );
      },
    );


    const children =
      [];


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


      const relativePath =
        relativeDir
          ? path.join(
              relativeDir,
              entry.name,
            )
          : entry.name;


      const normalizedRelativePath =
        relativePath.replace(
          /\\/g,
          "/",
        );


      const absolutePath =
        path.join(
          absoluteDir,
          entry.name,
        );


      if (
        entry.isDirectory()
      ) {
        children.push({
          id:
            relativeNodeId(
              normalizedRelativePath,
            ),

          name:
            entry.name,

          relativePath:
            normalizedRelativePath,

          kind:
            "directory",

          children:
            await walk(
              absolutePath,
              normalizedRelativePath,
            ),
        });


        continue;
      }


      if (
        entry.isFile()
      ) {
        children.push({
          id:
            relativeNodeId(
              normalizedRelativePath,
            ),

          name:
            entry.name,

          relativePath:
            normalizedRelativePath,

          kind:
            "file",
        });
      }
    }


    return children;
  }


  const stats =
    await fs.stat(
      projectRoot,
    );


  if (
    !stats.isDirectory()
  ) {
    throw new Error(
      "projectRoot must be a directory",
    );
  }


  return {
    id:
      ".",

    name:
      path.basename(
        projectRoot,
      ),

    relativePath:
      "",

    kind:
      "directory",

    children:
      await walk(
        projectRoot,
        "",
      ),
  };
}


module.exports = {
  DEFAULT_IGNORED_NAMES,
  buildProjectTree,
};
