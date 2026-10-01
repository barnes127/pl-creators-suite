function createDiagnosticsHealthCollector(diagnostics) {
  if (
    !diagnostics ||
    typeof diagnostics.health !==
    "function"
  ) {
    throw new Error("Diagnostics service is required.");
  }
  return {
    id: "diagnostics",
    displayName: "Diagnostics",
    category: "diagnostics",
    owner: "desktop-diagnostics",
    async collect() {
      const health =
        await diagnostics.health();
      const findings = [];
      if (health.failedJobs > 0) {
        findings.push({
          id: "diagnostics.failed-jobs",
          severity: "warning",
          status: "degraded",
          title: "Failed tasks detected",
          summary: `${health.failedJobs} task(s) are currently recorded as failed.`,
          owner: "desktop-diagnostics",
          suggestedActions: [],
          logRefs: [],
          resourceRefs: [],
        });
      }
      if (health.interruptedJobs > 0) {
        findings.push({
          id: "diagnostics.interrupted-jobs",
          severity: "warning",
          status: "degraded",
          title: "Interrupted tasks detected",
          summary: `${health.interruptedJobs} task(s) were interrupted before completion.`,
          owner: "desktop-diagnostics",
          suggestedActions: [],
          logRefs: [],
          resourceRefs: [],
        });
      }
      const degraded = findings.length > 0;
      return {
        source: {
          id: "diagnostics",
          displayName: "Diagnostics",
          category: "diagnostics",
          owner: "desktop-diagnostics",
          status:
            degraded
              ? "degraded"
              : "healthy",
          severity:
            degraded
              ? "warning"
              : health.activeJobs > 0
                ? "info"
                : "healthy",
          summary:
            degraded
              ? "Diagnostics detected task failures or interruptions."
              : "Diagnostics service is operational.",
          details: {...health},
        },
        findings,
      };
    },
  };
}

module.exports = {
  createDiagnosticsHealthCollector,
};
