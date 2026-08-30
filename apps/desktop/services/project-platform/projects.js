const path =
  require("path");

const {
  PROJECT_MANIFEST_NAME,
} =
  require(
    "../project/contract",
  );

const {
  readProjectManifest,
} =
  require(
    "../project/persistence",
  );

const {
  readRecents,
} =
  require(
    "../recents",
  );


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


async function getProjectMetadata(
  params = {},
) {
  const projectRoot =
    cleanProjectRoot(
      params.projectRoot,
    );


  const manifestPath =
    path.join(
      projectRoot,
      PROJECT_MANIFEST_NAME,
    );


  const {
    manifest,
  } =
    await readProjectManifest(
      manifestPath,
    );


  const recents =
    await readRecents();


  const recent =
    recents.find(
      (
        item,
      ) =>
        path.resolve(
          item.projectRoot,
        ) ===
        projectRoot,
    );


  return {
    id:
      manifest.id ??
      undefined,

    name:
      manifest.name ??
      path.basename(
        projectRoot,
      ),

    projectRoot,

    schemaVersion:
      Number(
        manifest.schemaVersion ??
        1,
      ),

    createdAt:
      manifest.createdAt ??
      undefined,

    updatedAt:
      manifest.updatedAt ??
      undefined,

    lastOpenedAt:
      recent?.lastOpenedAt ??
      undefined,
  };
}


async function listProjectRecents() {
  const recents =
    await readRecents();


  return recents.map(
    (
      item,
    ) => ({
      projectRoot:
        item.projectRoot,

      name:
        item.name,

      lastOpenedAt:
        item.lastOpenedAt,
    }),
  );
}


module.exports = {
  getProjectMetadata,
  listProjectRecents,
};
