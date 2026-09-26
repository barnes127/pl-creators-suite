import type {
  ShellPanelId,
  ShellWorkspaceState,
} from "../shell/types";

import type {
  CreatorProfile,
  CreatorProfileStore,
} from "./types";


const SHELL_PANEL_IDS:
  readonly ShellPanelId[] = [
    "primary-sidebar",
    "inspector",
    "bottom-panel",
    "copilot",
    "physics",
  ];


export function applyCreatorProfileToShellState(
  state:
    ShellWorkspaceState,
  profile:
    CreatorProfile,
):
  ShellWorkspaceState {
  const layout =
    structuredClone(
      profile.layout,
    );


  for (
    const panelId
    of SHELL_PANEL_IDS
  ) {
    const visible =
      profile.toolVisibility[
        panelId
      ];

    if (
      typeof visible ===
      "boolean"
    ) {
      layout.visibility[
        panelId
      ] =
        visible;
    }
  }


  return {
    ...state,

    profileId:
      profile.id,

    activeWorkspace:
      profile.workspace,

    zoom:
      profile.zoom,

    themeMode:
      profile.themeMode,

    layout,
  };
}


export function captureCreatorProfileEnvironment(
  profile:
    CreatorProfile,
  state:
    ShellWorkspaceState,
  now =
    new Date()
      .toISOString(),
):
  CreatorProfile {
  const toolVisibility = {
    ...profile.toolVisibility,
  };


  for (
    const panelId
    of SHELL_PANEL_IDS
  ) {
    toolVisibility[
      panelId
    ] =
      state.layout.visibility[
        panelId
      ];
  }


  return {
    ...profile,

    workspace:
      state.activeWorkspace,

    zoom:
      state.zoom,

    themeMode:
      state.themeMode,

    layout:
      structuredClone(
        state.layout,
      ),

    toolVisibility,

    updatedAt:
      now,
  };
}


export function captureActiveProfileEnvironment(
  store:
    CreatorProfileStore,
  state:
    ShellWorkspaceState,
):
  CreatorProfileStore {
  const profiles =
    store.profiles.map(
      (
        profile,
      ) =>
        profile.id ===
        store.activeProfileId
          ? captureCreatorProfileEnvironment(
              profile,
              state,
            )
          : profile,
    );


  return {
    ...store,

    profiles,
  };
}
