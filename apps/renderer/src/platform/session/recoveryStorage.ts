import {
  normalizeCreatorSessionRecord,
} from "./validation";

import {
  CREATOR_SESSION_RECOVERY_SCHEMA_VERSION,
  createEmptyCreatorSessionRecoveryStore,
} from "./recovery";

import type {
  CreatorSessionRecoveryStore,
  CreatorSessionRestorePoint,
} from "./recovery";

import type {
  SessionStorageLike,
} from "./types";


export const CREATOR_SESSION_RECOVERY_STORAGE_KEY =
  "pl.creator-session-recovery.v1";


function getBrowserStorage():
  SessionStorageLike {
  return window.localStorage;
}


function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    Boolean(
      value,
    ) &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value,
    )
  );
}


function normalizeRestorePoint(
  value:
    unknown,
):
  CreatorSessionRestorePoint |
  undefined {
  if (
    !isRecord(
      value,
    ) ||
    typeof value.id !==
      "string" ||
    !value.id.trim() ||
    (
      value.kind !==
        "automatic" &&
      value.kind !==
        "manual"
    ) ||
    typeof value.sourceSessionId !==
      "string" ||
    !value.sourceSessionId.trim() ||
    typeof value.createdAt !==
      "string"
  ) {
    return undefined;
  }


  const normalizedSession =
    normalizeCreatorSessionRecord(
      value.session,
    );


  if (
    !normalizedSession
  ) {
    return undefined;
  }


  return {
    id:
      value.id.trim(),

    kind:
      value.kind,

    label:
      typeof value.label ===
        "string" &&
      value.label.trim()
        ? value.label.trim()
        : (
            value.kind ===
              "manual"
              ? "Manual restore point"
              : "Automatic session restore point"
          ),

    sourceSessionId:
      value.sourceSessionId.trim(),

    createdAt:
      new Date(
        value.createdAt,
      )
        .toISOString(),

    session:
      normalizedSession,
  };
}


export function loadCreatorSessionRecoveryStore(
  storage:
    SessionStorageLike =
      getBrowserStorage(),
):
  CreatorSessionRecoveryStore {
  const fallback =
    createEmptyCreatorSessionRecoveryStore();


  try {
    const raw =
      storage.getItem(
        CREATOR_SESSION_RECOVERY_STORAGE_KEY,
      );

    if (
      !raw
    ) {
      return fallback;
    }


    const parsed:
      unknown =
        JSON.parse(
          raw,
        );


    if (
      !isRecord(
        parsed,
      ) ||
      parsed.schemaVersion !==
        CREATOR_SESSION_RECOVERY_SCHEMA_VERSION ||
      !Array.isArray(
        parsed.restorePoints,
      )
    ) {
      return fallback;
    }


    const restorePoints =
      parsed.restorePoints
        .map(
          normalizeRestorePoint,
        )
        .filter(
          (
            restorePoint,
          ):
            restorePoint is
              CreatorSessionRestorePoint =>
            Boolean(
              restorePoint,
            ),
        )
        .sort(
          (
            left,
            right,
          ) =>
            right.createdAt
              .localeCompare(
                left.createdAt,
              ),
        );


    return {
      schemaVersion:
        CREATOR_SESSION_RECOVERY_SCHEMA_VERSION,

      restorePoints,
    };
  } catch {
    return fallback;
  }
}


export function saveCreatorSessionRecoveryStore(
  store:
    CreatorSessionRecoveryStore,
  storage:
    SessionStorageLike =
      getBrowserStorage(),
) {
  storage.setItem(
    CREATOR_SESSION_RECOVERY_STORAGE_KEY,
    JSON.stringify(
      store,
    ),
  );
}


export function resetCreatorSessionRecoveryStore(
  storage:
    SessionStorageLike =
      getBrowserStorage(),
):
  CreatorSessionRecoveryStore {
  try {
    storage.removeItem(
      CREATOR_SESSION_RECOVERY_STORAGE_KEY,
    );
  } catch {
    // Recovery still succeeds in memory.
  }


  return createEmptyCreatorSessionRecoveryStore();
}
