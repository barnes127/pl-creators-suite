import type {
  CreatorSessionRecord,
  CreatorSessionStore,
} from "./types";


export const CREATOR_SESSION_RECOVERY_SCHEMA_VERSION =
  1;

export const MAX_CREATOR_SESSION_RESTORE_POINTS =
  12;


export type CreatorSessionRestorePointKind =
  | "automatic"
  | "manual";


export interface CreatorSessionRestorePoint {
  id:
    string;

  kind:
    CreatorSessionRestorePointKind;

  label:
    string;

  sourceSessionId:
    string;

  createdAt:
    string;

  session:
    CreatorSessionRecord;
}


export interface CreatorSessionRecoveryStore {
  schemaVersion:
    typeof CREATOR_SESSION_RECOVERY_SCHEMA_VERSION;

  restorePoints:
    readonly CreatorSessionRestorePoint[];
}


export type CreatorSessionRestoreSource =
  | "none"
  | "live"
  | "automatic-fallback"
  | "unclean-live-fallback";


export interface CreatorSessionRestorePlan {
  source:
    CreatorSessionRestoreSource;

  interrupted:
    boolean;

  restorePointId:
    string | null;

  session:
    CreatorSessionRecord |
    undefined;
}


function cloneCreatorSessionRecord(
  session:
    CreatorSessionRecord,
):
  CreatorSessionRecord {
  return {
    ...session,

    layout:
      structuredClone(
        session.layout,
      ),

    openResources:
      session.openResources.map(
        (resource) => ({
          ...resource,
        }),
      ),

    selectedResources:
      session.selectedResources.map(
        (resource) => ({
          ...resource,
        }),
      ),

    taskRefs:
      session.taskRefs.map(
        (task) => ({
          ...task,
        }),
      ),

    terminalRefs:
      session.terminalRefs.map(
        (terminal) => ({
          ...terminal,
        }),
      ),

    recoveryRefs:
      session.recoveryRefs.map(
        (recovery) => ({
          ...recovery,
        }),
      ),

    resumePolicy:
      "metadata-only",
  };
}


function createRestorePointId(
  kind:
    CreatorSessionRestorePointKind,
  now:
    string,
) {
  return [
    "session-restore",
    kind,
    Date.parse(
      now,
    ),
    Math.random()
      .toString(36)
      .slice(
        2,
        10,
      ),
  ].join(
    "-",
  );
}


export function createEmptyCreatorSessionRecoveryStore():
  CreatorSessionRecoveryStore {
  return {
    schemaVersion:
      CREATOR_SESSION_RECOVERY_SCHEMA_VERSION,

    restorePoints:
      [],
  };
}


export function createCreatorSessionRestorePoint(
  store:
    CreatorSessionRecoveryStore,
  session:
    CreatorSessionRecord,
  input: {
    kind:
      CreatorSessionRestorePointKind;

    label?:
      string;

    now?:
      string;
  },
): {
  store:
    CreatorSessionRecoveryStore;

  restorePoint:
    CreatorSessionRestorePoint;
} {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const label =
    input.label
      ?.trim() ||
    (
      input.kind ===
      "manual"
        ? "Manual restore point"
        : "Automatic session restore point"
    );


  const restorePoint:
    CreatorSessionRestorePoint = {
      id:
        createRestorePointId(
          input.kind,
          now,
        ),

      kind:
        input.kind,

      label,

      sourceSessionId:
        session.id,

      createdAt:
        now,

      session:
        cloneCreatorSessionRecord(
          session,
        ),
  };


  const restorePoints = [
    restorePoint,

    ...store.restorePoints,
  ]
    .sort(
      (
        left,
        right,
      ) =>
        right.createdAt
          .localeCompare(
            left.createdAt,
          ),
    )
    .slice(
      0,
      MAX_CREATOR_SESSION_RESTORE_POINTS,
    );


  return {
    store: {
      ...store,

      restorePoints,
    },

    restorePoint,
  };
}


export function getCreatorSessionRestorePoint(
  store:
    CreatorSessionRecoveryStore,
  restorePointId:
    string,
):
  CreatorSessionRestorePoint |
  undefined {
  return store.restorePoints.find(
    (restorePoint) =>
      restorePoint.id ===
      restorePointId,
  );
}


export function getLatestAutomaticRestorePoint(
  store:
    CreatorSessionRecoveryStore,
  sourceSessionId:
    string,
):
  CreatorSessionRestorePoint |
  undefined {
  return store.restorePoints.find(
    (restorePoint) =>
      restorePoint.kind ===
        "automatic" &&
      restorePoint.sourceSessionId ===
        sourceSessionId,
  );
}


export function resolveCreatorSessionRestorePlan(
  session:
    CreatorSessionRecord |
    undefined,
  recoveryStore:
    CreatorSessionRecoveryStore,
):
  CreatorSessionRestorePlan {
  if (
    !session
  ) {
    return {
      source:
        "none",

      interrupted:
        false,

      restorePointId:
        null,

      session:
        undefined,
    };
  }


  if (
    session.cleanShutdown
  ) {
    return {
      source:
        "live",

      interrupted:
        false,

      restorePointId:
        null,

      session:
        cloneCreatorSessionRecord(
          session,
        ),
    };
  }


  const automatic =
    getLatestAutomaticRestorePoint(
      recoveryStore,
      session.id,
    );


  if (
    automatic
  ) {
    return {
      source:
        "automatic-fallback",

      interrupted:
        true,

      restorePointId:
        automatic.id,

      session:
        cloneCreatorSessionRecord(
          automatic.session,
        ),
    };
  }


  return {
    source:
      "unclean-live-fallback",

    interrupted:
      true,

    restorePointId:
      null,

    session:
      cloneCreatorSessionRecord(
        session,
      ),
  };
}


export function restoreCreatorSessionFromPoint(
  sessionStore:
    CreatorSessionStore,
  recoveryStore:
    CreatorSessionRecoveryStore,
  restorePointId:
    string,
  now =
    new Date()
      .toISOString(),
):
  CreatorSessionStore {
  const restorePoint =
    getCreatorSessionRestorePoint(
      recoveryStore,
      restorePointId,
    );

  if (
    !restorePoint
  ) {
    return sessionStore;
  }


  const restored: CreatorSessionRecord = {
    ...cloneCreatorSessionRecord(
      restorePoint.session,
    ),

    updatedAt:
      now,

    cleanShutdown:
      false,

    resumePolicy:
      "metadata-only",
  };


  const exists =
    sessionStore.sessions.some(
      (session) =>
        session.id ===
        restored.id,
    );


  return {
    ...sessionStore,

    activeSessionId:
      restored.id,

    sessions:
      exists
        ? sessionStore.sessions.map(
            (session) =>
              session.id ===
              restored.id
                ? restored
                : session,
          )
        : [
            ...sessionStore.sessions,
            restored,
          ],
  };
}
