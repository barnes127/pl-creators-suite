const {
  searchIndexedFiles,
} =
  require(
    "./files",
  );

const {
  searchAssets,
} =
  require(
    "./assets",
  );

const {
  inferSearchKind,
} =
  require(
    "./classify",
  );

const {
  readSearchableText,
} =
  require(
    "./text",
  );


const SUPPORTED_SEARCH_KINDS = [
  "file",
  "document",
  "cell",
  "symbol",
  "asset",
  "scene",
  "shot",
  "task",
  "workflow",
  "extension",
];


async function searchProject(
  params = {},
) {
  const projectRoot =
    String(
      params.projectRoot ||
      "",
    ).trim();


  const query =
    String(
      params.query ||
      "",
    ).trim();


  const cancellationToken =
    params.cancellationToken;


  const limit =
    Math.max(
      1,
      Number(
        params.limit ||
        100,
      ),
    );


  if (
    !projectRoot
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  if (
    !query
  ) {
    return {
      query,

      results:
        [],

      count:
        0,
    };
  }


  cancellationToken
    ?.throwIfCancelled();


  const kinds =
    Array.isArray(
      params.kinds,
    )
      ? params.kinds
      : undefined;


  const wantsAssets =
    !kinds ||
    kinds.includes(
      "asset",
    );


  const [
    fileResults,
    assetResults,
  ] =
    await Promise.all([
      searchIndexedFiles({
        projectRoot,

        query,

        kinds,

        limit,

        cancellationToken,
      }),

      wantsAssets
        ? searchAssets({
            projectRoot,

            query,

            cancellationToken,
          })
        : Promise.resolve(
            [],
          ),
    ]);


  cancellationToken
    ?.throwIfCancelled();


  const results =
    [
      ...fileResults,
      ...assetResults,
    ]
      .sort(
        (
          left,
          right,
        ) =>
          (
            right.score ??
            0
          ) -
          (
            left.score ??
            0
          ),
      )
      .slice(
        0,
        limit,
      );


  return {
    query,

    results,

    count:
      results.length,
  };
}


module.exports = {
  SUPPORTED_SEARCH_KINDS,
  inferSearchKind,
  readSearchableText,
  searchIndexedFiles,
  searchAssets,
  searchProject,
};
