import type {
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
  DashboardWidgetSize,
} from "../../platform/command-center";


export type DashboardWidgetControlsProps = {
  instance:
    DashboardWidgetInstance;

  definition?:
    DashboardWidgetDefinition;

  onPinnedChange:
    (
      pinned:
        boolean,
    ) =>
      void;

  onHiddenChange:
    (
      hidden:
        boolean,
    ) =>
      void;

  onSizeChange:
    (
      size:
        DashboardWidgetSize,
    ) =>
      void;

  onGroupChange:
    (
      groupId?:
        string,
    ) =>
      void;
};


export function DashboardWidgetControls({
  instance,
  definition,
  onPinnedChange,
  onHiddenChange,
  onSizeChange,
  onGroupChange,
}: DashboardWidgetControlsProps) {
  const minColumns =
    definition?.sizeBounds?.min.columns ??
    1;

  const maxColumns =
    definition?.sizeBounds?.max.columns ??
    6;

  const minRows =
    definition?.sizeBounds?.min.rows ??
    1;

  const maxRows =
    definition?.sizeBounds?.max.rows ??
    6;


  function changeColumns(
    columns:
      number,
  ) {
    const nextColumns =
      Math.min(
        maxColumns,
        Math.max(
          minColumns,
          columns,
        ),
      );

    onSizeChange({
      ...instance.size,
      columns:
        nextColumns,
    });
  }


  function changeRows(
    rows:
      number,
  ) {
    const nextRows =
      Math.min(
        maxRows,
        Math.max(
          minRows,
          rows,
        ),
      );

    onSizeChange({
      ...instance.size,
      rows:
        nextRows,
    });
  }


  return (
    <div 
      className="dashboardWidgetControls"
      role="group"
      aria-label={`Customize ${definition?.title ?? instance.widgetId}`}
    >
      <button
        type="button"
        className="btn btn-subtle"
        aria-pressed={
          instance.pinned
        }
        aria-label={
          `${
            instance.pinned
              ? "Unpin"
              : "Pin"
          } ${definition?.title ?? instance.widgetId}`
        }
        onClick={
          () =>
            onPinnedChange(
              !instance.pinned,
            )
        }
      >
        {instance.pinned
          ? "Unpin"
          : "Pin"}
      </button>

      <button
        type="button"
        className="btn btn-subtle"
        aria-label={`Hide ${definition?.title ?? instance.widgetId}`}
        onClick={() => onHiddenChange(true)}
      >
        Hide
      </button>

      <label className="dashboardWidgetControlField">
        <span>Width</span>
        <input
          type="number"
          min={minColumns}
          max={maxColumns}
          value={instance.size.columns}
          aria-label={`Width for ${definition?.title ?? instance.widgetId}`}
          onChange={
            (event) =>
              changeColumns(
                Number(
                  event.target.value,
                ),
              )
          }
        />
      </label>

      <label className="dashboardWidgetControlField">
        <span>Height</span>
        <input
          type="number"
          min={minRows}
          max={maxRows}
          value={instance.size.rows}
          aria-label={`Height for ${definition?.title ?? instance.widgetId}`}
          onChange={
            (event) =>
              changeRows(
                Number(
                  event.target.value,
                ),
              )
          }
        />
      </label>

      <label className="dashboardWidgetControlField">
        <span>Group</span>
        <input
          type="text"
          value={instance.groupId ?? ""}
          placeholder="None"
          aria-label={`Group for ${definition?.title ?? instance.widgetId}`}
          onChange={
            (event,) =>
              onGroupChange(
                event.target.value ||
                undefined,
              )
          }
        />
      </label>
    </div>
  );
}
