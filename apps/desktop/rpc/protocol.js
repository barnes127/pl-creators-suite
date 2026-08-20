const crypto = require("crypto");

const {
  RpcInvalidRequestError,
} = require("./errors");

const JSON_RPC_VERSION = "2.0";

function validateRpcRequest(message) {
  if (
    !message ||
    typeof message !== "object" ||
    Array.isArray(message)
  ) {
    throw new RpcInvalidRequestError(
      "RPC request must be an object",
    );
  }

  if (
    message.jsonrpc !== undefined &&
    message.jsonrpc !== JSON_RPC_VERSION
  ) {
    throw new RpcInvalidRequestError(
      `Unsupported JSON-RPC version: ${message.jsonrpc}`,
    );
  }

  if (
    typeof message.method !== "string" ||
    !message.method.trim()
  ) {
    throw new RpcInvalidRequestError(
      "RPC request requires a method",
    );
  }

  if (
    message.params !== undefined &&
    (
      typeof message.params !== "object" ||
      message.params === null ||
      Array.isArray(message.params)
    )
  ) {
    throw new RpcInvalidRequestError(
      "RPC params must be an object when supplied",
    );
  }

  return {
    jsonrpc: JSON_RPC_VERSION,
    id: message.id ?? null,
    method: message.method,
    params: message.params ?? {},
  };
}

function createCorrelationId() {
  return crypto.randomUUID();
}

function makeRpcSuccess(
  id,
  result,
  correlationId,
) {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id: id ?? null,
    result,
    meta: {
      correlationId,
    },
  };
}

function makeRpcFailure(
  id,
  error,
  correlationId,
) {
  return {
    jsonrpc: JSON_RPC_VERSION,
    id: id ?? null,
    error,
    meta: {
      correlationId,
    },
  };
}

module.exports = {
  JSON_RPC_VERSION,
  validateRpcRequest,
  createCorrelationId,
  makeRpcSuccess,
  makeRpcFailure,
};
