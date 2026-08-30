const {
  buildProjectTree,
} =
  require(
    "./tree",
  );

const {
  getProjectMetadata,
  listProjectRecents,
} =
  require(
    "./projects",
  );

const {
  inspectAssets,
  repairMissingAsset,
} =
  require(
    "./assets",
  );


async function inspectProject(
  params = {},
) {
  const [
    metadata,
    tree,
    assetInspection,
  ] =
    await Promise.all([
      getProjectMetadata(
        params,
      ),

      buildProjectTree(
        params,
      ),

      inspectAssets(
        params,
      ),
    ]);


  return {
    metadata,

    tree,

    assets:
      assetInspection.assets,

    missingAssets:
      assetInspection.missing,
  };
}


module.exports = {
  buildProjectTree,
  getProjectMetadata,
  listProjectRecents,
  inspectAssets,
  repairMissingAsset,
  inspectProject,
};
