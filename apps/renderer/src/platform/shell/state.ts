import type {
  ShellPanelId,
  ShellThemeMode,
  ShellWorkspaceState,
  WorkspaceProfileId,
} from "./types";


export function setPanelVisibility(
  state: ShellWorkspaceState,
  panel: ShellPanelId,
  visible: boolean,
): ShellWorkspaceState {
  return {
    ...state,

    layout: {
      ...state.layout,

      visibility: {
        ...state.layout.visibility,

        [panel]:
          visible,
      },
    },
  };
}


export function togglePanel(
  state: ShellWorkspaceState,
  panel: ShellPanelId,
): ShellWorkspaceState {
  return setPanelVisibility(
    state,
    panel,
    !state.layout.visibility[
      panel
    ],
  );
}


export function setShellZoom(
  state: ShellWorkspaceState,
  zoom: number,
): ShellWorkspaceState {
  return {
    ...state,

    zoom:
      Math.min(
        2,
        Math.max(
          0.5,
          zoom,
        ),
      ),
  };
}


export function setShellThemeMode(
  state: ShellWorkspaceState,
  themeMode: ShellThemeMode,
): ShellWorkspaceState {
  return {
    ...state,
    themeMode,
  };
}


export function setActiveWorkspace(
  state: ShellWorkspaceState,
  activeWorkspace: string,
): ShellWorkspaceState {
  return {
    ...state,
    activeWorkspace,
  };
}


export function setWorkspaceProfile(
  state: ShellWorkspaceState,
  profileId: WorkspaceProfileId,
): ShellWorkspaceState {
  return {
    ...state,
    profileId,
  };
}
