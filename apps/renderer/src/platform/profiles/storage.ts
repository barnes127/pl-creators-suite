import type {
  ShellWorkspaceState,
} from "../shell/types";

import {
  createCreatorProfileFromShellState,
  createDefaultCreatorProfileStore,
} from "./defaults";

import {
  CREATOR_PROFILE_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorProfileLoadResult,
  CreatorProfileStore,
  ProfileStorageLike,
} from "./types";

import {
  normalizeCreatorProfileStore,
} from "./validation";


export const CREATOR_PROFILE_STORAGE_KEY =
  "pl.creator-profiles.v1";


function getBrowserStorage():
  ProfileStorageLike {
  return window.localStorage;
}


export function loadCreatorProfileStoreResult(
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileLoadResult {
  const fallback =
    createDefaultCreatorProfileStore();

  try {
    const raw =
      storage.getItem(
        CREATOR_PROFILE_STORAGE_KEY,
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
      CREATOR_PROFILE_SCHEMA_VERSION
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


    const normalized =
      normalizeCreatorProfileStore(
        parsed,
        fallback,
      );


    return {
      status:
        "ok",

      state:
        normalized,

      sourceSchemaVersion:
        CREATOR_PROFILE_SCHEMA_VERSION,
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


export function loadCreatorProfileStore(
  storage?:
    ProfileStorageLike,
):
  CreatorProfileStore {
  return loadCreatorProfileStoreResult(
    storage,
  )
    .state;
}


export function saveCreatorProfileStore(
  state:
    CreatorProfileStore,
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
) {
  storage.setItem(
    CREATOR_PROFILE_STORAGE_KEY,
    JSON.stringify(
      state,
    ),
  );
}


export function migrateShellStateToCreatorProfiles(
  shellState:
    ShellWorkspaceState,
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileStore {
  const existing =
    loadCreatorProfileStoreResult(
      storage,
    );


  if (
    existing.status !==
      "missing"
  ) {
    return existing.state;
  }


  const profile =
    createCreatorProfileFromShellState(
      shellState,
    );


  const migrated:
    CreatorProfileStore = {
      schemaVersion:
        CREATOR_PROFILE_SCHEMA_VERSION,

      activeProfileId:
        profile.id,

      profiles: [
        profile,
      ],

      migratedFromShellV1:
        true,
  };


  saveCreatorProfileStore(
    migrated,
    storage,
  );


  return migrated;
}


export function resetCreatorProfileStore(
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileStore {
  try {
    storage.removeItem(
      CREATOR_PROFILE_STORAGE_KEY,
    );
  } catch {
    // Reset still succeeds in memory.
  }

  return createDefaultCreatorProfileStore();
}
