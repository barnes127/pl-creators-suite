import type {
  ShellPanelLayout,
  ShellWorkspaceProfile,
  ShellWorkspaceState,
} from "./types";


export const DEFAULT_SHELL_LAYOUT:
  ShellPanelLayout = {
    visibility: {
      "primary-sidebar": true,
      inspector: true,
      "bottom-panel": true,
      copilot: true,
      physics: false,
    },

    primarySidebarWidth: 260,

    inspectorWidth: 320,

    bottomPanelHeight: 240,
  };


export const DEFAULT_WORKSPACE_STATE:
  ShellWorkspaceState = {
    activeWorkspace: "code",

    profileId: "default",

    zoom: 1,

    themeMode: "default",

    layout:
      structuredClone(
        DEFAULT_SHELL_LAYOUT,
      ),
  };


export const BUILT_IN_WORKSPACE_PROFILES:
  ShellWorkspaceProfile[] = [
    {
      id: "default",

      name: "Default",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "code",

      name: "Code",

      workspace: "code",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "docs",

      name: "Docs",

      workspace: "docs",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "sheets",

      name: "Sheets",

      workspace: "sheets",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "modeling",

      name: "Modeling",

      workspace: "modeling",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "movie",

      name: "Movie / Animation",

      workspace: "movie",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },

    {
      id: "game",

      name: "Game",

      workspace: "game",

      layout:
        structuredClone(
          DEFAULT_SHELL_LAYOUT,
        ),
    },
  ];
