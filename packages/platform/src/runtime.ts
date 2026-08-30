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
  };
}


export type PlatformRuntime =
  ReturnType<
    typeof createPlatformRuntime
  >;
