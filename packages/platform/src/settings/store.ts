import {
  SETTINGS_SCOPE_PRECEDENCE,
  settingsScopeKey,
} from "./scopes";

import type {
  ResolvedSetting,
  SettingsRecord,
  SettingsScope,
  SettingsScopeKind,
  SettingsValue,
} from "./types";


export class SettingsStore {
  private readonly values =
    new Map<
      string,
      SettingsRecord
    >();


  set(
    scope: SettingsScope,
    key: string,
    value: SettingsValue,
  ) {
    const scopeKey =
      settingsScopeKey(
        scope,
      );


    const existing =
      this.values.get(
        scopeKey,
      ) ?? {};


    this.values.set(
      scopeKey,
      {
        ...existing,

        [key]:
          value,
      },
    );
  }


  setMany(
    scope: SettingsScope,
    settings: SettingsRecord,
  ) {
    const scopeKey =
      settingsScopeKey(
        scope,
      );


    const existing =
      this.values.get(
        scopeKey,
      ) ?? {};


    this.values.set(
      scopeKey,
      {
        ...existing,
        ...settings,
      },
    );
  }


  get(
    scope: SettingsScope,
    key: string,
  ): SettingsValue | undefined {
    const scopeKey =
      settingsScopeKey(
        scope,
      );


    return this.values
      .get(
        scopeKey,
      )?.[
        key
      ];
  }


  getAll(
    scope: SettingsScope,
  ): SettingsRecord {
    const scopeKey =
      settingsScopeKey(
        scope,
      );


    return {
      ...(
        this.values.get(
          scopeKey,
        ) ??
        {}
      ),
    };
  }


  delete(
    scope: SettingsScope,
    key: string,
  ) {
    const scopeKey =
      settingsScopeKey(
        scope,
      );


    const existing =
      this.values.get(
        scopeKey,
      );


    if (
      !existing ||
      !(
        key in existing
      )
    ) {
      return false;
    }


    const {
      [
        key
      ]:
        _removed,

      ...remaining
    } =
      existing;


    if (
      Object.keys(
        remaining,
      ).length ===
      0
    ) {
      this.values.delete(
        scopeKey,
      );
    } else {
      this.values.set(
        scopeKey,
        remaining,
      );
    }


    return true;
  }


  clearScope(
    scope: SettingsScope,
  ) {
    return this.values.delete(
      settingsScopeKey(
        scope,
      ),
    );
  }


  resolve(
    key: string,
    scopes: readonly SettingsScope[],
  ): ResolvedSetting | undefined {
    const grouped =
      new Map<
        SettingsScopeKind,
        SettingsScope[]
      >();


    for (
      const scope
      of scopes
    ) {
      const existing =
        grouped.get(
          scope.kind,
        ) ??
        [];

      existing.push(
        scope,
      );

      grouped.set(
        scope.kind,
        existing,
      );
    }


    for (
      const kind
      of SETTINGS_SCOPE_PRECEDENCE
    ) {
      const matchingScopes =
        grouped.get(
          kind,
        ) ??
        [];


      for (
        const scope
        of matchingScopes
      ) {
        const value =
          this.get(
            scope,
            key,
          );


        if (
          value !==
          undefined
        ) {
          return {
            key,
            value,
            sourceScope:
              scope,
          };
        }
      }
    }


    return undefined;
  }


  resolveValue(
    key: string,
    scopes: readonly SettingsScope[],
  ): SettingsValue | undefined {
    return this.resolve(
      key,
      scopes,
    )?.value;
  }
}
