import {DEFAULT_SHELL_LAYOUT} from "../shell/defaults";

import type {ShellPanelLayout} from "../shell/types";

import {CREATOR_PROFILE_SCHEMA_VERSION} from "./types";

import type {
  CreatorProfile,
  CreatorProfileStore,
} from "./types";

interface BuiltInProfileSpec {
  id: string;
  name: string;
  workspace: string;
  primarySidebarWidth: number;
  inspectorWidth: number;
  bottomPanelHeight: number;
}

const BUILT_IN_PROFILE_SPECS:
  readonly BuiltInProfileSpec[] = [
    {
      id: "docs",
      name: "Writing",
      workspace: "docs",
      primarySidebarWidth: 240,
      inspectorWidth: 300,
      bottomPanelHeight: 220,
    },

    {
      id:
        "sheets",

      name:
        "Data",

      workspace:
        "sheets",

      primarySidebarWidth:
        250,

      inspectorWidth:
        300,

      bottomPanelHeight:
        220,
    },

    {
      id:
        "code",

      name:
        "Development",

      workspace:
        "code",

      primarySidebarWidth:
        280,

      inspectorWidth:
        320,

      bottomPanelHeight:
        260,
    },

    {
      id:
        "modeling",

      name:
        "Modeling",

      workspace:
        "modeler",

      primarySidebarWidth:
        230,

      inspectorWidth:
        360,

      bottomPanelHeight:
        240,
    },

    {
      id:
        "movie",

      name:
        "Animation",

      workspace:
        "movie",

      primarySidebarWidth:
        240,

      inspectorWidth:
        340,

      bottomPanelHeight:
        260,
    },

    {
      id:
        "game",

      name:
        "Game",

      workspace:
        "game",

      primarySidebarWidth:
        250,

      inspectorWidth:
        340,

      bottomPanelHeight:
        260,
    },

    {
      id:
        "research",

      name:
        "Research",

      workspace:
        "command-center",

      primarySidebarWidth:
        260,

      inspectorWidth:
        320,

      bottomPanelHeight:
        220,
    },

    {
      id:
        "custom",

      name:
        "Custom",

      workspace:
        "command-center",

      primarySidebarWidth:
        260,

      inspectorWidth:
        320,

      bottomPanelHeight:
        240,
    },
  ];


function createProfileLayout(
  spec:
    BuiltInProfileSpec,
):
  ShellPanelLayout {
  const layout =
    structuredClone(
      DEFAULT_SHELL_LAYOUT,
    );

  layout.primarySidebarWidth =
    spec.primarySidebarWidth;

  layout.inspectorWidth =
    spec.inspectorWidth;

  layout.bottomPanelHeight =
    spec.bottomPanelHeight;

  return layout;
}


function createToolVisibility(
  layout:
    ShellPanelLayout,
) {
  return {
    ...layout.visibility,
  };
}


export function createBuiltInCreatorProfiles(
  now =
    new Date()
      .toISOString(),
):
  CreatorProfile[] {
  return BUILT_IN_PROFILE_SPECS.map(
    (
      spec,
    ) => {
      const layout =
        createProfileLayout(
          spec,
        );

      return {
        schemaVersion:
          CREATOR_PROFILE_SCHEMA_VERSION,

        id:
          spec.id,

        name:
          spec.name,

        kind:
          "built-in",

        workspace:
          spec.workspace,

        layout,

        zoom:
          1,

        themeMode:
          "default",

        shortcutOverrides:
          {},

        toolVisibility:
          createToolVisibility(
            layout,
          ),

        extensionStackMode:
          "inherit",

        extensionStack:
          [],

        createdAt:
          now,

        updatedAt:
          now,
      };
    },
  );
}


export function ensureBuiltInCreatorProfiles(
  state:
    CreatorProfileStore,
  now =
    new Date()
      .toISOString(),
):
  CreatorProfileStore {
  const templates =
    createBuiltInCreatorProfiles(
      now,
    );

  const existingById =
    new Map(
      state.profiles.map(
        (
          profile,
        ) => [
          profile.id,
          profile,
        ],
      ),
    );


  const builtIns =
    templates.map(
      (
        template,
      ) => {
        const existing =
          existingById.get(
            template.id,
          );

        if (
          !existing
        ) {
          return template;
        }

        return {
          ...template,

          workspace:
            existing.workspace,

          layout:
            structuredClone(
              existing.layout,
            ),

          zoom:
            existing.zoom,

          themeMode:
            existing.themeMode,

          shortcutOverrides:
            existing.shortcutOverrides,

          toolVisibility:
            existing.toolVisibility,

          extensionStackMode:
            existing.extensionStackMode,

          extensionStack:
            existing.extensionStack,

          createdAt:
            existing.createdAt,

          updatedAt:
            existing.updatedAt,
        };
      },
    );


  const builtInIds =
    new Set(
      templates.map(
        (
          profile,
        ) =>
          profile.id,
      ),
    );


  const additionalProfiles =
    state.profiles.filter(
      (
        profile,
      ) =>
        !builtInIds.has(
          profile.id,
        ),
    );


  const profiles = [
    ...builtIns,
    ...additionalProfiles,
  ];


  const activeProfileId =
    profiles.some(
      (
        profile,
      ) =>
        profile.id ===
        state.activeProfileId,
    )
      ? state.activeProfileId
      : "code";


  return {
    ...state,

    activeProfileId,

    profiles,
  };
}


export function getActiveCreatorProfile(
  state:
    CreatorProfileStore,
):
  CreatorProfile |
  undefined {
  return state.profiles.find(
    (
      profile,
    ) =>
      profile.id ===
      state.activeProfileId,
  );
}
