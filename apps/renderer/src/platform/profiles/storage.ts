import type {
  ShellWorkspaceState,
} from "../shell/types";

import {
  createCreatorProfileFromShellState,
  createDefaultCreatorProfileStore,
} from "./defaults";

import {
  ensureBuiltInCreatorProfiles,
  getActiveCreatorProfile,
} from "./builtIns";

import {
  applyCreatorProfileToShellState,
  captureActiveProfileEnvironment,
} from "./environment";

import type {
  CreatorProfile,
} from "./types";

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

export function ensureCreatorProfileStore(
  state:
    CreatorProfileStore,
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileStore {
  const ensured =
    ensureBuiltInCreatorProfiles(
      state,
    );

  saveCreatorProfileStore(
    ensured,
    storage,
  );

  return ensured;
}


export function loadEnsuredCreatorProfileStore(
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileStore {
  return ensureCreatorProfileStore(
    loadCreatorProfileStore(
      storage,
    ),
    storage,
  );
}


export function persistActiveCreatorProfileEnvironment(
  shellState:
    ShellWorkspaceState,
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfileStore {
  const store =
    loadEnsuredCreatorProfileStore(
      storage,
    );

  const captured =
    captureActiveProfileEnvironment(
      store,
      shellState,
    );

  saveCreatorProfileStore(
    captured,
    storage,
  );

  return captured;
}


export function activateCreatorProfile(
  profileId:
    string,
  shellState:
    ShellWorkspaceState,
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
): {
  store:
    CreatorProfileStore;

  profile:
    CreatorProfile;

  shellState:
    ShellWorkspaceState;
} | undefined {
  const current =
    persistActiveCreatorProfileEnvironment(
      shellState,
      storage,
    );


  const profile =
    current.profiles.find(
      (
        candidate,
      ) =>
        candidate.id ===
        profileId,
    );


  if (
    !profile
  ) {
    return undefined;
  }


  const store:
    CreatorProfileStore = {
    ...current,

    activeProfileId:
      profile.id,
  };


  saveCreatorProfileStore(
    store,
    storage,
  );


  return {
    store,

    profile,

    shellState:
      applyCreatorProfileToShellState(
        shellState,
        profile,
      ),
  };
}


export function resolveActiveCreatorProfile(
  storage:
    ProfileStorageLike =
      getBrowserStorage(),
):
  CreatorProfile |
  undefined {
  return getActiveCreatorProfile(
    loadEnsuredCreatorProfileStore(
      storage,
    ),
  );
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
