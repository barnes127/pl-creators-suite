import type {
  DashboardProfileState,
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
} from "./types";


export type DashboardWidgetCompatibilityState =
  | "compatible"
  | "missing"
  | "incompatible-version";


export type DashboardWidgetCompatibility = {
  state:
    DashboardWidgetCompatibilityState;
  reason?:
    string;
};


function readMajorVersion(
  version:
    string,
): number | null {
  const match =
    /^(\d+)\./.exec(
      version.trim(),
    );

  if (
    !match
  ) {
    return null;
  }

  const major =
    Number(
      match[1],
    );

  return Number.isInteger(
    major,
  )
    ? major
    : null;
}


export function getDashboardWidgetCompatibility(
  instance:
    DashboardWidgetInstance,
  definition?:
    DashboardWidgetDefinition,
): DashboardWidgetCompatibility {
  if (
    !definition
  ) {
    return {
      state:
        "missing",
      reason:
        "The saved widget definition is no longer available.",
    };
  }


  if (
    instance.widgetVersion ===
    definition.version
  ) {
    return {
      state:
        "compatible",
    };
  }


  const instanceMajor =
    readMajorVersion(
      instance.widgetVersion,
    );

  const definitionMajor =
    readMajorVersion(
      definition.version,
    );


  if (
    instanceMajor !==
      null &&
    definitionMajor !==
      null &&
    instanceMajor ===
      definitionMajor
  ) {
    return {
      state:
        "compatible",
      reason:
        "The saved widget can migrate within its current major version.",
    };
  }


  return {
    state:
      "incompatible-version",
    reason:
      `Saved widget version ${instance.widgetVersion} is incompatible with available version ${definition.version}.`,
  };
}


export function reconcileDashboardStateWithDefinitions(
  state:
    DashboardProfileState,
  definitions:
    DashboardWidgetDefinition[],
): DashboardProfileState {
  const definitionsById =
    new Map(
      definitions.map(
        (definition) => [
          definition.id,
          definition,
        ],
      ),
    );


  let changed =
    false;


  const widgets =
    state.widgets.map(
      (instance) => {
        const definition =
          definitionsById.get(
            instance.widgetId,
          );

        if (
          !definition ||
          definition.version ===
            instance.widgetVersion
        ) {
          return instance;
        }


        const compatibility =
          getDashboardWidgetCompatibility(
            instance,
            definition,
          );


        if (
          compatibility.state !==
          "compatible"
        ) {
          return instance;
        }


        changed =
          true;

        return {
          ...instance,
          widgetVersion:
            definition.version,
        };
      },
    );


  if (
    !changed
  ) {
    return state;
  }


  return {
    ...state,
    widgets,
  };
}
