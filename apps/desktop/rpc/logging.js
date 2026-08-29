function sanitizeValue(
  value,
) {
  if (
    value === undefined
  ) {
    return null;
  }

  return value;
}


function createRpcLogger({
  sink = console,
  now =
    () =>
      new Date()
        .toISOString(),
} = {}) {
  function write(
    level,
    event,
  ) {
    const entry = {
      timestamp:
        now(),

      level,

      subsystem:
        "rpc",

      ...event,
    };

    const line =
      JSON.stringify(
        entry,
      );

    if (
      level === "error" &&
      typeof sink.error ===
        "function"
    ) {
      sink.error(line);
      return entry;
    }

    if (
      level === "warn" &&
      typeof sink.warn ===
        "function"
    ) {
      sink.warn(line);
      return entry;
    }

    if (
      typeof sink.log ===
      "function"
    ) {
      sink.log(line);
    }

    return entry;
  }


  function request({
    correlationId,
    requestId,
    method,
  }) {
    return write(
      "info",
      {
        event:
          "request",

        correlationId:
          sanitizeValue(
            correlationId,
          ),

        requestId:
          sanitizeValue(
            requestId,
          ),

        method:
          sanitizeValue(
            method,
          ),
      },
    );
  }


  function progress({
    correlationId,
    method,
    progress,
  }) {
    return write(
      "info",
      {
        event:
          "progress",

        correlationId:
          sanitizeValue(
            correlationId,
          ),

        method:
          sanitizeValue(
            method,
          ),

        phase:
          sanitizeValue(
            progress?.phase,
          ),

        percent:
          sanitizeValue(
            progress?.percent,
          ),

        message:
          sanitizeValue(
            progress?.message,
          ),
      },
    );
  }


  function success({
    correlationId,
    requestId,
    method,
  }) {
    return write(
      "info",
      {
        event:
          "success",

        correlationId:
          sanitizeValue(
            correlationId,
          ),

        requestId:
          sanitizeValue(
            requestId,
          ),

        method:
          sanitizeValue(
            method,
          ),
      },
    );
  }


  function failure({
    correlationId,
    requestId,
    method,
    error,
  }) {
    return write(
      "error",
      {
        event:
          "failure",

        correlationId:
          sanitizeValue(
            correlationId,
          ),

        requestId:
          sanitizeValue(
            requestId,
          ),

        method:
          sanitizeValue(
            method,
          ),

        errorType:
          sanitizeValue(
            error?.type,
          ),

        errorCode:
          sanitizeValue(
            error?.code,
          ),

        retryable:
          error?.retryable ===
          true,
      },
    );
  }


  return {
    request,
    progress,
    success,
    failure,
  };
}


module.exports = {
  createRpcLogger,
};
