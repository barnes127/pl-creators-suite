import {
  DASHBOARD_SCHEMA_VERSION,
  createDefaultDashboardState,
} from "./defaults";

import type {
  DashboardProfileState,
  DashboardWidgetInstance,
} from "./types";


const STORAGE_PREFIX =
  "pl.command-center.dashboard.v1";


function storageKey(
  profileId:
    string,
) {
  return `${STORAGE_PREFIX}.${profileId}`;
}


function isPositiveInteger(
  value:
    unknown,
) {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value,
    ) &&
    value >
      0
  );
}


function isNonNegativeInteger(
  value:
    unknown,
) {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value,
    ) &&
    value >=
      0
  );
}


function normalizeWidget(
  value:
    unknown,
):
  DashboardWidgetInstance |
  undefined {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return undefined;
  }

  const candidate =
    value as Partial<
      DashboardWidgetInstance
    >;


  if (
    typeof candidate.instanceId !==
      "string" ||
    !candidate.instanceId.trim() ||
    typeof candidate.widgetId !==
      "string" ||
    !candidate.widgetId.trim() ||
    typeof candidate.widgetVersion !==
      "string" ||
    !candidate.widgetVersion.trim()
  ) {
    return undefined;
  }


  if (
    !candidate.position ||
    !isNonNegativeInteger(
      candidate.position.column,
    ) ||
    !isNonNegativeInteger(
      candidate.position.row,
    ) ||
    !isNonNegativeInteger(
      candidate.position.order,
    )
  ) {
    return undefined;
  }


  if (
    !candidate.size ||
    !isPositiveInteger(
      candidate.size.columns,
    ) ||
    !isPositiveInteger(
      candidate.size.rows,
    )
  ) {
    return undefined;
  }


  return {
    instanceId:
      candidate.instanceId.trim(),

    widgetId:
      candidate.widgetId.trim(),

    widgetVersion:
      candidate.widgetVersion.trim(),

    position: {
      column:
        candidate.position.column,

      row:
        candidate.position.row,

      order:
        candidate.position.order,
    },

    size: {
      columns:
        candidate.size.columns,

      rows:
        candidate.size.rows,
    },

    pinned:
      candidate.pinned ===
      true,

    hidden:
      candidate.hidden ===
      true,

    groupId:
      typeof candidate.groupId ===
        "string" &&
      candidate.groupId.trim()
        ? candidate.groupId.trim()
        : undefined,
  };
}


export function normalizeDashboardState(
  profileId:
    string,
  value:
    unknown,
): DashboardProfileState {
  const fallback =
    createDefaultDashboardState(
      profileId,
    );


  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return fallback;
  }


  const candidate =
    value as Partial<
      DashboardProfileState
    >;


  if (
    candidate.schemaVersion !==
    DASHBOARD_SCHEMA_VERSION
  ) {
    return fallback;
  }


  const layoutMode =
    candidate.layoutMode ===
      "list"
      ? "list"
      : "grid";


  const widgets =
    Array.isArray(
      candidate.widgets,
    )
      ? candidate.widgets
          .map(
            normalizeWidget,
          )
          .filter(
            (
              widget,
            ):
              widget is
                DashboardWidgetInstance =>
              Boolean(
                widget,
              ),
          )
      : [];


  const seen =
    new Set<
      string
    >();


  const uniqueWidgets =
    widgets.filter(
      (
        widget,
      ) => {
        if (
          seen.has(
            widget.instanceId,
          )
        ) {
          return false;
        }

        seen.add(
          widget.instanceId,
        );

        return true;
      },
    );


  return {
    schemaVersion:
      DASHBOARD_SCHEMA_VERSION,

    profileId,

    layoutMode,

    widgets:
      uniqueWidgets,
  };
}


export function loadDashboardState(
  profileId:
    string,
): DashboardProfileState {
  try {
    const raw =
      window.localStorage.getItem(
        storageKey(
          profileId,
        ),
      );


    if (
      !raw
    ) {
      return createDefaultDashboardState(
        profileId,
      );
    }


    return normalizeDashboardState(
      profileId,
      JSON.parse(
        raw,
      ),
    );
  } catch {
    return createDefaultDashboardState(
      profileId,
    );
  }
}


export function saveDashboardState(
  state:
    DashboardProfileState,
) {
  window.localStorage.setItem(
    storageKey(
      state.profileId,
    ),
    JSON.stringify(
      state,
    ),
  );
}


export function resetDashboardState(
  profileId:
    string,
): DashboardProfileState {
  try {
    window.localStorage.removeItem(
      storageKey(
        profileId,
      ),
    );
  } catch {
    // Reset still succeeds in memory.
  }


  return createDefaultDashboardState(
    profileId,
  );
}
