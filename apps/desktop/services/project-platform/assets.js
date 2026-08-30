const fs =
  require("fs/promises");

const path =
  require("path");

const {
  readAssetRegistry,
  writeAssetRegistry,
} =
  require(
    "../assets",
  );


const LEGACY_KIND_MAP = {
  images:
    "image",

  audio:
    "audio",

  video:
    "video",

  models:
    "model",

  docs:
    "document",

  other:
    "other",
};


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


function resolveInsideProject(
  projectRoot,
  relativePath,
) {
  const root =
    cleanProjectRoot(
      projectRoot,
    );


  const cleanRelative =
    String(
      relativePath ||
      "",
    ).trim();


  if (
    !cleanRelative
  ) {
    throw new Error(
      "relativePath is required",
    );
  }


  if (
    path.isAbsolute(
      cleanRelative,
    )
  ) {
    throw new Error(
      "relativePath must be project-relative",
    );
  }


  const resolved =
    path.resolve(
      root,
      cleanRelative,
    );


  const relative =
    path.relative(
      root,
      resolved,
    );


  if (
    relative ===
      ".." ||
    relative.startsWith(
      `..${path.sep}`,
    ) ||
    path.isAbsolute(
      relative,
    )
  ) {
    throw new Error(
      "Asset path escapes project root",
    );
  }


  return resolved;
}


function toPlatformAsset(
  asset,
  exists,
) {
  const kind =
    LEGACY_KIND_MAP[
      asset.type
    ] ??
    "other";


  return {
    id:
      asset.id,

    name:
      asset.name,

    kind,

    relativePath:
      asset.relativePath,

    sourcePath:
      asset.sourcePath ||
      undefined,

    state:
      exists
        ? "embedded"
        : "missing",

    ownership:
      "source",

    createdAt:
      asset.createdAt,

    updatedAt:
      asset.updatedAt,

    references:
      [],
  };
}


async function fileExists(
  filePath,
) {
  try {
    await fs.access(
      filePath,
    );

    return true;
  } catch {
    return false;
  }
}


async function inspectAssets(
  params = {},
) {
  const projectRoot =
    cleanProjectRoot(
      params.projectRoot,
    );


  const registry =
    await readAssetRegistry(
      projectRoot,
    );


  const assets =
    [];


  for (
    const asset
    of registry.assets
  ) {
    const absolutePath =
      resolveInsideProject(
        projectRoot,
        asset.relativePath,
      );


    const exists =
      await fileExists(
        absolutePath,
      );


    assets.push(
      toPlatformAsset(
        asset,
        exists,
      ),
    );
  }


  return {
    assets,

    missing:
      assets.filter(
        (
          asset,
        ) =>
          asset.state ===
          "missing",
      ),
  };
}


async function repairMissingAsset(
  params = {},
) {
  const projectRoot =
    cleanProjectRoot(
      params.projectRoot,
    );


  const assetId =
    String(
      params.assetId ||
      "",
    ).trim();


  const replacementPath =
    String(
      params.replacementPath ||
      "",
    ).trim();


  const mode =
    params.mode ===
      "relink"
      ? "relink"
      : "replace";


  if (
    !assetId
  ) {
    throw new Error(
      "assetId is required",
    );
  }


  if (
    !replacementPath
  ) {
    throw new Error(
      "replacementPath is required",
    );
  }


  const replacementStats =
    await fs.stat(
      replacementPath,
    );


  if (
    !replacementStats.isFile()
  ) {
    throw new Error(
      "replacementPath must be a file",
    );
  }


  const registry =
    await readAssetRegistry(
      projectRoot,
    );


  const index =
    registry.assets.findIndex(
      (
        asset,
      ) =>
        asset.id ===
        assetId,
    );


  if (
    index <
    0
  ) {
    throw new Error(
      `Unknown asset: ${assetId}`,
    );
  }


  const existing =
    registry.assets[
      index
    ];


  let relativePath =
    existing.relativePath;


  if (
    mode ===
    "replace"
  ) {
    const targetPath =
      resolveInsideProject(
        projectRoot,
        existing.relativePath,
      );


    await fs.mkdir(
      path.dirname(
        targetPath,
      ),
      {
        recursive:
          true,
      },
    );


    await fs.copyFile(
      replacementPath,
      targetPath,
    );
  } else {
    const absoluteReplacement =
      path.resolve(
        replacementPath,
      );


    const projectRelative =
      path.relative(
        projectRoot,
        absoluteReplacement,
      );


    if (
      projectRelative ===
        ".." ||
      projectRelative.startsWith(
        `..${path.sep}`,
      ) ||
      path.isAbsolute(
        projectRelative,
      )
    ) {
      throw new Error(
        "Relink target must stay inside the project",
      );
    }


    relativePath =
      projectRelative.replace(
        /\\/g,
        "/",
      );
  }


  const now =
    new Date()
      .toISOString();


  const repaired = {
    ...existing,

    relativePath,

    sourcePath:
      replacementPath,

    updatedAt:
      now,
  };


  const assets = [
    ...registry.assets,
  ];


  assets[
    index
  ] =
    repaired;


  await writeAssetRegistry(
    projectRoot,
    {
      version:
        registry.version,

      assets,
    },
  );


  return {
    assetId,

    mode,

    relativePath,

    repaired:
      true,
  };
}


module.exports = {
  LEGACY_KIND_MAP,
  resolveInsideProject,
  inspectAssets,
  repairMissingAsset,
};
