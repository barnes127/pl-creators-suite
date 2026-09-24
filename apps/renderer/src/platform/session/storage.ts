import {
  createEmptyCreatorSessionStore,
} from "./defaults";

import {
  CREATOR_SESSION_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorSessionLoadResult,
  CreatorSessionStore,
  SessionStorageLike,
} from "./types";

import {
  normalizeCreatorSessionStore,
} from "./validation";


export const CREATOR_SESSION_STORAGE_KEY =
  "pl.creator-sessions.v1";


function getBrowserStorage():
  SessionStorageLike {
  return window.localStorage;
}


export function loadCreatorSessionStoreResult(
  storage:
    SessionStorageLike =
      getBrowserStorage(),
):
  CreatorSessionLoadResult {
  const fallback =
    createEmptyCreatorSessionStore();

  try {
    const raw =
      storage.getItem(
        CREATOR_SESSION_STORAGE_KEY,
      );

    if (
      !raw
    ) {
      return {
        status:
          "missing",

        state:
          fallback,
      };
    }


    const parsed:
      unknown =
        JSON.parse(
          raw,
        );


    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return {
        status:
          "recovered",

        state:
          fallback,
      };
    }


    const sourceSchemaVersion =
      (
        parsed as {
          schemaVersion?:
            unknown;
        }
      )
        .schemaVersion;


    if (
      sourceSchemaVersion !==
      CREATOR_SESSION_SCHEMA_VERSION
    ) {
      return {
        status:
          "incompatible",

        state:
          fallback,

        sourceSchemaVersion:
          typeof sourceSchemaVersion ===
            "number"
            ? sourceSchemaVersion
            : undefined,
      };
    }


    return {
      status:
        "ok",

      state:
        normalizeCreatorSessionStore(
          parsed,
          fallback,
        ),

      sourceSchemaVersion:
        CREATOR_SESSION_SCHEMA_VERSION,
    };
  } catch {
    return {
      status:
        "recovered",

      state:
        fallback,
    };
  }
}


export function loadCreatorSessionStore(
  storage?:
    SessionStorageLike,
):
  CreatorSessionStore {
  return loadCreatorSessionStoreResult(
    storage,
  )
    .state;
}


export function saveCreatorSessionStore(
  state:
    CreatorSessionStore,
  storage:
    SessionStorageLike =
      getBrowserStorage(),
) {
  storage.setItem(
    CREATOR_SESSION_STORAGE_KEY,
    JSON.stringify(
      state,
    ),
  );
}


export function resetCreatorSessionStore(
  storage:
    SessionStorageLike =
      getBrowserStorage(),
):
  CreatorSessionStore {
  try {
    storage.removeItem(
      CREATOR_SESSION_STORAGE_KEY,
    );
  } catch {
    // Reset still succeeds in memory.
  }

  return createEmptyCreatorSessionStore();
}
