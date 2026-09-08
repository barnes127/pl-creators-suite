const {
  readJsonFile,
  writeJsonFile,
  describeJsonValue,
} = require("../json");

function throwIfCancelled(context) {
  if (context.signal.aborted) {
    const error =
      new Error(
        "JSON operation cancelled",
      );

    error.name = "AbortError";
    throw error;
  }
}

const jsonFormatAdapter = {
  descriptor: {
    id: "data.json",
    displayName: "JSON",
    category: "data",
    extensions: [".json"],
    mimeTypes: [
      "application/json",
    ],
    direction: "both",
    supportsPreview: true,
    supportsCancellation: true,
    supportsRoundTrip: true,

    options: [
      {
        id: "indent",
        label: "Indentation",
        type: "number",
        defaultValue: 2,
      },
      {
        id: "overwrite",
        label: "Overwrite existing file",
        type: "boolean",
        defaultValue: false,
      },
    ],

    presets: [
      {
        id: "readable",
        label: "Readable",
        options: {
          indent: 2,
        },
      },
      {
        id: "compact",
        label: "Compact",
        options: {
          indent: 0,
        },
      },
    ],
  },

  async preview(request, context) {
    throwIfCancelled(context);

    context.reportProgress({
      phase: "reading",
      completed: 0,
      total: 1,
      message: "Reading JSON",
    });

    const value =
      await readJsonFile(
        request.sourcePath,
        {
          signal:
            context.signal,
        },
      );

    const description =
      describeJsonValue(value);

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message: "JSON preview ready",
    });

    return {
      summary:
        `JSON ${description.type}` +
        (
          description.count !== null
            ? ` with ${description.count} item(s)`
            : ""
        ),

      warnings: [],
      metadata: description,

      sample:
        Array.isArray(value)
          ? value.slice(0, 10)
          : value,
    };
  },

  async import(request, context) {
    throwIfCancelled(context);

    context.reportProgress({
      phase: "reading",
      completed: 0,
      total: 1,
      message: "Importing JSON",
    });

    const value =
      await readJsonFile(
        request.sourcePath,
        {
          signal:
            context.signal,
        },
      );

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message: "JSON imported",
    });

    return {
      value,
      warnings: [],
      metadata:
        describeJsonValue(value),
    };
  },

  async export(request, context) {
    throwIfCancelled(context);

    context.reportProgress({
      phase: "writing",
      completed: 0,
      total: 1,
      message: "Exporting JSON",
    });

    await writeJsonFile(
      request.destinationPath,
      request.value,
      {
        signal:
          context.signal,

        indent:
          request.options?.indent ??
          2,

        overwrite:
          request.options
            ?.overwrite === true,
      },
    );

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message: "JSON exported",
    });

    return {
      outputPath:
        request.destinationPath,

      warnings: [],
    };
  },
};

module.exports = {
  jsonFormatAdapter,
};
