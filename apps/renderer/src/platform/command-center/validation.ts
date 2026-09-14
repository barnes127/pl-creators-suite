import {
  DASHBOARD_WIDGET_CONTRACT_VERSION,
} from "./defaults";

import type {
  DashboardWidgetDefinition,
  DashboardWidgetSize,
} from "./types";


export class DashboardWidgetValidationError
  extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "DashboardWidgetValidationError";
  }
}


function assertNonEmptyString(
  value:
    string,
  field:
    string,
) {
  if (
    !value.trim()
  ) {
    throw new DashboardWidgetValidationError(
      `${field} cannot be empty.`,
    );
  }
}


function assertPositiveInteger(
  value:
    number,
  field:
    string,
) {
  if (
    !Number.isInteger(
      value,
    ) ||
    value <
      1
  ) {
    throw new DashboardWidgetValidationError(
      `${field} must be a positive integer.`,
    );
  }
}


function assertWidgetSize(
  size:
    DashboardWidgetSize,
  field:
    string,
) {
  assertPositiveInteger(
    size.columns,
    `${field}.columns`,
  );

  assertPositiveInteger(
    size.rows,
    `${field}.rows`,
  );
}


function assertVersion(
  version:
    string,
) {
  if (
    !/^\d+\.\d+\.\d+$/
      .test(
        version.trim(),
      )
  ) {
    throw new DashboardWidgetValidationError(
      "Widget version must use major.minor.patch format.",
    );
  }
}


export function validateDashboardWidgetDefinition(
  definition:
    DashboardWidgetDefinition,
) {
  assertNonEmptyString(
    definition.id,
    "Widget ID",
  );

  assertNonEmptyString(
    definition.title,
    "Widget title",
  );

  assertNonEmptyString(
    definition.source.id,
    "Widget source ID",
  );

  if (
    definition.contractVersion !==
    DASHBOARD_WIDGET_CONTRACT_VERSION
  ) {
    throw new DashboardWidgetValidationError(
      `Unsupported widget contract version: ${definition.contractVersion}.`,
    );
  }

  assertVersion(
    definition.version,
  );

  assertWidgetSize(
    definition.defaultSize,
    "defaultSize",
  );

  if (
    definition.sizeBounds
  ) {
    assertWidgetSize(
      definition.sizeBounds.min,
      "sizeBounds.min",
    );

    assertWidgetSize(
      definition.sizeBounds.max,
      "sizeBounds.max",
    );

    if (
      definition
        .sizeBounds
        .min
        .columns >
        definition
          .sizeBounds
          .max
          .columns ||
      definition
        .sizeBounds
        .min
        .rows >
        definition
          .sizeBounds
          .max
          .rows
    ) {
      throw new DashboardWidgetValidationError(
        "Widget minimum size cannot exceed maximum size.",
      );
    }

    if (
      definition
        .defaultSize
        .columns <
        definition
          .sizeBounds
          .min
          .columns ||
      definition
        .defaultSize
        .columns >
        definition
          .sizeBounds
          .max
          .columns ||
      definition
        .defaultSize
        .rows <
        definition
          .sizeBounds
          .min
          .rows ||
      definition
        .defaultSize
        .rows >
        definition
          .sizeBounds
          .max
          .rows
    ) {
      throw new DashboardWidgetValidationError(
        "Widget default size must remain inside its size bounds.",
      );
    }
  }

  return {
    ...definition,

    id:
      definition.id.trim(),

    title:
      definition.title.trim(),

    version:
      definition.version.trim(),

    source: {
      ...definition.source,

      id:
        definition
          .source
          .id
          .trim(),
    },

    requiredPermissions:
      definition.requiredPermissions ??
      [],

    requiredCapabilities:
      definition.requiredCapabilities ??
      [],
  };
}
