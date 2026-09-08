const fs = require("fs/promises");
const path = require("path");

const {
  writeTextFileSafely,
} = require("./output");

const {
  throwIfAborted,
} = require("./archive");

class JsonFormatError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "JsonFormatError";
    this.code = "JSON_FORMAT_ERROR";
    this.details = details;
  }
}

async function readJsonFile(
  filePath,
  options = {},
) {
  throwIfAborted(options.signal);

  const raw =
    await fs.readFile(
      filePath,
      "utf8",
    );

  throwIfAborted(options.signal);

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new JsonFormatError(
      `Invalid JSON in ${filePath}: ${error.message}`,
      {
        filePath,
        cause: error.message,
      },
    );
  }
}

async function writeJsonFile(
  filePath,
  value,
  options = {},
) {
  throwIfAborted(options.signal);

  const indent =
    Number.isInteger(options.indent)
      ? options.indent
      : 2;

  const serialized =
    JSON.stringify(
      value,
      null,
      indent,
    ) +
    (options.trailingNewline === false
      ? ""
      : "\n");

  await writeTextFileSafely(
    filePath,
    serialized,
    {
      signal:
        options.signal,

      overwrite:
        options.overwrite === true,
    },
  );

  return filePath;
}

function describeJsonValue(value) {
  if (Array.isArray(value)) {
    return {
      type: "array",
      count: value.length,
    };
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return {
      type: "object",
      count:
        Object.keys(value).length,
    };
  }

  return {
    type:
      value === null
        ? "null"
        : typeof value,

    count: null,
  };
}

module.exports = {
  JsonFormatError,
  readJsonFile,
  writeJsonFile,
  describeJsonValue,
};
