class RecoveryDataError
  extends Error {
  constructor(
    message,
    code =
      "RECOVERY_DATA_ERROR",
    details =
      undefined,
  ) {
    super(
      message,
    );

    this.name =
      "RecoveryDataError";

    this.code =
      code;

    this.details =
      details;
  }
}


module.exports = {
  RecoveryDataError,
};
