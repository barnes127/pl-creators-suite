const {
  createIndexCancellationToken,
} =
  require(
    "./cancellation",
  );

const {
  indexProject,
} =
  require(
    "./indexer",
  );


class ProjectIndexJobManager {
  constructor() {
    this.jobs =
      new Map();

    this.sequence =
      0;
  }


  start(
    params = {},
  ) {
    this.sequence +=
      1;


    const jobId =
      `index-${Date.now()}-${this.sequence}`;


    const cancellationToken =
      createIndexCancellationToken();


    const job = {
      id:
        jobId,

      projectRoot:
        params.projectRoot,

      status:
        "running",

      progress: {
        phase:
          "starting",

        completed:
          0,

        total:
          0,

        relativePath:
          null,
      },

      startedAt:
        new Date()
          .toISOString(),

      finishedAt:
        null,

      result:
        null,

      error:
        null,

      cancellationToken,
    };


    this.jobs.set(
      jobId,
      job,
    );


    job.promise =
      indexProject({
        ...params,

        cancellationToken,

        onProgress:
          (
            progress,
          ) => {
            job.progress =
              progress;


            params.onProgress
              ?.(
                progress,
              );
          },
      })
        .then(
          (
            result,
          ) => {
            job.status =
              "complete";

            job.result =
              result;

            job.finishedAt =
              new Date()
                .toISOString();

            return result;
          },
        )
        .catch(
          (
            error,
          ) => {
            job.status =
              cancellationToken
                .isCancelled()
                ? "cancelled"
                : "failed";

            job.error = {
              name:
                error.name,

              message:
                error.message,
            };

            job.finishedAt =
              new Date()
                .toISOString();

            throw error;
          },
        );


    return {
      jobId,

      promise:
        job.promise,
    };
  }


  cancel(
    jobId,
  ) {
    const job =
      this.jobs.get(
        jobId,
      );


    if (
      !job ||
      job.status !==
        "running"
    ) {
      return false;
    }


    job.cancellationToken
      .cancel();


    return true;
  }


  get(
    jobId,
  ) {
    const job =
      this.jobs.get(
        jobId,
      );


    if (
      !job
    ) {
      return undefined;
    }


    return {
      id:
        job.id,

      projectRoot:
        job.projectRoot,

      status:
        job.status,

      progress:
        job.progress,

      startedAt:
        job.startedAt,

      finishedAt:
        job.finishedAt,

      result:
        job.result,

      error:
        job.error,
    };
  }


  list() {
    return Array
      .from(
        this.jobs.keys(),
      )
      .map(
        (
          jobId,
        ) =>
          this.get(
            jobId,
          ),
      );
  }
}


module.exports = {
  ProjectIndexJobManager,
};
