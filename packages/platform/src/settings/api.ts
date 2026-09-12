import type {
  SettingsRecord,
  SettingsScope,
  SettingsValue,
} from "./types";

import type {
  SettingsStore,
} from "./store";

export const SETTINGS_API_SERVICE_ID =
  "core.settings";

export class SettingsApi {
  constructor(
    private readonly store:
      SettingsStore,
  ) {}

  get(
    scope: SettingsScope,
    key: string,
  ) {
    return this.store.get(
      scope,
      key,
    );
  }

  getAll(
    scope: SettingsScope,
  ) {
    return this.store
      .getAll(
        scope,
      );
  }

  set(
    scope: SettingsScope,
    key: string,
    value: SettingsValue,
  ) {
    this.store.set(
      scope,
      key,
      value,
    );
  }

  setMany(
    scope: SettingsScope,
    settings:
      SettingsRecord,
  ) {
    this.store.setMany(
      scope,
      settings,
    );
  }

  delete(
    scope: SettingsScope,
    key: string,
  ) {
    return this.store.delete(
      scope,
      key,
    );
  }

  clearScope(
    scope: SettingsScope,
  ) {
    return this.store
      .clearScope(
        scope,
      );
  }

  resolve(
    key: string,
    scopes:
      readonly SettingsScope[],
  ) {
    return this.store.resolve(
      key,
      scopes,
    );
  }

  resolveValue(
    key: string,
    scopes:
      readonly SettingsScope[],
  ) {
    return this.store
      .resolveValue(
        key,
        scopes,
      );
  }
}
