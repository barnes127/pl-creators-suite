const {
  inspectAssets,
} =
  require(
    "../assets",
  );

const {
  scoreTextMatch,
} =
  require(
    "./files",
  );


async function searchAssets(
  params = {},
) {
  const query =
    String(
      params.query ||
      "",
    ).trim();


  if (
    !query
  ) {
    return [];
  }


  params
    .cancellationToken
    ?.throwIfCancelled();


  const inspection =
    await inspectAssets({
      projectRoot:
        params.projectRoot,
    });


  const results =
    [];


  for (
    const asset
    of inspection.assets
  ) {
    params
      .cancellationToken
      ?.throwIfCancelled();


    const score =
      Math.max(
        scoreTextMatch(
          query,
          asset.name,
        ),

        scoreTextMatch(
          query,
          asset.relativePath,
        ),
      );


    if (
      score ===
      0
    ) {
      continue;
    }


    results.push({
      id:
        `asset:${asset.id}`,

      kind:
        "asset",

      title:
        asset.name,

      subtitle:
        asset.relativePath,

      projectRelativePath:
        asset.relativePath,

      score,

      sourceId:
        "project-assets",

      metadata: {
        assetId:
          asset.id,

        assetKind:
          asset.kind,

        state:
          asset.state,

        ownership:
          asset.ownership,
      },
    });
  }


  return results;
}


module.exports = {
  searchAssets,
};
