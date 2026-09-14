import {
  validateDashboardWidgetDefinition,
} from "./validation";

import type {
  DashboardWidgetDefinition,
} from "./types";


export class DashboardWidgetRegistry {
  private readonly definitions =
    new Map<
      string,
      DashboardWidgetDefinition
    >();


  register(
    definition:
      DashboardWidgetDefinition,
  ) {
    const normalized =
      validateDashboardWidgetDefinition(
        definition,
      );


    if (
      this.definitions.has(
        normalized.id,
      )
    ) {
      throw new Error(
        `Dashboard widget already registered: ${normalized.id}`,
      );
    }


    this.definitions.set(
      normalized.id,
      normalized,
    );


    return () => {
      this.unregister(
        normalized.id,
      );
    };
  }


  unregister(
    widgetId:
      string,
  ) {
    return this.definitions.delete(
      widgetId,
    );
  }


  get(
    widgetId:
      string,
  ) {
    return this.definitions.get(
      widgetId,
    );
  }


  has(
    widgetId:
      string,
  ) {
    return this.definitions.has(
      widgetId,
    );
  }


  list() {
    return Array
      .from(
        this.definitions.values(),
      )
      .sort(
        (
          left,
          right,
        ) =>
          (
            left.order ??
            0
          ) -
          (
            right.order ??
            0
          ) ||
          left.title.localeCompare(
            right.title,
          ),
      );
  }


  listBySource(
    sourceKind:
      DashboardWidgetDefinition[
        "source"
      ][
        "kind"
      ],
  ) {
    return this
      .list()
      .filter(
        (
          definition,
        ) =>
          definition
            .source
            .kind ===
          sourceKind,
      );
  }
}
