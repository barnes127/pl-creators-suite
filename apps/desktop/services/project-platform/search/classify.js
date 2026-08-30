const path =
  require("path");


function inferSearchKind(
  relativePath,
) {
  const normalized =
    String(
      relativePath ||
      "",
    )
      .replace(
        /\\/g,
        "/",
      )
      .toLowerCase();


  const extension =
    path.extname(
      normalized,
    );


  if (
    normalized.includes(
      "/extensions/",
    ) ||
    normalized.startsWith(
      "extensions/",
    )
  ) {
    return "extension";
  }


  if (
    normalized.includes(
      "/workflows/",
    ) ||
    normalized.startsWith(
      "workflows/",
    )
  ) {
    return "workflow";
  }


  if (
    normalized.includes(
      "/tasks/",
    ) ||
    normalized.startsWith(
      "tasks/",
    )
  ) {
    return "task";
  }


  if (
    normalized.includes(
      "/shots/",
    ) ||
    normalized.startsWith(
      "shots/",
    )
  ) {
    return "shot";
  }


  if (
    normalized.includes(
      "/scenes/",
    ) ||
    normalized.startsWith(
      "scenes/",
    )
  ) {
    return "scene";
  }


  if (
    [
      ".md",
      ".txt",
      ".doc",
      ".docx",
      ".rtf",
    ].includes(
      extension,
    )
  ) {
    return "document";
  }


  if (
    [
      ".csv",
      ".tsv",
    ].includes(
      extension,
    )
  ) {
    return "cell";
  }


  if (
    [
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
    ].includes(
      extension,
    )
  ) {
    return "symbol";
  }


  return "file";
}


module.exports = {
  inferSearchKind,
};
