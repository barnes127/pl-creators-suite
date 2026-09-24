import type {ShellPanelLayout, ShellThemeMode} from "../shell/types";

export const CREATOR_PROFILE_SCHEMA_VERSION = 1;

export type CreatorProfileKind =
  | "legacy"
  | "built-in"
  | "custom";

export type CreatorShortcutOverrides =
  Readonly<
    Record<
      string,
      string | null
    >
  >;

export type CreatorToolVisibility =
  Readonly<
    Record<
      string,
      boolean
    >
  >;

export interface CreatorProfile {
  schemaVersion: typeof CREATOR_PROFILE_SCHEMA_VERSION;
  id: string;
  name: string;
  kind: CreatorProfileKind;
  workspace: string;
  layout: ShellPanelLayout;
  zoom: number;
  themeMode: ShellThemeMode;
  shortcutOverrides: CreatorShortcutOverrides;
  toolVisibility: CreatorToolVisibility;
  extensionStack: readonly string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfileStore {
  schemaVersion: typeof CREATOR_PROFILE_SCHEMA_VERSION;
  activeProfileId: string;
  profiles: readonly CreatorProfile[];
  migratedFromShellV1: boolean;
}

export type CreatorProfileLoadStatus =
  | "ok"
  | "missing"
  | "recovered"
  | "incompatible";

export interface CreatorProfileLoadResult {
  status: CreatorProfileLoadStatus;
  state: CreatorProfileStore;
  sourceSchemaVersion?: number;
}


export interface ProfileStorageLike {
  getItem(
    key: string,
  ):
    string | null;

  setItem(
    key: string,
    value: string,
  ):
    void;

  removeItem(
    key: string,
  ):
    void;
}
