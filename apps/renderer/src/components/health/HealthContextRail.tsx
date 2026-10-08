import type {
  HealthSeverity,
  HealthSnapshot,
} from "@pl/platform";

import "./HealthContextRail.css";


export interface HealthContextRailProps {
  snapshot:
    HealthSnapshot |
    null;

  loading:
    boolean;

  error:
    string;

  onRefresh:
    () => void;

  onClose:
    () => void;
}


function severityLabel(
  severity:
    HealthSeverity,
) {
  switch (
    severity
  ) {
    case "healthy":
      return "Healthy";

    case "info":
      return "Info";

    case "warning":
      return "Warning";

    case "error":
      return "Error";

    case "critical":
      return "Critical";

    case "unavailable":
      return "Unavailable";

    default:
      return "Unknown";
  }
}


export function HealthContextRail({
  snapshot,
  loading,
  error,
  onRefresh,
  onClose,
}: HealthContextRailProps) {
  return (
    <div className="healthContextRail">
      <div className="healthContextHeader">
        <div>
          <span className="healthContextEyebrow">
            Operations
          </span>

          <strong>
            Health Center
          </strong>
        </div>

        <div className="healthContextHeaderActions">
          <button
            className="btn btn-subtle"
            type="button"
            onClick={
              onRefresh
            }
            disabled={
              loading
            }
          >
            {loading
              ? "Checking..."
              : "Refresh"}
          </button>

          <button
            className="btn btn-subtle"
            type="button"
            onClick={
              onClose
            }
            aria-label="Close health center"
          >
            ×
          </button>
        </div>
      </div>

      {error && (
        <div
          className="healthContextError"
          role="alert"
        >
          <strong>
            Health unavailable
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {!error &&
        !snapshot &&
        loading && (
          <div className="healthContextEmpty">
            Checking suite health...
          </div>
        )}

      {snapshot && (
        <>
          <div
            className="healthContextSummary"
            data-severity={
              snapshot.overallSeverity
            }
          >
            <span>
              Overall
            </span>

            <strong>
              {severityLabel(
                snapshot.overallSeverity,
              )}
            </strong>

            <span>
              {
                snapshot
                  .summary
                  .findingCount
              }{" "}
              finding(s)
            </span>
          </div>

          {snapshot.findings.length >
          0 ? (
            <div className="healthContextSection">
              <strong className="healthContextSectionTitle">
                Needs attention
              </strong>

              {snapshot.findings.map(
                (
                  finding,
                ) => (
                  <div
                    className="healthFindingCard"
                    data-severity={
                      finding.severity
                    }
                    key={
                      finding.id
                    }
                  >
                    <div className="healthFindingHeader">
                      <strong>
                        {
                          finding.title
                        }
                      </strong>

                      <span>
                        {severityLabel(
                          finding.severity,
                        )}
                      </span>
                    </div>

                    {finding.summary && (
                      <p>
                        {
                          finding.summary
                        }
                      </p>
                    )}

                    <span className="healthFindingOwner">
                      Owner:{" "}
                      {
                        finding.owner
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="healthContextEmpty">
              No current health findings.
            </div>
          )}

          <div className="healthContextSection">
            <strong className="healthContextSectionTitle">
              Services
            </strong>

            {snapshot.sources.map(
              (
                source,
              ) => (
                <div
                  className="healthSourceRow"
                  key={
                    source.id
                  }
                >
                  <div>
                    <strong>
                      {
                        source.displayName
                      }
                    </strong>

                    <span>
                      {
                        source.summary
                      }
                    </span>
                  </div>

                  <span
                    className="healthSourceStatus"
                    data-severity={
                      source.severity
                    }
                  >
                    {severityLabel(
                      source.severity,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="healthContextTimestamp">
            Checked{" "}
            {new Date(
              snapshot.generatedAt,
            ).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
