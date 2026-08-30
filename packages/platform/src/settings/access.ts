import type {
  SettingsScope,
  SettingsValue,
} from "./types";

import type {
  SettingsStore,
} from "./store";


export function getStringSetting(
  store: SettingsStore,
  key: string,
  scopes:
    readonly SettingsScope[],
  fallback: string,
) {
  const value =
    store.resolveValue(
      key,
      scopes,
    );


  return typeof value ===
    "string"
    ? value
    : fallback;
}


export function getNumberSetting(
  store: SettingsStore,
  key: string,
  scopes:
    readonly SettingsScope[],
  fallback: number,
) {
  const value =
    store.resolveValue(
      key,
      scopes,
    );


  return typeof value ===
    "number"
    ? value
    : fallback;
}


export function getBooleanSetting(
  store: SettingsStore,
  key: string,
  scopes:
    readonly SettingsScope[],
  fallback: boolean,
) {
  const value =
    store.resolveValue(
      key,
      scopes,
    );


  return typeof value ===
    "boolean"
    ? value
    : fallback;
}


export function getSetting<
  T extends SettingsValue,
>(
  store: SettingsStore,
  key: string,
  scopes:
    readonly SettingsScope[],
  fallback: T,
): T {
  const value =
    store.resolveValue(
      key,
      scopes,
    );


  return (
    value === undefined
      ? fallback
      : value
  ) as T;
}
