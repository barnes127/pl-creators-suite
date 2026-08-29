export type ShellPanelId =
  | "primary-sidebar"
  | "inspector"
  | "bottom-panel"
  | "copilot"
  | "physics";

export type ShellPanelVisibility = Record<
  ShellPanelId,
  boolean
>;

export type WorkspaceProfileId =
  | "default"
  | "code"
  | "docs"
  | "sheets"
  | "modeling"
  | "movie"
  | "game"
  | "custom";

export type ShellThemeMode =
  | "default"
  | "high-contrast";

export interface ShellPanelLayout {
  visibility: ShellPanelVisibility;

  primarySidebarWidth: number;

  inspectorWidth: number;

  bottomPanelHeight: number;
}

export interface ShellWorkspaceState {
  activeWorkspace: string;

  profileId: WorkspaceProfileId;

  zoom: number;

  themeMode: ShellThemeMode;

  layout: ShellPanelLayout;
}

export interface ShellWorkspaceProfile {
  id: WorkspaceProfileId;

  name: string;

  workspace?: string;

  layout: ShellPanelLayout;
}

export interface ShellSaveState {
  dirty: boolean;

  saving: boolean;

  lastSavedAt?: string;

  error?: string;
}
