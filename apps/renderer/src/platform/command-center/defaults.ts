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
