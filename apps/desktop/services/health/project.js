function normalizeProjectRoot(
  context = {},
) {
  return String(
    context.projectRoot ||
    "",
  ).trim();
}


function createRecoveryHealthCollector(
  recovery,
) {
  if (
    !recovery ||
    typeof recovery.inspectRecoveryStatus !==
      "function"
  ) {
    throw new Error(
      "Project recovery service is required.",
    );
  }

  return {
    id:
      "project-recovery",

    displayName:
      "Project Recovery",

    category:
      "recovery",

    owner:
      "project-recovery",

    async collect(
      context = {},
    ) {
      const projectRoot =
        normalizeProjectRoot(
          context,
        );

      if (
        !projectRoot
      ) {
        return {
          source: {
            id:
              "project-recovery",

            displayName:
              "Project Recovery",

            category:
              "recovery",

            owner:
              "project-recovery",

            status:
              "disabled",

            severity:
              "healthy",

            summary:
              "No project is open.",

            details: {
              projectOpen:
                false,
            },
          },

          findings: [],
        };
      }

      const status =
        await recovery
          .inspectRecoveryStatus(
            projectRoot,
          );

      const interrupted =
        status.state ===
        "interrupted";

      const snapshotCount =
        status.entries.filter(
          (entry) =>
            entry.kind ===
              "snapshot" ||
            entry.kind ===
              "checkpoint",
        ).length;

      const findings = [];

      if (
        interrupted
      ) {
        findings.push({
          id:
            "project-recovery.interrupted",

          severity:
            "warning",

          status:
            "degraded",

          title:
            "Previous project session was interrupted",

          summary:
            status.recoverableCount >
              0
              ? "Recovery data is available for the interrupted project."
              : "The previous project session did not shut down cleanly.",

          owner:
            "project-recovery",

          details: {
            recoverableCount:
              status.recoverableCount,

            latestRecoveryAt:
              status.latestRecoveryAt,
          },

          suggestedActions: [
            {
              id:
                "open-recovery",

              label:
                "Open Recovery",

              kind:
                "navigate",
            },
          ],

          logRefs: [],

          resourceRefs: [
            {
              type:
                "project",

              id:
                projectRoot,
            },
          ],
        });
      }

      return {
        source: {
          id:
            "project-recovery",

          displayName:
            "Project Recovery",

          category:
            "recovery",

          owner:
            "project-recovery",

          status:
            interrupted
              ? "degraded"
              : "healthy",

          severity:
            interrupted
              ? "warning"
              : "healthy",

          summary:
            interrupted
              ? "Project recovery requires attention."
              : "Project recovery state is healthy.",

          details: {
            projectOpen:
              true,

            state:
              status.state,

            cleanShutdown:
              status.cleanShutdown,

            autosaveCount:
              status.autosaveCount,

            recoverableCount:
              status.recoverableCount,

            journalEntryCount:
              status.journalEntryCount,

            latestRecoveryAt:
              status.latestRecoveryAt,

            backup: {
              available:
                snapshotCount >
                0,

              snapshotCount,
            },
          },
        },

        findings,
      };
    },
  };
}


function createIndexHealthCollector(
  indexing,
) {
  if (
    !indexing ||
    typeof indexing.getIndexStatus !==
      "function"
  ) {
    throw new Error(
      "Project indexing service is required.",
    );
  }

  return {
    id:
      "project-index",

    displayName:
      "Project Index",

    category:
      "index",

    owner:
      "project-indexing",

    async collect(
      context = {},
    ) {
      const projectRoot =
        normalizeProjectRoot(
          context,
        );

      if (
        !projectRoot
      ) {
        return {
          source: {
            id:
              "project-index",

            displayName:
              "Project Index",

            category:
              "index",

            owner:
              "project-indexing",

            status:
              "disabled",

            severity:
              "healthy",

            summary:
              "No project is open.",

            details: {
              projectOpen:
                false,
            },
          },

          findings: [],
        };
      }

      const status =
        await indexing
          .getIndexStatus({
            projectRoot,
          });

      const stale =
        status.stale >
        0;

      return {
        source: {
          id:
            "project-index",

          displayName:
            "Project Index",

          category:
            "index",

          owner:
            "project-indexing",

          status:
            stale
              ? "degraded"
              : "healthy",

          severity:
            stale
              ? "info"
              : "healthy",

          summary:
            stale
              ? `${status.stale} project index change(s) are pending.`
              : "Project index is current.",

          details: {
            projectOpen:
              true,

            generatedAt:
              status.generatedAt,

            indexedFiles:
              status.indexedFiles,

            scannedFiles:
              status.scannedFiles,

            stale:
              status.stale,

            current:
              status.current,

            changes:
              status.changes,
          },
        },

        findings:
          stale
            ? [
                {
                  id:
                    "project-index.stale",

                  severity:
                    "info",

                  status:
                    "degraded",

                  title:
                    "Project index is stale",

                  summary:
                    `${status.stale} file change(s) have not yet been reflected in the stored index.`,

                  owner:
                    "project-indexing",

                  details: {
                    changes:
                      status.changes,
                  },

                  suggestedActions: [],
                  logRefs: [],

                  resourceRefs: [
                    {
                      type:
                        "project",

                      id:
                        projectRoot,
                    },
                  ],
                },
              ]
            : [],
      };
    },
  };
}


module.exports = {
  normalizeProjectRoot,
  createRecoveryHealthCollector,
  createIndexHealthCollector,
};
