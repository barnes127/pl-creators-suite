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
  SettingsStore,
} from "./settings";

import {
  SearchProviderRegistry,
} from "./search";

export function createPlatformRuntime() {
  return {
    commands:
      new CommandRegistry(),

    capabilities:
      new CapabilityRegistry(),

    events:
      createPlatformEventBus(),

    settings:
      new SettingsStore(),

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
