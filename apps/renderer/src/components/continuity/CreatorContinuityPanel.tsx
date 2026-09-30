import {
  useState,
} from "react";

import {
  exportCreatorProfile,
} from "../../platform/profiles";

import type {
  CreatorProfile,
} from "../../platform/profiles";

import type {
  CreatorSessionRecoveryStore,
  CreatorSessionRestorePlan,
  CreatorSessionRestorePoint,
} from "../../platform/session";

import "./CreatorContinuityPanel.css";


interface CreatorContinuityPanelProps {
  activeProfile:
    CreatorProfile |
    undefined;

  recoveryStore:
    CreatorSessionRecoveryStore;

  restorePlan:
    CreatorSessionRestorePlan;

  canRestore:
    boolean;

  onCreateRestorePoint:
    (
      label:
        string,
    ) =>
      CreatorSessionRestorePoint |
      undefined;

  onRestorePoint:
    (
      restorePointId:
        string,
    ) =>
      void;

  onImportProfile:
    (
      serialized:
        string,
    ) =>
      CreatorProfile;
}


export function CreatorContinuityPanel({
  activeProfile,
  recoveryStore,
  restorePlan,
  canRestore,
  onCreateRestorePoint,
  onRestorePoint,
  onImportProfile,
}: CreatorContinuityPanelProps) {
  const [
    restoreLabel,
    setRestoreLabel,
  ] =
    useState(
      "",
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      "",
    );


  function handleCreateRestorePoint() {
    const point =
      onCreateRestorePoint(
        restoreLabel,
      );

    if (
      !point
    ) {
      setMessage(
        "No active session is available.",
      );

      return;
    }

    setRestoreLabel(
      "",
    );

    setMessage(
      `Created restore point: ${point.label}`,
    );
  }


  function handleExportProfile() {
    if (
      !activeProfile
    ) {
      setMessage(
        "No active creator profile is available.",
      );

      return;
    }

    const serialized =
      exportCreatorProfile(
        activeProfile,
      );

    const blob =
      new Blob(
        [
          serialized,
        ],
        {
          type:
            "application/json",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      url;

    anchor.download =
      `${activeProfile.id}.plprofile.json`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url,
    );

    setMessage(
      `Exported profile: ${activeProfile.name}`,
    );
  }


  async function handleImportProfile(
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.currentTarget
        .files?.[0];

    if (
      !file
    ) {
      return;
    }

    try {
      const serialized =
        await file.text();

      const profile =
        onImportProfile(
          serialized,
        );

      setMessage(
        `Imported profile: ${profile.name}`,
      );
    } catch (
      error
    ) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Profile import failed.",
      );
    } finally {
      event.currentTarget.value =
        "";
    }
  }


  return (
    <div className="creatorContinuity">
      <section className="creatorContinuitySection">
        <h3>
          Session Recovery
        </h3>

        <div className="creatorContinuityStatus">
          <strong>
            Startup source:{" "}
            {restorePlan.source}
          </strong>

          <span>
            Previous session interrupted:{" "}
            {restorePlan.interrupted
              ? "yes"
              : "no"}
          </span>
        </div>

        <p className="creatorContinuityHint">
          Session restore points save working context only.
          Project file recovery remains managed by Project Recovery.
        </p>

        <div className="creatorContinuityActions">
          <input
            className="input"
            type="text"
            value={
              restoreLabel
            }
            placeholder="Restore point name"
            onChange={
              (event) =>
                setRestoreLabel(
                  event.target.value,
                )
            }
          />

          <button
            className="btn"
            type="button"
            onClick={
              handleCreateRestorePoint
            }
          >
            Create Restore Point
          </button>
        </div>

        {recoveryStore.restorePoints.length ===
        0 ? (
          <div className="emptyState">
            No session restore points yet.
          </div>
        ) : (
          <div className="creatorContinuityList">
            {recoveryStore.restorePoints.map(
              (
                restorePoint,
              ) => (
                <div
                  className="recentItem"
                  key={
                    restorePoint.id
                  }
                >
                  <strong>
                    {
                      restorePoint.label
                    }
                  </strong>

                  <span>
                    {
                      restorePoint.kind
                    }
                    {" · "}
                    {
                      restorePoint.createdAt
                    }
                  </span>

                  <span>
                    Workspace:{" "}
                    {
                      restorePoint
                        .session
                        .activeWorkspace
                    }
                  </span>

                  <button
                    className="btn btn-subtle"
                    type="button"
                    disabled={
                      !canRestore
                    }
                    onClick={
                      () =>
                        onRestorePoint(
                          restorePoint.id,
                        )
                    }
                  >
                    Restore Context
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {!canRestore && (
          <div className="creatorContinuityWarning">
            Save current unsaved work before restoring another session context.
          </div>
        )}
      </section>

      <section className="creatorContinuitySection">
        <h3>
          Creator Profile Transfer
        </h3>

        <p className="creatorContinuityHint">
          Export a creator profile or import one as a custom profile.
        </p>

        <div className="creatorContinuityActions">
          <button
            className="btn"
            type="button"
            disabled={
              !activeProfile
            }
            onClick={
              handleExportProfile
            }
          >
            Export Active Profile
          </button>

          <label className="btn btn-subtle creatorContinuityImport">
            Import Profile

            <input
              type="file"
              accept=".json,.plprofile"
              onChange={
                handleImportProfile
              }
            />
          </label>
        </div>
      </section>

      {message && (
        <div className="creatorContinuityMessage">
          {message}
        </div>
      )}
    </div>
  );
}
