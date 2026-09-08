const fs = require("fs/promises");

const {parseCsv, serializeCsv} = require("../csv");

const {writeTextFileSafely} = require("../output");

function throwIfCancelled(context) {
  if (context.signal.aborted) {
    const error =
      new Error(
        "CSV operation cancelled",
      );

    error.name = "AbortError";
    throw error;
  }
}

const csvFormatAdapter = {
  descriptor: {
    id: "data.csv",
    displayName: "CSV",
    category: "data",
    extensions: [".csv"],
    mimeTypes: [
      "text/csv",
    ],
    direction: "both",
    supportsPreview: true,
    supportsCancellation: true,
    supportsRoundTrip: true,

    options: [
      {
        id: "delimiter",
        label: "Delimiter",
        type: "select",
        defaultValue: ",",

        choices: [
          {
            value: ",",
            label: "Comma",
          },
          {
            value: ";",
            label: "Semicolon",
          },
          {
            value: "\t",
            label: "Tab",
          },
        ],
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
        id: "standard",
        label: "Standard CSV",
        options: {
          delimiter: ",",
        },
      },
      {
        id: "tab-separated",
        label: "Tab separated",
        options: {
          delimiter: "\t",
        },
      },
    ],
  },

  async preview(request, context) {
    throwIfCancelled(context);

    const raw =
      await fs.readFile(
        request.sourcePath,
        "utf8",
      );

    throwIfCancelled(context);

    const rows =
      parseCsv(
        raw,
        request.options,
      );

    return {
      summary:
        `CSV with ${rows.length} row(s)`,

      warnings: [],

      metadata: {
        rowCount:
          rows.length,

        columnCount:
          rows.reduce(
            (largest, row) =>
              Math.max(
                largest,
                row.length,
              ),
            0,
          ),
      },

      sample:
        rows.slice(0, 10),
    };
  },

  async import(request, context) {
    context.reportProgress({
      phase: "reading",
      completed: 0,
      total: 1,
      message: "Importing CSV",
    });

    throwIfCancelled(context);

    const raw =
      await fs.readFile(
        request.sourcePath,
        "utf8",
      );

    throwIfCancelled(context);

    const rows =
      parseCsv(
        raw,
        request.options,
      );

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message: "CSV imported",
    });

    return {
      value: rows,
      warnings: [],

      metadata: {
        rowCount:
          rows.length,
      },
    };
  },

  async export(request, context) {
    context.reportProgress({
      phase: "serializing",
      completed: 0,
      total: 2,
      message: "Serializing CSV",
    });

    throwIfCancelled(context);

    const serialized =
      serializeCsv(
        request.value,
        request.options,
      );

    context.reportProgress({
      phase: "writing",
      completed: 1,
      total: 2,
      message: "Writing CSV",
    });

    await writeTextFileSafely(
      request.destinationPath,
      `${serialized}\n`,
      {
        signal:
          context.signal,

        overwrite:
          request.options
            ?.overwrite === true,
      }
    );

    throwIfCancelled(context);

    context.reportProgress({
      phase: "complete",
      completed: 2,
      total: 2,
      message: "CSV exported",
    });

    return {
      outputPath:
        request.destinationPath,

      warnings: [],
    };
  },
};

module.exports = {
  csvFormatAdapter,
};
