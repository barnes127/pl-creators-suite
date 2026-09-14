import type {
  DashboardProfileState,
} from "./types";


export const DASHBOARD_SCHEMA_VERSION =
  1;


export const DASHBOARD_WIDGET_CONTRACT_VERSION =
  1;


export const FIRST_PARTY_WIDGET_IDS =
  [
    "recents",
    "favorites",
    "templates",
    "tasks",
    "milestones",
    "notifications",
    "releases",
    "learning",
    "project-health",
  ] as const;


export type FirstPartyWidgetId =
  typeof FIRST_PARTY_WIDGET_IDS[number];


export function createDefaultDashboardState(
  profileId:
    string,
): DashboardProfileState {
  return {
    schemaVersion:
      DASHBOARD_SCHEMA_VERSION,

    profileId,

    layoutMode:
      "grid",

    widgets:
      [],
  };
}

export function createDefaultWidgetInstance(
  widgetId:
    string,
  widgetVersion:
    string,
  order:
    number,
): import("./types").DashboardWidgetInstance {
  return {
    instanceId:
      `${widgetId}:default`,

    widgetId,

    widgetVersion,

    position: {
      column:
        0,

      row:
        order,

      order,
    },

    size: {
      columns:
        2,

      rows:
        2,
    },

    pinned:
      false,

    hidden:
      false,
  };
}
