class IndexCancellationError
  extends Error {
  constructor(
    message =
      "Indexing cancelled",
  ) {
    super(
      message,
    );


    this.name =
      "IndexCancellationError";
  }
}


function createIndexCancellationToken() {
  let cancelled =
    false;


  return {
    cancel() {
      cancelled =
        true;
    },


    isCancelled() {
      return cancelled;
    },


    throwIfCancelled() {
      if (
        cancelled
      ) {
        throw new IndexCancellationError();
      }
    },
  };
}


module.exports = {
  IndexCancellationError,
  createIndexCancellationToken,
};
