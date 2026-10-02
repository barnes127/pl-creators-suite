function createSyncHealthCollector() {
  return {
    id: "sync",
    displayName: "Synchronization",
    category: "sync",
    owner: "creator-platform",
    async collect() {
      return {
        source: {
          id: "sync",
          displayName: "Synchronization",
          category: "sync",
          owner: "creator-platform",
          status: "disabled",
          severity: "healthy",
          summary: "Suite is operating in local-only mode.",
          details: {
            mode: "local-only",
            providerConfigured: false,
          },
        },
        findings: [],
      };
    },
  };
}
function createEngineHealthCollector() {
  return {
    id: "engines",
    displayName: "Engine Health",
    category: "engine",
    owner: "engine-platform",
    async collect() {
      return {
        source: {
          id: "engines",
          displayName: "Engine Health",
          category: "engine",
          owner: "engine-platform",
          status: "unavailable",
          severity: "unknown",
          summary: "Shared engine health aggregation is not yet registered.",
          details: {
            centralizedProvider: false,
            reason: "Current engine diagnostics remain slice-local.",
          },
        },
        findings: [],
      };
    },
  };
}
module.exports = {
  createSyncHealthCollector,
  createEngineHealthCollector,
};
