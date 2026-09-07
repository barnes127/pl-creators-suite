const {
  createLogRecord,
  createProblemRecord,
  createCrashRecord,
  createResourceRecord,
  createJobRecord,
} = require("./records");

const {
  appendDiagnosticRecord,
  readDiagnosticRecords,
  rewriteDiagnosticRecords,
} = require("./storage");

const {
  isTerminalJobStatus,
} = require("./types");

function matchesFilter(
  record,
  filter = {},
) {
  if (
    filter.level &&
    record.level !== filter.level
  ) {
    return false;
  }

  if (
    filter.severity &&
    record.severity !==
      filter.severity
  ) {
    return false;
  }

  if (
    filter.subsystem &&
    record.subsystem !==
      filter.subsystem
  ) {
    return false;
  }

  if (
    filter.taskId &&
    record.taskId !==
      filter.taskId
  ) {
    return false;
  }

  if (
    filter.correlationId &&
    record.correlationId !==
      filter.correlationId
  ) {
    return false;
  }

  if (
    filter.status &&
    record.status !==
      filter.status
  ) {
    return false;
  }

  return true;
}

class DiagnosticsService {
  constructor(options = {}) {
    this.rootDir =
      options.rootDir;

    this.maxRecords =
      Number.isInteger(
        options.maxRecords,
      )
        ? Math.max(
            1,
            options.maxRecords,
          )
        : 1000;
  }

  async append(
    collection,
    record,
  ) {
    return appendDiagnosticRecord(
      this.rootDir,
      collection,
      record,
    );
  }

  async log(input = {}) {
    const record =
      createLogRecord(input);

    await this.append(
      "logs",
      record,
    );

    return record;
  }

  async problem(input = {}) {
    const record =
      createProblemRecord(input);

    await this.append(
      "problems",
      record,
    );

    return record;
  }

  async crash(input = {}) {
    const record =
      createCrashRecord(input);

    await this.append(
      "crashes",
      record,
    );

    return record;
  }

  async resource(input = {}) {
    const record =
      createResourceRecord(input);

    await this.append(
      "resources",
      record,
    );

    return record;
  }

  async job(task = {}) {
    const record =
      createJobRecord(task);

    await this.append(
      "jobs",
      record,
    );

    return record;
  }

  async query(
    collection,
    filter = {},
  ) {
    const records =
      await readDiagnosticRecords(
        this.rootDir,
        collection,
      );

    const filtered =
      records.filter(
        (record) =>
          matchesFilter(
            record,
            filter,
          ),
      );

    const limit =
      Number.isInteger(
        filter.limit,
      )
        ? Math.max(
            0,
            filter.limit,
          )
        : filtered.length;

    return filtered.slice(
      Math.max(
        0,
        filtered.length -
          limit,
      ),
    );
  }

  async markInterruptedJobs() {
    const jobs =
      await readDiagnosticRecords(
        this.rootDir,
        "jobs",
      );

    const latestById =
      new Map();

    for (const job of jobs) {
      latestById.set(
        job.id,
        job,
      );
    }

    const interrupted = [];

    for (
      const job
      of latestById.values()
    ) {
      if (
        job.status !== "queued" &&
        job.status !== "running" &&
        job.status !== "cancelling"
      ) {
        continue;
      }

      const record = {
        ...job,
        status: "interrupted",
        finishedAt:
          new Date()
            .toISOString(),

        failure: {
          code:
            "TASK_INTERRUPTED",

          message:
            "Task did not complete before the previous process ended.",

          retryable:
            true,
        },
      };

      await this.append(
        "jobs",
        record,
      );

      interrupted.push(
        record,
      );
    }

    return interrupted;
  }

  async getLatestJobs() {
    const jobs =
      await readDiagnosticRecords(
        this.rootDir,
        "jobs",
      );

    const latestById =
      new Map();

    for (const job of jobs) {
      latestById.set(
        job.id,
        job,
      );
    }

    return Array.from(
      latestById.values(),
    );
  }

  async prune(collection) {
    const records =
      await readDiagnosticRecords(
        this.rootDir,
        collection,
      );

    if (
      records.length <=
      this.maxRecords
    ) {
      return {
        removed: 0,
        remaining:
          records.length,
      };
    }

    const retained =
      records.slice(
        records.length -
          this.maxRecords,
      );

    await rewriteDiagnosticRecords(
      this.rootDir,
      collection,
      retained,
    );

    return {
      removed:
        records.length -
        retained.length,

      remaining:
        retained.length,
    };
  }

  async health() {
    const jobs =
      await this.getLatestJobs();

    return {
      jobCount:
        jobs.length,

      activeJobs:
        jobs.filter(
          (job) =>
            !isTerminalJobStatus(
              job.status,
            ),
        ).length,

      failedJobs:
        jobs.filter(
          (job) =>
            job.status ===
            "failed",
        ).length,

      interruptedJobs:
        jobs.filter(
          (job) =>
            job.status ===
            "interrupted",
        ).length,
    };
  }
}

module.exports = {
  DiagnosticsService,
  matchesFilter,
};
