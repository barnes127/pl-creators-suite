const {
  PROJECT_MANIFEST_NAME,
} = require(
  "../../project/contract",
);

const {
  listZipArchiveEntries,
  validateArchiveEntries,
} = require("../archive");

const projectPackageFormatAdapter = {
  descriptor: {
    id: "project.plproj",
    displayName:
      "PL Creators Suite Project",
    category: "project",
    extensions: [".plproj"],
    mimeTypes: [],
    direction: "both",
    supportsPreview: true,
    supportsCancellation: true,
    supportsRoundTrip: true,
  },

  async preview(request, context) {
    context.reportProgress({
      phase: "inspecting",
      completed: 0,
      total: 1,
      message:
        "Inspecting project package",
    });

    const entries =
      await listZipArchiveEntries(
        request.sourcePath,
        {
          signal:
            context.signal,
        },
      );

    validateArchiveEntries(entries);

    const warnings = [];

    if (
      !entries.includes(
        PROJECT_MANIFEST_NAME,
      )
    ) {
      warnings.push({
        code:
          "PROJECT_MANIFEST_MISSING",

        message:
          "Project package does not contain a root manifest.",
      });
    }

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message:
        "Project package preview ready",
    });

    return {
      summary:
        `PL project package with ${entries.length} archive entries`,

      warnings,

      metadata: {
        entryCount:
          entries.length,

        hasManifest:
          entries.includes(
            PROJECT_MANIFEST_NAME,
          ),
      },

      sample:
        entries.slice(0, 25),
    };
  },

  async import(request, context) {
    context.reportProgress({
      phase: "importing",
      completed: 0,
      total: 1,
      message:
        "Importing project package",
    });

    const {projectImport} = require("../../projects");

    const result =
      await projectImport({
        filePath:
          request.sourcePath,

        baseDir:
          request.destinationPath,
      });

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message:
        "Project package imported",
    });

    return {
      value: result,
      warnings: [],

      outputPaths: [
        result.projectRoot,
      ],
    };
  },

  async export(request, context) {
    const projectRoot =
      typeof request.value === "string"
        ? request.value
        : request.value?.projectRoot;

    if (!projectRoot) {
      throw new Error(
        "Project export requires projectRoot",
      );
    }

    context.reportProgress({
      phase: "exporting",
      completed: 0,
      total: 1,
      message:
        "Exporting project package",
    });

    const {projectExport} = require("../../projects");

    const result =
      await projectExport({
        projectRoot,

        outPath:
          request.destinationPath,
      });

    context.reportProgress({
      phase: "complete",
      completed: 1,
      total: 1,
      message:
        "Project package exported",
    });

    return {
      outputPath:
        result.outPath,

      warnings: [],
    };
  },
};

module.exports = {
  projectPackageFormatAdapter,
};
