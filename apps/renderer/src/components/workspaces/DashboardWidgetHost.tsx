import {
  DashboardWidgetErrorBoundary,
} from "./DashboardWidgetErrorBoundary";

import {
  FirstPartyDashboardWidget,
} from "./FirstPartyDashboardWidget";

import type {
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
} from "../../platform/command-center";


export type DashboardWidgetHostProps = {
  instance:
    DashboardWidgetInstance;

  definition?:
    DashboardWidgetDefinition;

  projectRoot:
    string;
};


export function DashboardWidgetHost({
  instance,
  definition,
  projectRoot,
}: DashboardWidgetHostProps) {
  if (
    !definition
  ) {
    return (
      <article
        className="commandCenterWidget commandCenterWidgetMissing"
        data-widget-id={
          instance.widgetId
        }
      >
        <div className="commandCenterWidgetHeader">
          <strong>
            Missing Widget
          </strong>

          <span>
            {instance.widgetId}
          </span>
        </div>

        <div className="commandCenterWidgetBody">
          This widget is unavailable, but the rest of your dashboard can still load.
        </div>
      </article>
    );
  }


  return (
    <DashboardWidgetErrorBoundary
      widgetTitle={
        definition.title
      }
    >
      <article
        className="commandCenterWidget"
        data-widget-id={
          definition.id
        }
        data-widget-source={
          definition.source.kind
        }
      >
        <div className="commandCenterWidgetHeader">
          <div>
            <strong>
              {definition.title}
            </strong>

            {definition.description && (
              <span>
                {definition.description}
              </span>
            )}
          </div>

          {instance.pinned && (
            <span
              className="commandCenterWidgetBadge"
              title="Pinned widget"
            >
              Pinned
            </span>
          )}
        </div>

        <div className="commandCenterWidgetBody">
          {definition.source.kind ===
          "first-party" ? (
            <FirstPartyDashboardWidget
              widgetId={
                definition.id
              }
              projectRoot={
                projectRoot
              }
            />
          ) : (
            <div className="commandCenterWidgetPending">
              Extension widget host ready.
            </div>
          )}
        </div>
      </article>
    </DashboardWidgetErrorBoundary>
  );
}
