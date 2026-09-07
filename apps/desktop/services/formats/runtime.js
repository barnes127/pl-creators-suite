const path = require("path");

class FormatAdapterNotFoundError
  extends Error {
  constructor(adapterId) {
    super(
      `Format adapter not found: ${adapterId}`,
    );

    this.name =
      "FormatAdapterNotFoundError";

    this.code =
      "FORMAT_ADAPTER_NOT_FOUND";

    this.adapterId =
      adapterId;
  }
}

class FormatOperationUnsupportedError
  extends Error {
  constructor(adapterId, operation) {
    super(
      `Format adapter ${adapterId} does not support ${operation}`,
    );

    this.name =
      "FormatOperationUnsupportedError";

    this.code =
      "FORMAT_OPERATION_UNSUPPORTED";

    this.adapterId =
      adapterId;

    this.operation =
      operation;
  }
}

function supportsDirection(
  descriptor,
  direction,
) {
  return (
    descriptor.direction === "both" ||
    descriptor.direction === direction
  );
}

class DesktopFormatRuntime {
  constructor() {
    this.adapters = new Map();
  }

  register(adapter) {
    const id =
      String(
        adapter?.descriptor?.id || "",
      ).trim();

    if (!id) {
      throw new Error(
        "Format adapter id is required",
      );
    }

    if (this.adapters.has(id)) {
      throw new Error(
        `Format adapter already registered: ${id}`,
      );
    }

    this.adapters.set(id, adapter);

    return adapter;
  }

  unregister(adapterId) {
    return this.adapters.delete(
      adapterId,
    );
  }

  get(adapterId) {
    return (
      this.adapters.get(adapterId) ||
      null
    );
  }

  list() {
    return Array.from(
      this.adapters.values(),
    );
  }

  resolveForPath(
    filePath,
    direction,
  ) {
    const extension =
      path.extname(
        String(filePath || ""),
      ).toLowerCase();

    return this.list().filter(
      (adapter) => {
        const descriptor =
          adapter.descriptor;

        const matchesExtension =
          descriptor.extensions.some(
            (candidate) =>
              candidate
                .toLowerCase() ===
              extension,
          );

        return (
          matchesExtension &&
          (
            !direction ||
            supportsDirection(
              descriptor,
              direction,
            )
          )
        );
      },
    );
  }

  async execute(
    operation,
    adapterId,
    request,
    context,
  ) {
    const adapter =
      this.get(adapterId);

    if (!adapter) {
      throw new FormatAdapterNotFoundError(
        adapterId,
      );
    }

    const handler =
      adapter[operation];

    if (
      typeof handler !== "function"
    ) {
      throw new FormatOperationUnsupportedError(
        adapterId,
        operation,
      );
    }

    return handler.call(
      adapter,
      request,
      context,
    );
  }

  preview(
    adapterId,
    request,
    context,
  ) {
    return this.execute(
      "preview",
      adapterId,
      request,
      context,
    );
  }

  import(
    adapterId,
    request,
    context,
  ) {
    return this.execute(
      "import",
      adapterId,
      request,
      context,
    );
  }

  export(
    adapterId,
    request,
    context,
  ) {
    return this.execute(
      "export",
      adapterId,
      request,
      context,
    );
  }
}

module.exports = {
  DesktopFormatRuntime,
  FormatAdapterNotFoundError,
  FormatOperationUnsupportedError,
};
