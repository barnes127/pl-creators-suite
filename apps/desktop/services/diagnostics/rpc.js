function createRpcDiagnosticsSink(
  diagnostics,
) {
  async function persist(
    entry,
  ) {
    if (!diagnostics) return;

    await diagnostics.log({
      timestamp:
        entry.timestamp,

      level:
        entry.level,

      subsystem:
        entry.subsystem ||
        "rpc",

      event:
        entry.event,

      correlationId:
        entry.correlationId,

      requestId:
        entry.requestId,

      message:
        entry.method
          ? `${entry.event}: ${entry.method}`
          : entry.event,

      details: entry,
    });

    if (
      entry.level === "error"
    ) {
      await diagnostics.problem({
        severity: "error",

        code:
          entry.errorCode ||
          "RPC_FAILURE",

        message:
          entry.method
            ? `RPC failure: ${entry.method}`
            : "RPC failure",

        subsystem: "rpc",

        correlationId:
          entry.correlationId,

        details: entry,
      });
    }
  }

  return {
    persist,
  };
}

module.exports = {
  createRpcDiagnosticsSink,
};
