import {
  DEFAULT_SHELL_LAYOUT,
} from "../shell/defaults";

import type {
  ShellPanelLayout,
  ShellThemeMode,
} from "../shell/types";

import {
  CREATOR_PROFILE_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorProfile,
  CreatorProfileKind,
  CreatorProfileStore,
} from "./types";


function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    Boolean(
      value,
    ) &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value,
    )
  );
}


function normalizeBooleanRecord(
  value:
    unknown,
):
  Readonly<
    Record<
      string,
      boolean
    >
  > {
  if (
    !isRecord(
      value,
    )
  ) {
    return {};
  }

  const normalized:
    Record<
      string,
      boolean
    > = {};

  for (
    const [
      key,
      entry,
    ] of Object.entries(
      value,
    )
  ) {
    if (
      typeof entry ===
      "boolean"
    ) {
      normalized[
        key
      ] =
        entry;
    }
  }

  return normalized;
}


function normalizeShortcutOverrides(
  value:
    unknown,
):
  Readonly<
    Record<
      string,
      string | null
    >
  > {
  if (
    !isRecord(
      value,
    )
  ) {
    return {};
  }

  const normalized:
    Record<
      string,
      string | null
    > = {};

  for (
    const [
      key,
      entry,
    ] of Object.entries(
      value,
    )
  ) {
    if (
      typeof entry ===
        "string"
    ) {
      normalized[
        key
      ] =
        entry;

      continue;
    }
    if (
      entry ===
        null
    ) {
      normalized[
        key
      ] =
        null;
    }
  }

  return normalized;
}


function normalizeStringArray(
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

  return Array.from(
    new Set(
      value
        .filter(
          (
            entry,
          ):
            entry is string =>
          typeof entry ===
            "string" &&
          Boolean(
            entry.trim(),
          ),
        )
        .map(
          (
            entry,
          ) =>
            entry.trim(),
        ),
    ),
  );
}


function normalizeProfileKind(
  value:
    unknown,
):
  CreatorProfileKind {
  if (
    value ===
      "built-in" ||
    value ===
      "custom" ||
    value ===
      "legacy"
  ) {
    return value;
  }

  return "custom";
}


function normalizeThemeMode(
  value:
    unknown,
):
  ShellThemeMode {
  return value ===
    "high-contrast"
    ? "high-contrast"
    : "default";
}


function normalizeZoom(
  value:
    unknown,
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 1;
  }

  return Math.min(
    2,
    Math.max(
      0.5,
      value,
    ),
  );
}


function normalizeLayout(
  value:
    unknown,
):
  ShellPanelLayout {
  const fallback =
    structuredClone(
      DEFAULT_SHELL_LAYOUT,
    );

  if (
    !isRecord(
      value,
    )
  ) {
    return fallback;
  }

  const visibility =
    isRecord(
      value.visibility,
    )
      ? value.visibility
      : {};

  for (
    const panelId of Object.keys(
      fallback.visibility,
    )
  ) {
    const candidate =
      visibility[
        panelId
      ];

    if (
      typeof candidate ===
      "boolean"
    ) {
      fallback.visibility[
        panelId as keyof typeof fallback.visibility
      ] =
        candidate;
    }
  }


  const primarySidebarWidth =
    value.primarySidebarWidth;

  if (
    typeof primarySidebarWidth ===
      "number" &&
    Number.isFinite(
      primarySidebarWidth,
    )
  ) {
    fallback.primarySidebarWidth =
      Math.max(
        160,
        Math.min(
          640,
          primarySidebarWidth,
        ),
      );
  }


  const inspectorWidth =
    value.inspectorWidth;

  if (
    typeof inspectorWidth ===
      "number" &&
    Number.isFinite(
      inspectorWidth,
    )
  ) {
    fallback.inspectorWidth =
      Math.max(
        180,
        Math.min(
          720,
          inspectorWidth,
        ),
      );
  }


  const bottomPanelHeight =
    value.bottomPanelHeight;

  if (
    typeof bottomPanelHeight ===
      "number" &&
    Number.isFinite(
      bottomPanelHeight,
    )
  ) {
    fallback.bottomPanelHeight =
      Math.max(
        100,
        Math.min(
          720,
          bottomPanelHeight,
        ),
      );
  }


  return fallback;
}


function normalizeTimestamp(
  value:
    unknown,
  fallback:
    string,
) {
  if (
    typeof value !==
      "string"
  ) {
    return fallback;
  }

  const parsed =
    Date.parse(
      value,
    );

  return Number.isFinite(
    parsed,
  )
    ? new Date(
        parsed,
      )
        .toISOString()
    : fallback;
}


export function normalizeCreatorProfile(
  value:
    unknown,
  now =
    new Date()
      .toISOString(),
):
  CreatorProfile |
  undefined {
  if (
    !isRecord(
      value,
    ) ||
    typeof value.id !==
      "string" ||
    !value.id.trim()
  ) {
    return undefined;
  }

  const id =
    value.id.trim();

  const createdAt =
    normalizeTimestamp(
      value.createdAt,
      now,
    );

  const updatedAt =
    normalizeTimestamp(
      value.updatedAt,
      createdAt,
    );


  return {
    schemaVersion:
      CREATOR_PROFILE_SCHEMA_VERSION,

    id,

    name:
      typeof value.name ===
        "string" &&
      value.name.trim()
        ? value.name.trim()
        : id,

    kind:
      normalizeProfileKind(
        value.kind,
      ),

    workspace:
      typeof value.workspace ===
        "string" &&
      value.workspace.trim()
        ? value.workspace.trim()
        : "code",

    layout:
      normalizeLayout(
        value.layout,
      ),

    zoom:
      normalizeZoom(
        value.zoom,
      ),

    themeMode:
      normalizeThemeMode(
        value.themeMode,
      ),

    shortcutOverrides:
      normalizeShortcutOverrides(
        value.shortcutOverrides,
      ),

    toolVisibility:
      normalizeBooleanRecord(
        value.toolVisibility,
      ),

    extensionStackMode:
      value.extensionStackMode ===
        "explicit"
        ? "explicit"
        : "inherit",

    extensionStack:
      normalizeStringArray(
        value.extensionStack,
      ),

    createdAt,

    updatedAt,
  };
}


export function normalizeCreatorProfileStore(
  value:
    unknown,
  fallback:
    CreatorProfileStore,
):
  CreatorProfileStore {
  if (
    !isRecord(
      value,
    ) ||
    value.schemaVersion !==
      CREATOR_PROFILE_SCHEMA_VERSION
  ) {
    return fallback;
  }


  const profiles =
    Array.isArray(
      value.profiles,
    )
      ? value.profiles
          .map(
            (
              profile,
            ) =>
              normalizeCreatorProfile(
                profile,
              ),
          )
          .filter(
            (
              profile,
            ):
              profile is
                CreatorProfile =>
              Boolean(
                profile,
              ),
          )
      : [];


  const uniqueProfiles =
    Array.from(
      new Map(
        profiles.map(
          (
            profile,
          ) => [
            profile.id,
            profile,
          ],
        ),
      ).values(),
    );


  if (
    uniqueProfiles.length ===
      0
  ) {
    return fallback;
  }


  const requestedActiveProfileId =
    typeof value.activeProfileId ===
      "string"
      ? value.activeProfileId
          .trim()
      : "";


  const activeProfileId =
    uniqueProfiles.some(
      (
        profile,
      ) =>
        profile.id ===
        requestedActiveProfileId,
    )
      ? requestedActiveProfileId
      : uniqueProfiles[
          0
        ].id;


  return {
    schemaVersion:
      CREATOR_PROFILE_SCHEMA_VERSION,

    activeProfileId,

    profiles:
      uniqueProfiles,

    migratedFromShellV1:
      value.migratedFromShellV1 ===
      true,
  };
}
