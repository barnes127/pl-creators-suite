import type {
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
} from "../../platform/command-center";


export type DashboardCustomizationPanelProps = {
  widgets: readonly DashboardWidgetInstance[];
  definitions: readonly DashboardWidgetDefinition[];
  issues: readonly string[];
  unavailable: DashboardUnavailableWidget[];
  onShow:(instanceId:string) => void;
  onAdd:(definition:DashboardWidgetDefinition) => void;
  onRemove:(instanceId: string) => void;
  onMove:
    (
      instanceId:
        string,
      direction:
        "up" |
        "down",
    ) => void;
  
};

export type DashboardUnavailableWidget = {
  id: string;
  title: string;
  sourceId: string;
  state: "disabled" | "incompatible";
  reason: string;
};

export function DashboardCustomizationPanel({
  widgets,
  definitions,
  issues,
  unavailable,
  onShow,
  onAdd,
  onRemove,
  onMove,
}: DashboardCustomizationPanelProps) {
  const instanceWidgetIds =
    new Set(
      widgets.map(
        (
          widget,
        ) =>
          widget.widgetId,
      ),
    );

  const available =
    definitions.filter(
      (
        definition,
      ) =>
        !instanceWidgetIds.has(
          definition.id,
        ),
    );

  const ordered =
    [...widgets].sort(
      (
        left,
        right,
      ) =>
        left.position.order -
        right.position.order,
    );


  return (
    <aside 
      className="dashboardCustomizationPanel"
      role="region"
      aria-label="Dashboard customization"
    >
      <div className="dashboardCustomizationHeader">
        <div>
          <strong>
            Customize Dashboard
          </strong>

          <span>
            Manage visibility, order, and available widgets.
          </span>
        </div>
      </div>


      <div className="dashboardCustomizationSection">
        <strong>
          Dashboard widgets
        </strong>

        {ordered.map(
          (
            instance,
            index,
          ) => {
            const definition =
              definitions.find(
                (
                  candidate,
                ) =>
                  candidate.id ===
                  instance.widgetId,
              );

            return (
              <div
                className="dashboardCustomizationRow"
                key={
                  instance.instanceId
                }
              >
                <div>
                  <strong>
                    {definition?.title ??
                      instance.widgetId}
                  </strong>

                  <span>
                    {instance.hidden
                      ? "Hidden"
                      : instance.pinned
                        ? "Visible · Pinned"
                        : "Visible"}
                  </span>
                </div>

                <div className="dashboardCustomizationActions">
                  {instance.hidden && (
                    <button
                      type="button"
                      className="btn btn-subtle"
                      aria-label={`Show ${definition?.title ?? instance.widgetId}`}
                      onClick={
                        () =>
                          onShow(
                            instance.instanceId,
                          )
                      }
                    >
                      Show
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-subtle"
                    aria-label={`Remove ${definition?.title ?? instance.widgetId} from dashboard`}
                    onClick={
                      () =>
                        onRemove(
                          instance.instanceId,
                        )
                    }
                  >
                    Remove
                  </button>

                  <button
                    type="button"
                    className="btn btn-subtle"
                    aria-label={`Move ${definition?.title ?? instance.widgetId} up`}
                    disabled={index === 0}
                    onClick={
                      () =>
                        onMove(
                          instance.instanceId,
                          "up",
                        )
                    }
                  >
                    Up
                  </button>

                  <button
                    type="button"
                    className="btn btn-subtle"
                    aria-label={`Move ${definition?.title ?? instance.widgetId} down`}
                    disabled={
                      index ===
                      ordered.length -
                        1
                    }
                    onClick={
                      () =>
                        onMove(
                          instance.instanceId,
                          "down",
                        )
                    }
                  >
                    Down
                  </button>
                </div>
              </div>
            );
          },
        )}
      </div>


      {available.length >
        0 && (
        <div className="dashboardCustomizationSection">
          <strong>
            Available widgets
          </strong>

          {available.map(
            (
              definition,
            ) => (
              <div
                className="dashboardCustomizationRow"
                key={
                  definition.id
                }
              >
                <div>
                  <strong>
                    {definition.title}
                  </strong>

                  <span>
                    {definition.source.kind ===
                    "extension"
                      ? `Extension: ${definition.source.id}`
                      : "PL Creators Suite"}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-subtle"
                  aria-label={`Add ${definition.title} to dashboard`}
                  onClick={
                    () =>
                      onAdd(
                        definition,
                      )
                  }
                >
                  Add
                </button>
              </div>
            ),
          )}
        </div>
      )}

      {unavailable.length >
        0 && (
        <div className="dashboardCustomizationSection">
          <h4>
            Unavailable widgets
          </h4>

          {unavailable.map(
            (widget) => (
              <div
                className="dashboardCustomizationRow"
                key={`${widget.sourceId}:${widget.id}:${widget.state}`}
              >
                <div>
                  <strong>
                    {widget.title}
                  </strong>

                  <span>
                    {widget.sourceId}
                  </span>

                  <span>
                    {widget.reason}
                  </span>
                </div>

                <span
                  className="dashboardWidgetAvailabilityBadge"
                  data-widget-availability={
                    widget.state
                  }
                >
                  {widget.state}
                </span>
              </div>
            ),
          )}
        </div>
      )}

      {issues.length >
        0 && (
        <div className="dashboardCustomizationSection">
          <strong>
            Extension widget issues
          </strong>

          {issues.map(
            (
              issue,
            ) => (
              <div
                className="dashboardCustomizationIssue"
                key={
                  issue
                }
              >
                {issue}
              </div>
            ),
          )}
        </div>
      )}
    </aside>
  );
}
