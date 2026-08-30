export type SettingsScopeKind =
  | "application"
  | "profile"
  | "project"
  | "slice"
  | "language"
  | "extension"
  | "provider";


export interface SettingsScope {
  kind: SettingsScopeKind;

  id?: string;
}


export type SettingsValue =
  | string
  | number
  | boolean
  | null
  | SettingsValue[]
  | {
      [key: string]:
        SettingsValue;
    };


export type SettingsRecord =
  Record<
    string,
    SettingsValue
  >;


export interface SettingsEntry {
  scope: SettingsScope;

  key: string;

  value: SettingsValue;
}


export interface ResolvedSetting {
  key: string;

  value: SettingsValue;

  sourceScope: SettingsScope;
}
