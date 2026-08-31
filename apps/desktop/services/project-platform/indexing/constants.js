const INDEX_SCHEMA_VERSION =
  1;


const INDEX_DIR_NAME =
  ".pl-index";


const INDEX_FILE_NAME =
  "project-index.json";


const DEFAULT_IGNORED_NAMES =
  new Set([
    ".git",
    "node_modules",
    INDEX_DIR_NAME,
    ".pl-recovery",
  ]);


module.exports = {
  INDEX_SCHEMA_VERSION,
  INDEX_DIR_NAME,
  INDEX_FILE_NAME,
  DEFAULT_IGNORED_NAMES,
};
