import {
  DASHBOARD_WIDGET_CONTRACT_VERSION,
  FIRST_PARTY_WIDGET_IDS,
} from "./defaults";

import type {
  DashboardProfileState,
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
} from "./types";


const FIRST_PARTY_WIDGET_VERSION =
  "1.0.0";


export const FIRST_PARTY_WIDGET_DEFINITIONS:
  readonly DashboardWidgetDefinition[] =
  [
    {
      id:
        "recents",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Recent Projects",

      description:
        "Quick access to recently opened projects.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        0,
    },

    {
      id:
        "favorites",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Favorites",

      description:
        "Pinned creator resources and shortcuts.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        1,
    },

    {
      id:
        "templates",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Templates",

      description:
        "Available suite and project templates.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        2,
    },

    {
      id:
        "tasks",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Tasks",

      description:
        "Background and operational task activity.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        3,
    },

    {
      id:
        "milestones",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Milestones",

      description:
        "Project and creator milestone tracking.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        4,
    },

    {
      id:
        "notifications",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Notifications",

      description:
        "Recent suite and project notifications.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        5,
    },

    {
      id:
        "releases",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Releases",

      description:
        "Installed build and release information.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        6,
    },

    {
      id:
        "learning",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Learning",

      description:
        "Learning progress and creator development.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      order:
        7,
    },

    {
      id:
        "project-health",

      contractVersion:
        DASHBOARD_WIDGET_CONTRACT_VERSION,

      version:
        FIRST_PARTY_WIDGET_VERSION,

      title:
        "Project Health",

      description:
        "Operational health and suite status.",

      source: {
        kind:
          "first-party",

        id:
          "pl-command-center",
      },

      defaultSize: {
        columns:
          2,

        rows:
          2,
      },

      defaultPinned:
        true,

      order:
        8,
    },
  ];


export function registerFirstPartyDashboardWidgets(
  register:
    (
      definition:
        DashboardWidgetDefinition,
    ) => void,
) {
  for (
    const definition
    of FIRST_PARTY_WIDGET_DEFINITIONS
  ) {
    register(
      definition,
    );
  }
}


export function createFirstPartyDashboardInstances():
  DashboardWidgetInstance[] {
  return FIRST_PARTY_WIDGET_IDS.map(
    (
      widgetId,
      order,
    ) => {
      const definition =
        FIRST_PARTY_WIDGET_DEFINITIONS.find(
          (
            candidate,
          ) =>
            candidate.id ===
            widgetId,
        );

      if (
        !definition
      ) {
        throw new Error(
          `Missing first-party widget definition: ${widgetId}`,
        );
      }

      return {
        instanceId:
          `${widgetId}:default`,

        widgetId,

        widgetVersion:
          definition.version,

        position: {
          column:
            order %
            3,

          row:
            Math.floor(
              order /
              3,
            ),

          order,
        },

        size:
          definition.defaultSize,

        pinned:
          definition.defaultPinned ??
          false,

        hidden:
          definition.defaultHidden ??
          false,

        groupId:
          definition.defaultGroupId,
      };
    },
  );
}


export function populateFirstPartyDashboardState(
  state:
    DashboardProfileState,
): DashboardProfileState {
  if (
    state.widgets.length >
    0
  ) {
    return state;
  }

  return {
    ...state,

    widgets:
      createFirstPartyDashboardInstances(),
  };
}
