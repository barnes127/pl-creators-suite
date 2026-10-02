function createLocalAiHealthCollector(localAi) {
  if (
    !localAi ||
    typeof localAi.getLocalAiStatus !== "function"
  ) {
    throw new Error("Local AI service is required.");
  }
  return {
    id: "local-ai",
    displayName: "Local AI",
    category: "ai",
    owner: "local-ai",
    async collect() {
      const status =
        await localAi
          .getLocalAiStatus();
      if (!status.available) {
        return {
          source: {
            id: "local-ai",
            displayName: "Local AI",
            category: "ai",
            owner: "local-ai",
            status:"disabled",
            severity: "healthy",
            summary: "Local AI provider is not currently available.",
            details: {
              provider: status.provider,
              available: false,
              model: status.model,
              modelCount: status.models?.length ?? 0,
              reason: status.reason || "",
              host: status.host || "",
            },
          },
          findings: [],
        };
      }
      const noModel = !status.model;
      return {
        source: {
          id: "local-ai",
          displayName: "Local AI",
          category: "ai",
          owner: "local-ai",
          status:
            noModel
              ? "degraded"
              : "healthy",

          severity:
            noModel
              ? "info"
              : "healthy",
          summary:
            noModel
              ? "Local AI provider is available, but no model is selected."
              : `Local AI is available through ${status.provider}.`,
          details: {
            provider: status.provider,
            available: true,
            model: status.model,
            modelCount: status.models?.length ?? 0,
            host: status.host || "",
          },
        },
        findings:
          noModel
            ? [
                {
                  id: "local-ai.no-model",
                  severity: "info",
                  status: "degraded",
                  title: "No local AI model available",
                  summary: "The local provider responded, but no model is currently available.",
                  owner: "local-ai",
                  suggestedActions: [],
                  logRefs: [],
                  resourceRefs: [],
                },
              ]
            : [],
      };
    },
  };
}
module.exports = {
  createLocalAiHealthCollector,
};
