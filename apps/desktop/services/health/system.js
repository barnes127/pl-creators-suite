const fs = require("fs/promises");
const os = require("os");
const {getProcessResourceSnapshot} = require("../diagnostics");

function finiteNumber(
  value,
  fallback = 0,
) {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}


function percentage(
  part,
  total,
) {
  if (
    total <= 0
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.min(
      100,
      (
        part /
        total
      ) * 100,
    ),
  );
}


function getCpuSummary() {
  const cpus =
    os.cpus();

  const loadAverage =
    os.loadavg();

  return {
    logicalCpuCount:
      cpus.length,

    model:
      cpus[0]?.model ??
      "Unknown CPU",

    loadAverage1m:
      finiteNumber(
        loadAverage[0],
      ),

    loadAverage5m:
      finiteNumber(
        loadAverage[1],
      ),

    loadAverage15m:
      finiteNumber(
        loadAverage[2],
      ),

    loadAverageSupported:
      process.platform !==
      "win32",
  };
}


function getMemorySummary() {
  const totalBytes =
    finiteNumber(
      os.totalmem(),
    );

  const freeBytes =
    finiteNumber(
      os.freemem(),
    );

  const usedBytes =
    Math.max(
      0,
      totalBytes -
      freeBytes,
    );

  return {
    totalBytes,
    freeBytes,
    usedBytes,

    usedPercent:
      percentage(
        usedBytes,
        totalBytes,
      ),
  };
}


async function getDiskSummary(
  targetPath =
    os.homedir(),
) {
  try {
    const stats =
      await fs.statfs(
        targetPath,
      );

    const blockSize =
      Number(
        stats.bsize,
      );

    const totalBlocks =
      Number(
        stats.blocks,
      );

    const availableBlocks =
      Number(
        stats.bavail ??
        stats.bfree,
      );

    const totalBytes =
      blockSize *
      totalBlocks;

    const availableBytes =
      blockSize *
      availableBlocks;

    const usedBytes =
      Math.max(
        0,
        totalBytes -
        availableBytes,
      );

    return {
      available:
        true,

      totalBytes,

      availableBytes,

      usedBytes,

      usedPercent:
        percentage(
          usedBytes,
          totalBytes,
        ),
    };
  } catch (error) {
    return {
      available:
        false,

      reason:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}


function getQueueSummary(
  taskManager,
) {
  if (
    !taskManager ||
    typeof taskManager.list !==
      "function"
  ) {
    return {
      available:
        false,

      reason:
        "Task manager is unavailable.",
    };
  }

  const tasks =
    taskManager.list();

  const counts = {
    queued: 0,
    running: 0,
    cancelling: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    interrupted: 0,
    other: 0,
  };

  for (
    const task
    of tasks
  ) {
    if (
      Object.prototype
        .hasOwnProperty.call(
          counts,
          task.status,
        )
    ) {
      counts[
        task.status
      ] += 1;
    } else {
      counts.other += 1;
    }
  }

  return {
    available:
      true,

    total:
      tasks.length,

    active:
      counts.queued +
      counts.running +
      counts.cancelling,

    ...counts,
  };
}


function getWorkerSummary() {
  return {
    available:
      false,

    reason:
      "No shared worker runtime registry is active.",
  };
}


function getGpuSummary() {
  return {
    available:
      false,

    reason:
      "No portable GPU telemetry provider is registered.",
  };
}


function getCacheSummary() {
  return {
    available:
      false,

    reason:
      "No shared cache telemetry provider is registered.",
  };
}


function createSystemHealthCollector(
  options = {},
) {
  const taskManager =
    options.taskManager;

  const diskPath =
    options.diskPath ||
    os.homedir();

  return {
    id:
      "system",

    displayName:
      "Local System",

    category:
      "system",

    owner:
      "desktop-runtime",

    async collect() {
      const processSnapshot =
        getProcessResourceSnapshot({
          subsystem:
            "desktop",
        });

      const cpu =
        getCpuSummary();

      const memory =
        getMemorySummary();

      const disk =
        await getDiskSummary(
          diskPath,
        );

      const queue =
        getQueueSummary(
          taskManager,
        );

      const worker =
        getWorkerSummary();

      const gpu =
        getGpuSummary();

      const cache =
        getCacheSummary();

      const findings = [];

      if (
        !disk.available
      ) {
        findings.push({
          id:
            "system.disk-unavailable",

          severity:
            "unavailable",

          status:
            "unavailable",

          title:
            "Disk telemetry unavailable",

          summary:
            "PL could not read filesystem capacity information.",

          owner:
            "desktop-runtime",

          details: {
            reason:
              disk.reason,
          },

          suggestedActions: [],
          logRefs: [],
          resourceRefs: [],
        });
      } else if (
        disk.usedPercent !==
          null &&
        disk.usedPercent >=
          95
      ) {
        findings.push({
          id:
            "system.disk-critical",

          severity:
            "critical",

          status:
            "degraded",

          title:
            "Disk space critically low",

          summary:
            "The local storage volume is at least 95% full.",

          owner:
            "desktop-runtime",

          details: {
            usedPercent:
              disk.usedPercent,

            availableBytes:
              disk.availableBytes,
          },

          suggestedActions: [],
          logRefs: [],
          resourceRefs: [],
        });
      } else if (
        disk.usedPercent !==
          null &&
        disk.usedPercent >=
          90
      ) {
        findings.push({
          id:
            "system.disk-warning",

          severity:
            "warning",

          status:
            "degraded",

          title:
            "Disk space running low",

          summary:
            "The local storage volume is at least 90% full.",

          owner:
            "desktop-runtime",

          details: {
            usedPercent:
              disk.usedPercent,

            availableBytes:
              disk.availableBytes,
          },

          suggestedActions: [],
          logRefs: [],
          resourceRefs: [],
        });
      }

      const hasCritical =
        findings.some(
          (finding) =>
            finding.severity ===
            "critical",
        );

      const hasWarning =
        findings.some(
          (finding) =>
            finding.severity ===
            "warning",
        );

      const unavailable =
        findings.some(
          (finding) =>
            finding.severity ===
            "unavailable",
        );

      let status =
        "healthy";

      let severity =
        "healthy";

      if (
        hasCritical
      ) {
        status =
          "degraded";

        severity =
          "critical";
      } else if (
        hasWarning
      ) {
        status =
          "degraded";

        severity =
          "warning";
      } else if (
        unavailable
      ) {
        status =
          "degraded";

        severity =
          "unavailable";
      }

      return {
        source: {
          id:
            "system",

          displayName:
            "Local System",

          category:
            "system",

          owner:
            "desktop-runtime",

          status,

          severity,

          summary:
            findings.length > 0
              ? "Local system telemetry has conditions requiring attention."
              : "Local system telemetry is available.",

          details: {
            platform:
              process.platform,

            architecture:
              process.arch,

            hostUptimeSeconds:
              finiteNumber(
                os.uptime(),
              ),

            process:
              processSnapshot,

            cpu,

            memory,

            disk,

            queue,

            worker,

            gpu,

            cache,
          },
        },

        findings,
      };
    },
  };
}


module.exports = {
  finiteNumber,
  percentage,
  getCpuSummary,
  getMemorySummary,
  getDiskSummary,
  getQueueSummary,
  getWorkerSummary,
  getGpuSummary,
  getCacheSummary,
  createSystemHealthCollector,
};
