const {
  isHealthSeverity,
  isHealthStatus,
  isHealthCategory,
  getHighestHealthSeverity,
} = require("./types");


function requireNonEmptyString(
  value,
  field,
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${field} must be a non-empty string.`,
    );
  }

  return value;
}


function normalizeArray(
  value,
) {
  return Array.isArray(value)
    ? value
    : [];
}


function normalizeFinding(
  finding,
  source,
  observedAt,
) {
  requireNonEmptyString(
    finding.id,
    "Health finding id",
  );

  const severity =
    isHealthSeverity(
      finding.severity,
    )
      ? finding.severity
      : "unknown";

  return {
    id:
      finding.id,

    sourceId:
      source.id,

    severity,

    status:
      isHealthStatus(
        finding.status,
      )
        ? finding.status
        : source.status,

    title:
      requireNonEmptyString(
        finding.title,
        "Health finding title",
      ),

    summary:
      typeof finding.summary ===
      "string"
        ? finding.summary
        : "",

    owner:
      typeof finding.owner ===
      "string" &&
      finding.owner.trim()
        ? finding.owner
        : source.owner,

    observedAt:
      typeof finding.observedAt ===
      "string" &&
      finding.observedAt.trim()
        ? finding.observedAt
        : observedAt,

    details:
      finding.details &&
      typeof finding.details ===
      "object" &&
      !Array.isArray(
        finding.details,
      )
        ? finding.details
        : {},

    suggestedActions:
      normalizeArray(
        finding.suggestedActions,
      ),

    logRefs:
      normalizeArray(
        finding.logRefs,
      ),

    resourceRefs:
      normalizeArray(
        finding.resourceRefs,
      ),
  };
}


function normalizeSource(
  collector,
  result,
  observedAt,
) {
  const sourceInput =
    result?.source || {};

  const id =
    requireNonEmptyString(
      sourceInput.id ||
      collector.id,
      "Health source id",
    );

  const category =
    isHealthCategory(
      sourceInput.category ||
      collector.category,
    )
      ? (
          sourceInput.category ||
          collector.category
        )
      : "system";

  const status =
    isHealthStatus(
      sourceInput.status,
    )
      ? sourceInput.status
      : "unknown";

  const source = {
    id,

    displayName:
      sourceInput.displayName ||
      collector.displayName ||
      id,

    category,

    owner:
      sourceInput.owner ||
      collector.owner ||
      id,

    status,

    severity:
      isHealthSeverity(
        sourceInput.severity,
      )
        ? sourceInput.severity
        : "unknown",

    summary:
      typeof sourceInput.summary ===
      "string"
        ? sourceInput.summary
        : "",

    observedAt:
      typeof sourceInput.observedAt ===
      "string" &&
      sourceInput.observedAt.trim()
        ? sourceInput.observedAt
        : observedAt,

    details:
      sourceInput.details &&
      typeof sourceInput.details ===
      "object" &&
      !Array.isArray(
        sourceInput.details,
      )
        ? sourceInput.details
        : {},
  };

  const findings =
    normalizeArray(
      result?.findings,
    ).map(
      (finding) =>
        normalizeFinding(
          finding,
          source,
          observedAt,
        ),
    );

  const highestSeverity =
    getHighestHealthSeverity([
      source.severity,
      ...findings.map(
        (finding) =>
          finding.severity,
      ),
    ]);

  return {
    source: {
      ...source,
      severity:
        highestSeverity,
    },

    findings,
  };
}


class HealthService {
  constructor(
    options = {},
  ) {
    this.collectors =
      new Map();

    this.now =
      typeof options.now ===
      "function"
        ? options.now
        : () =>
            new Date()
              .toISOString();

    for (
      const collector
      of options.collectors || []
    ) {
      this.registerCollector(
        collector,
      );
    }
  }


  registerCollector(
    collector,
  ) {
    if (
      !collector ||
      typeof collector !==
      "object" ||
      Array.isArray(collector)
    ) {
      throw new Error(
        "Health collector must be an object.",
      );
    }

    const id =
      requireNonEmptyString(
        collector.id,
        "Health collector id",
      );

    if (
      typeof collector.collect !==
      "function"
    ) {
      throw new Error(
        `Health collector ${id} must define collect().`,
      );
    }

    if (
      this.collectors.has(id)
    ) {
      throw new Error(
        `Health collector already registered: ${id}`,
      );
    }

    this.collectors.set(
      id,
      collector,
    );

    return collector;
  }


  listCollectors() {
    return Array.from(
      this.collectors.values(),
    );
  }


  async collectOne(
    collector,
    context,
    observedAt,
  ) {
    try {
      const result =
        await collector.collect(
          context,
        );

      return normalizeSource(
        collector,
        result,
        observedAt,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const source = {
        id:
          collector.id,

        displayName:
          collector.displayName ||
          collector.id,

        category:
          isHealthCategory(
            collector.category,
          )
            ? collector.category
            : "system",

        owner:
          collector.owner ||
          collector.id,

        status:
          "unavailable",

        severity:
          "unavailable",

        summary:
          "Health source could not be collected.",

        observedAt,

        details: {
          error:
            message,
        },
      };

      return {
        source,

        findings: [
          {
            id:
              `${collector.id}.collector-error`,

            sourceId:
              collector.id,

            severity:
              "unavailable",

            status:
              "unavailable",

            title:
              "Health source unavailable",

            summary:
              message,

            owner:
              source.owner,

            observedAt,

            details: {},

            suggestedActions: [],
            logRefs: [],
            resourceRefs: [],
          },
        ],
      };
    }
  }


  async snapshot(
    context = {},
  ) {
    const generatedAt =
      this.now();

    const collectors =
      this.listCollectors();

    const collected =
      await Promise.all(
        collectors.map(
          (collector) =>
            this.collectOne(
              collector,
              context,
              generatedAt,
            ),
        ),
      );

    const sources =
      collected.map(
        (entry) =>
          entry.source,
      );

    const findings =
      collected.flatMap(
        (entry) =>
          entry.findings,
      );

    const overallSeverity =
      getHighestHealthSeverity([
        ...sources.map(
          (source) =>
            source.severity,
        ),

        ...findings.map(
          (finding) =>
            finding.severity,
        ),
      ]);

    const sourceCounts = {};
    const findingCounts = {};

    for (
      const source
      of sources
    ) {
      sourceCounts[
        source.severity
      ] =
        (
          sourceCounts[
            source.severity
          ] || 0
        ) + 1;
    }

    for (
      const finding
      of findings
    ) {
      findingCounts[
        finding.severity
      ] =
        (
          findingCounts[
            finding.severity
          ] || 0
        ) + 1;
    }

    return {
      generatedAt,

      overallSeverity,

      summary: {
        collectorCount:
          collectors.length,

        sourceCount:
          sources.length,

        findingCount:
          findings.length,

        sourceCounts,
        findingCounts,
      },

      sources,
      findings,
    };
  }
}

module.exports = {
  HealthService,
  normalizeSource,
  normalizeFinding,
};
