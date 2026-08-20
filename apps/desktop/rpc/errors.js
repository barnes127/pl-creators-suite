class RpcError extends Error {
  constructor(
    message,
    {
      code = -32000,
      type = "RPC_ERROR",
      data = null,
      retryable = false,
      cause = null,
    } = {},
  ) {
    super(message);

    this.name = "RpcError";
    this.code = code;
    this.type = type;
    this.data = data;
    this.retryable = retryable;

    if (cause) {
      this.cause = cause;
    }
  }
}

class RpcInvalidRequestError extends RpcError {
  constructor(message = "Invalid RPC request", data = null) {
    super(message, {
      code: -32600,
      type: "INVALID_REQUEST",
      data,
    });
  }
}

class RpcMethodNotFoundError extends RpcError {
  constructor(method) {
    super(`Unknown RPC method: ${method}`, {
      code: -32601,
      type: "METHOD_NOT_FOUND",
      data: {
        method,
      },
    });
  }
}

class RpcInvalidParamsError extends RpcError {
  constructor(message = "Invalid RPC parameters", data = null) {
    super(message, {
      code: -32602,
      type: "INVALID_PARAMS",
      data,
    });
  }
}

class RpcTimeoutError extends RpcError {
  constructor(method, timeoutMs) {
    super(
      `RPC method "${method}" exceeded ${timeoutMs}ms`,
      {
        code: -32001,
        type: "TIMEOUT",
        retryable: true,
        data: {
          method,
          timeoutMs,
        },
      },
    );
  }
}

class RpcPermissionError extends RpcError {
  constructor(
    message = "RPC operation is not permitted",
    data = null,
  ) {
    super(message, {
      code: -32002,
      type: "PERMISSION_DENIED",
      data,
    });
  }
}

class RpcCancelledError extends RpcError {
  constructor(message = "RPC operation was cancelled") {
    super(message, {
      code: -32003,
      type: "CANCELLED",
    });
  }
}

function normalizeRpcError(error) {
  if (error instanceof RpcError) {
    return error;
  }

  return new RpcError(
    "Internal RPC error",
    {
      code: -32603,
      type: "INTERNAL_ERROR",
      retryable: false,
      cause: error,
    },
  );
}

function serializeRpcError(error) {
  const normalized =
    normalizeRpcError(error);

  return {
    code: normalized.code,
    message: normalized.message,
    data: {
      type: normalized.type,
      retryable:
        normalized.retryable === true,
      ...(normalized.data
        ? { details: normalized.data }
        : {}),
    },
  };
}

module.exports = {
  RpcError,
  RpcInvalidRequestError,
  RpcMethodNotFoundError,
  RpcInvalidParamsError,
  RpcTimeoutError,
  RpcPermissionError,
  RpcCancelledError,
  normalizeRpcError,
  serializeRpcError,
};
