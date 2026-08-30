const fs =
  require("fs/promises");

const path =
  require("path");


const MAX_SEARCHABLE_FILE_SIZE =
  2 *
  1024 *
  1024;


const TEXT_EXTENSIONS =
  new Set([
    ".txt",
    ".md",
    ".json",
    ".csv",
    ".tsv",

    ".js",
    ".jsx",
    ".ts",
    ".tsx",

    ".py",

    ".c",
    ".cc",
    ".cpp",
    ".h",
    ".hpp",

    ".cs",
    ".java",
    ".rs",

    ".html",
    ".css",
    ".scss",

    ".xml",
    ".yaml",
    ".yml",

    ".glsl",
    ".vert",
    ".frag",
  ]);


function isSearchableTextPath(
  filePath,
) {
  return TEXT_EXTENSIONS.has(
    path.extname(
      filePath,
    ).toLowerCase(),
  );
}


async function readSearchableText(
  filePath,
) {
  if (
    !isSearchableTextPath(
      filePath,
    )
  ) {
    return null;
  }


  const stats =
    await fs.stat(
      filePath,
    );


  if (
    stats.size >
    MAX_SEARCHABLE_FILE_SIZE
  ) {
    return null;
  }


  return fs.readFile(
    filePath,
    "utf8",
  );
}


module.exports = {
  MAX_SEARCHABLE_FILE_SIZE,
  TEXT_EXTENSIONS,
  isSearchableTextPath,
  readSearchableText,
};
