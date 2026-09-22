import {
  DASHBOARD_WIDGET_CONTRACT_VERSION,
} from "./defaults";

import type {
  DashboardWidgetDefinition,
  DashboardWidgetSize,
  DashboardWidgetSizeBounds,
} from "./types";


export type DashboardExtensionPlugin = {
  id:
    string;

  version:
    string;

  enabled:
    boolean;

  permissions?:
    readonly string[];

  contributes?:
    Record<
      string,
      unknown
    >;
};


export type ExtensionDashboardWidgetResult = {
  definitions:
    DashboardWidgetDefinition[];

  issues:
    string[];
};


function isObject(
  value:
    unknown,
): value is
  Record<
    string,
    unknown
  > {
  return Boolean(
    value &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value,
    ),
  );
}


function readStringArray(
  value:
    unknown,
) {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
      ) =>
        String(
          item ||
          "",
        ).trim(),
    )
    .filter(
      Boolean,
    );
}


function readSize(
  value:
    unknown,
  fallback:
    DashboardWidgetSize,
): DashboardWidgetSize {
  if (
    !isObject(
      value,
    )
  ) {
    return fallback;
  }

  const columns =
    Number(
      value.columns,
    );

  const rows =
    Number(
      value.rows,
    );

  if (
    !Number.isInteger(
      columns,
    ) ||
    columns <
      1 ||
    !Number.isInteger(
      rows,
    ) ||
    rows <
      1
  ) {
    return fallback;
  }

  return {
    columns,
    rows,
  };
}


function readSizeBounds(
  value:
    unknown,
):
  DashboardWidgetSizeBounds |
  undefined {
  if (
    !isObject(
      value,
    )
  ) {
    return undefined;
  }

  const min =
    readSize(
      value.min,
      {
        columns:
          1,

        rows:
          1,
      },
    );

  const max =
    readSize(
      value.max,
      {
        columns:
          6,

        rows:
          6,
      },
    );

  if (
    min.columns >
      max.columns ||
    min.rows >
      max.rows
  ) {
    return undefined;
  }

  return {
    min,
    max,
  };
}


export function createExtensionDashboardWidgetDefinitions(
  plugins:
    readonly DashboardExtensionPlugin[],
): ExtensionDashboardWidgetResult {
  const definitions:
    DashboardWidgetDefinition[] =
    [];

  const issues:
    string[] =
    [];


  for (
    const plugin
    of plugins
  ) {
    if (
      !plugin.enabled
    ) {
      continue;
    }

    const contributes =
      plugin.contributes;

    const rawWidgets =
      contributes?.dashboardWidgets;

    if (
      rawWidgets ===
      undefined
    ) {
      continue;
    }

    if (
      !Array.isArray(
        rawWidgets,
      )
    ) {
      issues.push(
        `${plugin.id}: dashboardWidgets must be an array`,
      );

      continue;
    }


    for (
      const value
      of rawWidgets
    ) {
      if (
        !isObject(
          value,
        )
      ) {
        issues.push(
          `${plugin.id}: ignored malformed dashboard widget contribution`,
        );

        continue;
      }

      const contributionId =
        String(
          value.id ||
          "",
        ).trim();

      const title =
        String(
          value.title ||
          "",
        ).trim();

      if (
        !contributionId ||
        !title
      ) {
        issues.push(
          `${plugin.id}: dashboard widget requires id and title`,
        );

        continue;
      }

      const requiredPermissions =
        readStringArray(
          value.requiredPermissions,
        );

      const declaredPermissions =
        new Set(
          plugin.permissions ??
          [],
        );

      const missingPermission =
        requiredPermissions.find(
          (
            permission,
          ) =>
            !declaredPermissions.has(
              permission,
            ),
        );

      if (
        missingPermission
      ) {
        issues.push(
          `${plugin.id}.${contributionId}: undeclared permission ${missingPermission}`,
        );

        continue;
      }

      const defaultSize =
        readSize(
          value.defaultSize,
          {
            columns:
              2,

            rows:
              2,
          },
        );

      const content =
        typeof value.content ===
          "string"
          ? value.content.trim()
          : "";

      definitions.push({
        id:
          `${plugin.id}.${contributionId}`,

        contractVersion:
          Number(
            value.contractVersion ??
            DASHBOARD_WIDGET_CONTRACT_VERSION,
          ),

        version:
          String(
            value.version ||
            plugin.version ||
            "0.0.0",
          ).trim(),

        title,

        description:
          typeof value.description ===
            "string"
            ? value.description.trim()
            : undefined,

        source: {
          kind:
            "extension",

          id:
            plugin.id,
        },

        defaultSize,

        sizeBounds:
          readSizeBounds(
            value.sizeBounds,
          ),

        defaultPinned:
          value.defaultPinned ===
          true,

        defaultHidden:
          value.defaultHidden ===
          true,

        defaultGroupId:
          typeof value.defaultGroupId ===
            "string"
            ? value.defaultGroupId.trim() ||
              undefined
            : undefined,

        order:
          Number.isInteger(
            value.order,
          )
            ? Number(
                value.order,
              )
            : undefined,

        requiredPermissions,

        requiredCapabilities:
          readStringArray(
            value.requiredCapabilities,
          ),

        metadata: {
          extensionContributionId:
            contributionId,

          content,
        },
      });
    }
  }


  return {
    definitions,
    issues,
  };
}
