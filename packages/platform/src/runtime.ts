import {
  CapabilityRegistry,
} from "./capabilities";

import {
  AssetDependencyGraph,
  AssetRegistry,
} from "./assets";

import {
  CommandApi,
  CommandRegistry,
} from "./commands";

import {
  createPlatformEventBus,
  EventApi,
} from "./events";

import {
  ServiceRegistry,
} from "./services";

import {
  SettingsApi,
  SettingsStore,
} from "./settings";

import {
  SearchApi,
  SearchProviderRegistry,
} from "./search";

import {
  NotificationCenter,
} from "./notifications";

import {
  ThemeApi,
  ThemeRegistry,
} from "./themes";

import {
  TemplateApi,
  TemplateRegistry,
} from "./templates";

import {
  UiApi,
  UiContributionRegistry,
} from "./ui";

export function createPlatformRuntime() {
  const settings =
    new SettingsStore();

  const commands =
    new CommandRegistry();

  const events =
    createPlatformEventBus();

  const search =
    new SearchProviderRegistry();

  const ui =
    new UiContributionRegistry();

  const themes =
    new ThemeRegistry();

  const templates =
    new TemplateRegistry();

  return {
    commands,

    commandApi:
      new CommandApi(
        commands,
      ),

    capabilities:
      new CapabilityRegistry(),

    events,

    eventApi:
      new EventApi(
        events,
      ),

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

    search,

    searchApi:
      new SearchApi(
        search,
      ),

    ui,

    uiApi:
      new UiApi(
        ui,
      ),

    themes,

    themeApi:
      new ThemeApi(
        themes,
      ),

    templates,

    templateApi:
      new TemplateApi(
        templates,
      ),
  };
}


export type PlatformRuntime =
  ReturnType<
    typeof createPlatformRuntime
  >;
