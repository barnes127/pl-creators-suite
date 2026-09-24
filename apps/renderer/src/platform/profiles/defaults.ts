import {DEFAULT_SHELL_LAYOUT} from "../shell/defaults";

import type {ShellWorkspaceState} from "../shell/types";

import {CREATOR_PROFILE_SCHEMA_VERSION} from "./types";

import type {CreatorProfile, CreatorProfileStore} from "./types";

function cloneDefaultLayout() {
  return structuredClone(
    DEFAULT_SHELL_LAYOUT,
  );
}

function legacyProfileName(
  profileId: string,
) {
  switch (
    profileId
  ) {
    case "code":
      return "Code";
    case "docs":
      return "Docs";
    case "sheets":
      return "Sheets";
    case "modeling":
      return "Modeling";
    case "movie":
      return "Movie / Animation";
    case "game":
      return "Game";
    case "custom":
      return "Custom";
    default:
      return "Default";
  }
}

export function createDefaultCreatorProfile(
  now =
    new Date()
      .toISOString(),
): CreatorProfile {
  return {
    schemaVersion: CREATOR_PROFILE_SCHEMA_VERSION,
    id: "default",
    name: "Default",
    kind: "legacy",
    workspace: "code",
    layout: cloneDefaultLayout(),
    zoom: 1,
    themeMode: "default",
    shortcutOverrides: {},
    toolVisibility: {},
    extensionStack: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createCreatorProfileFromShellState(
  shellState:
    ShellWorkspaceState,
  now =
    new Date()
      .toISOString(),
): CreatorProfile {
  return {
    schemaVersion: CREATOR_PROFILE_SCHEMA_VERSION,
    id: shellState.profileId,
    name: legacyProfileName(shellState.profileId),
    kind: "legacy",
    workspace: shellState.activeWorkspace,
    layout: structuredClone(shellState.layout),
    zoom: shellState.zoom,
    themeMode: shellState.themeMode,
    shortcutOverrides: {},
    toolVisibility: {},
    extensionStack: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultCreatorProfileStore(
  now =
    new Date()
      .toISOString(),
): CreatorProfileStore {
  const profile =
    createDefaultCreatorProfile(
      now,
    );

  return {
    schemaVersion: CREATOR_PROFILE_SCHEMA_VERSION,
    activeProfileId: profile.id,
    profiles: [profile],
    migratedFromShellV1: false,
  };
}
