import type {
  DashboardLayoutMode,
  DashboardProfileState,
  DashboardWidgetInstance,
  DashboardWidgetSize,
} from "./types";


function replaceWidget(
  state:
    DashboardProfileState,
  instanceId:
    string,
  update:
    (
      widget:
        DashboardWidgetInstance,
    ) =>
      DashboardWidgetInstance,
): DashboardProfileState {
  return {
    ...state,

    widgets:
      state.widgets.map(
        (
          widget,
        ) =>
          widget.instanceId ===
          instanceId
            ? update(
                widget,
              )
            : widget,
      ),
  };
}


export function setDashboardLayoutMode(
  state:
    DashboardProfileState,
  layoutMode:
    DashboardLayoutMode,
): DashboardProfileState {
  return {
    ...state,
    layoutMode,
  };
}


export function addDashboardWidget(
  state:
    DashboardProfileState,
  widget:
    DashboardWidgetInstance,
): DashboardProfileState {
  if (
    state.widgets.some(
      (
        current,
      ) =>
        current.instanceId ===
        widget.instanceId,
    )
  ) {
    throw new Error(
      `Dashboard widget instance already exists: ${widget.instanceId}`,
    );
  }

  return {
    ...state,

    widgets: [
      ...state.widgets,
      widget,
    ],
  };
}


export function removeDashboardWidget(
  state:
    DashboardProfileState,
  instanceId:
    string,
): DashboardProfileState {
  return {
    ...state,

    widgets:
      state.widgets.filter(
        (
          widget,
        ) =>
          widget.instanceId !==
          instanceId,
      ),
  };
}


export function moveDashboardWidget(
  state:
    DashboardProfileState,
  instanceId:
    string,
  column:
    number,
  row:
    number,
  order:
    number,
): DashboardProfileState {
  return replaceWidget(
    state,
    instanceId,
    (
      widget,
    ) => ({
      ...widget,

      position: {
        column,
        row,
        order,
      },
    }),
  );
}


export function resizeDashboardWidget(
  state:
    DashboardProfileState,
  instanceId:
    string,
  size:
    DashboardWidgetSize,
): DashboardProfileState {
  return replaceWidget(
    state,
    instanceId,
    (
      widget,
    ) => ({
      ...widget,
      size,
    }),
  );
}


export function setDashboardWidgetPinned(
  state:
    DashboardProfileState,
  instanceId:
    string,
  pinned:
    boolean,
): DashboardProfileState {
  return replaceWidget(
    state,
    instanceId,
    (
      widget,
    ) => ({
      ...widget,
      pinned,
    }),
  );
}


export function setDashboardWidgetHidden(
  state:
    DashboardProfileState,
  instanceId:
    string,
  hidden:
    boolean,
): DashboardProfileState {
  return replaceWidget(
    state,
    instanceId,
    (
      widget,
    ) => ({
      ...widget,
      hidden,
    }),
  );
}


export function setDashboardWidgetGroup(
  state:
    DashboardProfileState,
  instanceId:
    string,
  groupId?:
    string,
): DashboardProfileState {
  return replaceWidget(
    state,
    instanceId,
    (
      widget,
    ) => ({
      ...widget,

      groupId:
        groupId?.trim() ||
        undefined,
    }),
  );
}

export function reorderDashboardWidget(
  state:
    DashboardProfileState,
  instanceId:
    string,
  direction:
    "up" |
    "down",
): DashboardProfileState {
  const ordered =
    [...state.widgets].sort(
      (
        left,
        right,
      ) =>
        left.position.order -
        right.position.order,
    );

  const index =
    ordered.findIndex(
      (
        widget,
      ) =>
        widget.instanceId ===
        instanceId,
    );

  if (
    index ===
    -1
  ) {
    return state;
  }

  const targetIndex =
    direction ===
    "up"
      ? index - 1
      : index + 1;

  if (
    targetIndex <
      0 ||
    targetIndex >=
      ordered.length
  ) {
    return state;
  }

  const next =
    [...ordered];

  [
    next[index],
    next[targetIndex],
  ] = [
    next[targetIndex],
    next[index],
  ];

  return {
    ...state,

    widgets:
      next.map(
        (
          widget,
          order,
        ) => ({
          ...widget,

          position: {
            ...widget.position,
            order,
          },
        }),
      ),
  };
}
