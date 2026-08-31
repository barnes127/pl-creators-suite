export interface RecoveryUiEntry {
  id:
    string;

  kind:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  recoverable:
    boolean;

  metadata?: {
    name?:
      string | null;

    description?:
      string | null;

    fileCount?:
      number;
  };
}


export interface RecoveryUiStatus {
  state:
    string;

  cleanShutdown:
    boolean;

  autosaveCount:
    number;

  journalEntryCount:
    number;

  recoverableCount:
    number;

  latestRecoveryAt:
    string | null;

  entries:
    RecoveryUiEntry[];
}


interface RecoveryPanelProps {
  projectRoot:
    string;

  status:
    RecoveryUiStatus | null;

  busy:
    boolean;

  error:
    string;

  onRefresh:
    () => void;

  onRestore:
    (
      snapshotId:
        string,
    ) => void;
}


export function RecoveryPanel({
  projectRoot,
  status,
  busy,
  error,
  onRefresh,
  onRestore,
}: RecoveryPanelProps) {
  if (
    !projectRoot
  ) {
    return (
      <div className="emptyState">
        Open a project to inspect recovery data.
      </div>
    );
  }


  return (
    <div>
      <div className="row">
        <button
          className="btn btn-subtle"
          type="button"
          disabled={busy}
          onClick={
            onRefresh
          }
        >
          {busy
            ? "Refreshing..."
            : "Refresh Recovery"}
        </button>
      </div>


      {error && (
        <div className="errorBox">
          {error}
        </div>
      )}


      {status && (
        <>
          <div className="recentItem">
            <strong>
              Recovery state: {status.state}
            </strong>

            <span>
              Recoverable items: {status.recoverableCount}
            </span>

            <span>
              Autosaves: {status.autosaveCount}
            </span>

            <span>
              Journal entries: {status.journalEntryCount}
            </span>

            <span>
              Previous session clean:{" "}
              {status.cleanShutdown
                ? "yes"
                : "no"}
            </span>
          </div>


          {status.entries.length ===
          0 ? (
            <div className="emptyState">
              No recovery entries are currently available.
            </div>
          ) : (
            status.entries.map(
              (
                entry,
              ) => (
                <div
                  className="recentItem"
                  key={
                    entry.id
                  }
                >
                  <strong>
                    {entry.metadata?.name ||
                      entry.kind}
                  </strong>

                  <span>
                    {entry.createdAt}
                  </span>

                  {entry.metadata
                    ?.description && (
                    <span>
                      {
                        entry
                          .metadata
                          .description
                      }
                    </span>
                  )}

                  {(entry.kind ===
                    "snapshot" ||
                    entry.kind ===
                      "checkpoint") && (
                    <button
                      className="btn btn-subtle"
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={
                        () =>
                          onRestore(
                            entry.id,
                          )
                      }
                    >
                      Restore
                    </button>
                  )}
                </div>
              ),
            )
          )}
        </>
      )}
    </div>
  );
}
