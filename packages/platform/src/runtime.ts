import {
  CapabilityRegistry,
} from "./capabilities";

import {
  AssetDependencyGraph,
  AssetRegistry,
} from "./assets";

import {
  CommandRegistry,
} from "./commands";

import {
  createPlatformEventBus,
} from "./events";

import {
  ServiceRegistry,
} from "./services";

import {
  SettingsApi,
  SettingsStore,
} from "./settings";

import {
  SearchProviderRegistry,
} from "./search";

import {
  NotificationCenter,
} from "./notifications";

export function createPlatformRuntime() {
  const settings =
    new SettingsStore();
  return {
    commands:
      new CommandRegistry(),

    capabilities:
      new CapabilityRegistry(),

    events:
      createPlatformEventBus(),

    settings,

    settingsApi:
      new SettingsApi(
        settings,
      ),

    notifications:
      new NotificationCenter(),

    services:
      new ServiceRegistry(),

    assets:
      new AssetRegistry(),

    assetDependencies:
      new AssetDependencyGraph(),

    search:
      new SearchProviderRegistry(),
  };
}


export type PlatformRuntime =
  ReturnType<
    typeof createPlatformRuntime
  >;
