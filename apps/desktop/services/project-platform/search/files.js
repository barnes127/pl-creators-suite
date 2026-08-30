const path =
  require("path");

const {
  readProjectIndex,
} =
  require(
    "../indexing",
  );

const {
  readSearchableText,
} =
  require(
    "./text",
  );

const {
  inferSearchKind,
} =
  require(
    "./classify",
  );


function scoreTextMatch(
  query,
  value,
) {
  const normalizedQuery =
    query.toLowerCase();


  const normalizedValue =
    value.toLowerCase();


  if (
    normalizedValue ===
    normalizedQuery
  ) {
    return 100;
  }


  if (
    normalizedValue.startsWith(
      normalizedQuery,
    )
  ) {
    return 75;
  }


  if (
    normalizedValue.includes(
      normalizedQuery,
    )
  ) {
    return 50;
  }


  return 0;
}


function createPreview(
  line,
  column,
  queryLength,
) {
  const start =
    Math.max(
      0,
      column -
      40,
    );


  const end =
    Math.min(
      line.length,
      column +
      queryLength +
      80,
    );


  return line
    .slice(
      start,
      end,
    )
    .trim();
}


async function searchIndexedFiles(
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


  const kinds =
    Array.isArray(
      params.kinds,
    )
      ? new Set(
          params.kinds,
        )
      : null;


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
    return [];
  }


  cancellationToken
    ?.throwIfCancelled();


  const index =
    await readProjectIndex(
      projectRoot,
    );


  const results =
    [];


  const normalizedQuery =
    query.toLowerCase();


  for (
    const record
    of Object.values(
      index.files,
    )
  ) {
    cancellationToken
      ?.throwIfCancelled();


    const relativePath =
      record.relativePath;


    const kind =
      inferSearchKind(
        relativePath,
      );


    if (
      kinds &&
      !kinds.has(
        kind,
      ) &&
      !kinds.has(
        "file",
      )
    ) {
      continue;
    }


    const fileName =
      path.basename(
        relativePath,
      );


    const pathScore =
      Math.max(
        scoreTextMatch(
          query,
          fileName,
        ),

        scoreTextMatch(
          query,
          relativePath,
        ),
      );


    if (
      pathScore >
      0
    ) {
      results.push({
        id:
          `file:${relativePath}`,

        kind,

        title:
          fileName,

        subtitle:
          relativePath,

        projectRelativePath:
          relativePath,

        score:
          pathScore,

        sourceId:
          "project-files",

        metadata: {
          contentHash:
            record.contentHash,
        },
      });
    }


    if (
      results.length >=
      limit
    ) {
      break;
    }


    const absolutePath =
      path.join(
        projectRoot,
        relativePath,
      );


    let content;


    try {
      content =
        await readSearchableText(
          absolutePath,
        );
    } catch {
      continue;
    }


    if (
      content ===
      null
    ) {
      continue;
    }


    const lines =
      content.split(
        /\r?\n/,
      );


    for (
      let index =
        0;
      index <
        lines.length;
      index +=
        1
    ) {
      cancellationToken
        ?.throwIfCancelled();


      const line =
        lines[
          index
        ];


      const column =
        line
          .toLowerCase()
          .indexOf(
            normalizedQuery,
          );


      if (
        column <
        0
      ) {
        continue;
      }


      results.push({
        id:
          `content:${relativePath}:${index + 1}:${column + 1}`,

        kind,

        title:
          fileName,

        subtitle:
          relativePath,

        projectRelativePath:
          relativePath,

        line:
          index +
          1,

        column:
          column +
          1,

        preview:
          createPreview(
            line,
            column,
            query.length,
          ),

        score:
          60,

        sourceId:
          "project-files",

        metadata: {
          contentHash:
            record.contentHash,
        },
      });


      if (
        results.length >=
        limit
      ) {
        break;
      }
    }


    if (
      results.length >=
      limit
    ) {
      break;
    }
  }


  return results
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
}


module.exports = {
  scoreTextMatch,
  createPreview,
  searchIndexedFiles,
};
