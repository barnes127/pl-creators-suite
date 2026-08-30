import type {
  SettingsScope,
  SettingsScopeKind,
} from "./types";


export const SETTINGS_SCOPE_PRECEDENCE:
  readonly SettingsScopeKind[] = [
    "provider",
    "extension",
    "language",
    "slice",
    "project",
    "profile",
    "application",
  ];


export function settingsScopeKey(
  scope: SettingsScope,
) {
  if (
    scope.kind ===
    "application"
  ) {
    return "application";
  }


  if (
    !scope.id
  ) {
    throw new Error(
      `Settings scope ${scope.kind} requires an id.`,
    );
  }


  return `${scope.kind}:${scope.id}`;
}


export function createSettingsScope(
  kind: SettingsScopeKind,
  id?: string,
): SettingsScope {
  return {
    kind,
    id,
  };
}
