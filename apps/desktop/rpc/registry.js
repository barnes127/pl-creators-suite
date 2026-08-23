const path = require("path");

const projects =
  require("../services/projects");

const dialogs =
  require("../services/dialogs");

const plugins =
  require("../services/plugins/registry");

const pluginManifest =
  require("../services/plugins/manifest");

const pluginDiscovery =
  require("../services/plugins/discovery");

const entitlements =
  require("../services/entitlements");

const localAi =
  require("../services/ai/local");

const appMetadata =
  require("../services/app/metadata");

const assets =
  require("../services/assets");

const docs =
  require("../services/docs");

const code =
  require("../services/code");

const sheets =
  require("../services/sheets");

const movies =
  require("../services/movies");

const models =
  require("../services/models");

const games =
  require("../services/games");

const workflows =
  require("../services/workflows");


function createRpcMethods({
  logsExport,
  recentList,
  recentAdd,
  cancelRequest,
}) {
  return Object.freeze({
    "rpc.cancel":
      async (params) =>
        cancelRequest(
          params?.requestId,
        ),

    "project.create":
      projects.projectCreate,

    "project.open":
      projects.projectOpen,

    "project.export":
      projects.projectExport,

    "project.import":
      projects.projectImport,

    "logs.export":
      logsExport,

    "recent.list":
      recentList,

    "recent.add":
      recentAdd,

    "assets.import":
      async (params) =>
        assets.importAsset(params),

    "assets.register":
      async (params) =>
        assets.registerAsset(params),

    "assets.ensure":
      async (params) =>
        assets.ensureAssetStorage(
          params?.projectRoot,
        ),

    "assets.list":
      async (params) =>
        assets.listAssets(params),

    "assets.detectType":
      async (params) => ({
        type:
          assets.detectAssetType(
            params?.filePath,
          ),
      }),

    "app.metadata":
      async () => ({
        metadata:
          await appMetadata
            .getAppMetadata(),
      }),

    "ai.local.status":
      async () => ({
        status:
          await localAi
            .getLocalAiStatus(),
      }),

    "ai.local.chat":
      async (params, context) =>
        localAi.chat(params, context),

    "entitlements.flags":
      async () => ({
        flags:
          await entitlements
            .getFeatureFlags(),
      }),

    "plugins.list":
      async () => ({
        plugins:
          await plugins.listPlugins(),
      }),

    "plugins.setEnabled":
      async (params) => {
        const plugin =
          await plugins
            .setPluginEnabled(
              params?.pluginId,
              params?.enabled,
            );

        return {
          plugin,
          plugins:
            await plugins
              .listPlugins(),
        };
      },

    "plugins.refreshDiscovered":
      async () => {
        const repoRoot =
          path.resolve(
            __dirname,
            "../../..",
          );

        return pluginDiscovery
          .refreshDiscoveredPlugins(
            repoRoot,
          );
      },

    "plugins.validateManifest":
      async (params) =>
        pluginManifest
          .validateManifest(
            params?.manifest,
          ),

    "dialog.openProjectFolder":
      async () => {
        const folder =
          await dialogs
            .openProjectFolder();

        if (!folder) {
          return {
            canceled: true,
          };
        }

        return {
          canceled: false,
          projectRoot: folder,
        };
      },

    "dialog.openPlproj":
      async () => {
        const file =
          await dialogs
            .openPlprojFile();

        if (!file) {
          return {
            canceled: true,
          };
        }

        return {
          canceled: false,
          filePath: file,
        };
      },

    "dialog.savePlproj":
      async (params) => {
        const name =
          params?.defaultName ||
          "project.plproj";

        const file =
          await dialogs
            .savePlprojFile(name);

        if (!file) {
          return {
            canceled: true,
          };
        }

        return {
          canceled: false,
          filePath: file,
        };
      },

    "dialog.openAssetFile":
      async () => {
        const file =
          await dialogs
            .openAssetFile();

        if (!file) {
          return {
            canceled: true,
          };
        }

        return {
          canceled: false,
          filePath: file,
        };
      },

    "docs.ensure":
      async (params) =>
        docs.ensureDocsStorage(
          params?.projectRoot,
        ),

    "docs.list":
      async (params) =>
        docs.listDocs(params),

    "docs.create":
      async (params) =>
        docs.createDoc(params),

    "docs.read":
      async (params) =>
        docs.readDoc(params),

    "docs.save":
      async (params) =>
        docs.saveDoc(params),

    "code.ensure":
      async (params) =>
        code.ensureCodeStorage(
          params?.projectRoot,
        ),

    "code.list":
      async (params) =>
        code.listCodeFiles(params),

    "code.create":
      async (params) =>
        code.createCodeFile(params),

    "code.read":
      async (params) =>
        code.readCodeFile(params),

    "code.save":
      async (params) =>
        code.saveCodeFile(params),

    "sheets.ensure":
      async (params) =>
        sheets.ensureSheetsStorage(
          params?.projectRoot,
        ),

    "sheets.list":
      async (params) =>
        sheets.listSheets(params),

    "sheets.create":
      async (params) =>
        sheets.createSheet(params),

    "sheets.read":
      async (params) =>
        sheets.readSheet(params),

    "sheets.save":
      async (params) =>
        sheets.saveSheet(params),

    "movies.ensure":
      async (params) =>
        movies.ensureMoviesStorage(
          params?.projectRoot,
        ),

    "movies.list":
      async (params) =>
        movies.listMovies(params),

    "movies.create":
      async (params) =>
        movies.createMovie(params),

    "movies.read":
      async (params) =>
        movies.readMovie(params),

    "movies.save":
      async (params) =>
        movies.saveMovie(params),

    "models.ensure":
      async (params) =>
        models.ensureModelsStorage(
          params?.projectRoot,
        ),

    "models.list":
      async (params) =>
        models.listModels(params),

    "models.create":
      async (params) =>
        models.createModel(params),

    "models.read":
      async (params) =>
        models.readModel(params),

    "models.save":
      async (params) =>
        models.saveModel(params),

    "games.ensure":
      async (params) =>
        games.ensureGamesStorage(
          params?.projectRoot,
        ),

    "games.list":
      async (params) =>
        games.listGames(params),

    "games.create":
      async (params) =>
        games.createGame(params),

    "games.read":
      async (params) =>
        games.readGame(params),

    "games.save":
      async (params) =>
        games.saveGame(params),

    "workflows.ensure":
      async (params) =>
        workflows
          .ensureWorkflowsStorage(
            params?.projectRoot,
          ),

    "workflows.list":
      async (params) =>
        workflows
          .listWorkflows(params),

    "workflows.create":
      async (params) =>
        workflows
          .createWorkflow(params),

    "workflows.read":
      async (params) =>
        workflows
          .readWorkflow(params),

    "workflows.save":
      async (params) =>
        workflows
          .saveWorkflow(params),

    "workflows.delete":
      async (params) =>
        workflows
          .deleteWorkflow(params),
  });
}


const METHOD_POLICIES =
  Object.freeze({
    "app.metadata": {
      timeoutMs: 5000,
    },

    "ai.local.status": {
      timeoutMs: 5000,
    },

    "ai.local.chat": {
      timeoutMs: 125000,
    },

    "entitlements.flags": {
      timeoutMs: 5000,
    },

    "plugins.list": {
      timeoutMs: 5000,
    },

    "recent.list": {
      timeoutMs: 5000,
    },

    "assets.list": {
      timeoutMs: 10000,
    },

    "docs.list": {
      timeoutMs: 10000,
    },

    "code.list": {
      timeoutMs: 10000,
    },

    "sheets.list": {
      timeoutMs: 10000,
    },

    "movies.list": {
      timeoutMs: 10000,
    },

    "models.list": {
      timeoutMs: 10000,
    },

    "games.list": {
      timeoutMs: 10000,
    },

    "workflows.list": {
      timeoutMs: 10000,
    },
  });


module.exports = {
  createRpcMethods,
  METHOD_POLICIES,
};
