const {
  DesktopFormatRuntime,
  FormatAdapterNotFoundError,
  FormatOperationUnsupportedError,
} = require("./runtime");

const {
  jsonFormatAdapter,
} = require("./adapters/json");

const {
  csvFormatAdapter,
} = require("./adapters/csv");

const {
  projectPackageFormatAdapter,
} = require(
  "./adapters/project-package",
);

function createDesktopFormatRuntime() {
  const runtime =
    new DesktopFormatRuntime();

  runtime.register(
    jsonFormatAdapter,
  );

  runtime.register(
    csvFormatAdapter,
  );

  runtime.register(
    projectPackageFormatAdapter,
  );

  return runtime;
}

const desktopFormatRuntime =
  createDesktopFormatRuntime();

module.exports = {
  DesktopFormatRuntime,
  FormatAdapterNotFoundError,
  FormatOperationUnsupportedError,
  createDesktopFormatRuntime,
  desktopFormatRuntime,
};
