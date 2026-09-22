import {
  DashboardWidgetErrorBoundary,
} from "./DashboardWidgetErrorBoundary";

import {
  FirstPartyDashboardWidget,
} from "./FirstPartyDashboardWidget";

import {
  DashboardWidgetControls,
} from "./DashboardWidgetControls";

import {
  getDashboardWidgetCompatibility,
} from "../../platform/command-center";

import type {
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
  DashboardWidgetSize,
} from "../../platform/command-center";

export type DashboardWidgetHostProps = {
  instance:
    DashboardWidgetInstance;
  definition?:
    DashboardWidgetDefinition;
  projectRoot:
    string;
  customizing:
    boolean;
  onPinnedChange:
    (pinned: boolean) => void;
  onHiddenChange:
    (hidden: boolean) =>void;
  onSizeChange:
    (size: DashboardWidgetSize) =>void;
  onGroupChange:
    (groupId?: string ) => void;
};


export function DashboardWidgetHost({
  instance,
  definition,
  projectRoot,
  customizing,
  onPinnedChange,
  onHiddenChange,
  onSizeChange,
  onGroupChange,
}: DashboardWidgetHostProps) {
  if (
    !definition
  ) {
    return (
      <article
        className="commandCenterWidget commandCenterWidgetMissing"
        data-widget-id={instance.widgetId}
        data-widget-group={instance.groupId ?? ""}
        data-widget-compatibility="missing"
        tabIndex={0}
        aria-label={`Missing dashboard widget ${instance.widgetId}`}
        style={{
          gridColumn:
            `span ${Math.max(
              1,
              instance.size.columns,
            )}`,
          minHeight:
            `${Math.max(
              1,
              instance.size.rows,
            ) * 90}px`,
        }}
      >
        <div className="commandCenterWidgetHeader">
          <strong>
            Missing Widget
          </strong>

          <span>
            {instance.widgetId}
          </span>
        </div>

        {customizing && (
          <DashboardWidgetControls
            instance={instance}
            definition={definition}
            onPinnedChange={onPinnedChange}
            onHiddenChange={onHiddenChange}
            onSizeChange={onSizeChange}
            onGroupChange={onGroupChange}
          />
        )}

        <div className="commandCenterWidgetBody">
          This widget is unavailable, but the rest of your dashboard can still load.
        </div>
      </article>
    );
  }

  const compatibility =
    getDashboardWidgetCompatibility(
      instance,
      definition,
    );


  return (
    <DashboardWidgetErrorBoundary
      widgetTitle={
        definition.title
      }
    >
      <article
        className="commandCenterWidget"
        data-widget-id={definition.id}
        data-widget-source={definition.source.kind}
        data-widget-group={instance.groupId ?? ""}
        data-widget-compatibility={compatibility.state}
        tabIndex={0}
        aria-label={`${definition.title} dashboard widget`}
        style={{
          gridColumn:
            `span ${Math.max(
              1,
              instance.size.columns,
            )}`,
          minHeight:
            `${Math.max(
              1,
              instance.size.rows,
            ) * 90}px`,
        }}
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

        {customizing && (
          <DashboardWidgetControls
            instance={instance}
            definition={definition}
            onPinnedChange={onPinnedChange}
            onHiddenChange={onHiddenChange}
            onSizeChange={onSizeChange}
            onGroupChange={onGroupChange}
          />
        )}

        <div className="commandCenterWidgetBody">
          {compatibility.state ===
          "incompatible-version" ? (
            <div
              className="commandCenterWidgetUnavailable"
              role="status"
            >
              <strong>
                Incompatible widget version
              </strong>
              <span>
                Saved version:
                {" "}
                {instance.widgetVersion}
              </span>
              <span>
                Available version:
                {" "}
                {definition.version}
              </span>
              <span>
                Reset, remove, or update this widget before using it.
              </span>
            </div>
          ) : definition.source.kind ===
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
              {typeof definition.metadata?.content ===
                "string" &&
              definition.metadata.content
                ? definition.metadata.content
                : "Extension widget registered safely. No executable dashboard renderer was requested."}
            </div>
          )}
        </div>
      </article>
    </DashboardWidgetErrorBoundary>
  );
}
