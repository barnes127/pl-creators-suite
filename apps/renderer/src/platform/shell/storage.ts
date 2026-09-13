import {
  DEFAULT_WORKSPACE_STATE,
} from "./defaults";

import type {
  ShellWorkspaceState,
} from "./types";


const STORAGE_KEY =
  "pl.shell.workspace-state.v1";

const LEGACY_COPILOT_KEY =
  "pl.layout.copilotDrawerOpen";

const LEGACY_PHYSICS_KEY =
  "pl.layout.physicsDrawerOpen";

function cloneDefault():
  ShellWorkspaceState {
  return structuredClone(
    DEFAULT_WORKSPACE_STATE,
  );
}

function readLegacyBoolean(
  key: string,
): boolean | undefined {
  const raw =
    window.localStorage.getItem(
      key,
    );

  if (
    raw ===
    "true"
  ) {
    return true;
  }

  if (
    raw ===
    "false"
  ) {
    return false;
  }

  return undefined;
}

export function normalizeShellState(
  value: unknown,
): ShellWorkspaceState {
  const fallback =
    cloneDefault();

  if (
    !value ||
    typeof value !== "object"
  ) {
    return fallback;
  }


  const candidate =
    value as Partial<ShellWorkspaceState>;


  if (
    typeof candidate.activeWorkspace ===
    "string"
  ) {
    fallback.activeWorkspace =
      candidate.activeWorkspace;
  }


  if (
    typeof candidate.zoom ===
      "number" &&
    Number.isFinite(
      candidate.zoom,
    )
  ) {
    fallback.zoom =
      Math.min(
        2,
        Math.max(
          0.5,
          candidate.zoom,
        ),
      );
  }


  if (
    candidate.themeMode ===
      "high-contrast" ||
    candidate.themeMode ===
      "default"
  ) {
    fallback.themeMode =
      candidate.themeMode;
  }


  if (
    candidate.layout &&
    typeof candidate.layout ===
      "object"
  ) {
    fallback.layout = {
      ...fallback.layout,
      ...candidate.layout,

      visibility: {
        ...fallback.layout.visibility,
        ...candidate.layout.visibility,
      },
    };
  }


  return fallback;
}


export function loadShellState():
  ShellWorkspaceState {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      const migrated =
        cloneDefault();

      const legacyCopilot =
        readLegacyBoolean(
          LEGACY_COPILOT_KEY,
        );

      const legacyPhysics =
        readLegacyBoolean(
          LEGACY_PHYSICS_KEY,
        );

      if (
        legacyCopilot !==
        undefined
      ) {
        migrated.layout.visibility.copilot =
          legacyCopilot;
      }

      if (
        legacyPhysics !==
        undefined
      ) {
        migrated.layout.visibility.physics =
          legacyPhysics;
      }

      return migrated;
    }

    return normalizeShellState(
      JSON.parse(
        raw,
      ),
    );
  } catch {
    return cloneDefault();
  }
}


export function saveShellState(
  state: ShellWorkspaceState,
) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      state,
    ),
  );

  window.localStorage.setItem(
    LEGACY_COPILOT_KEY,
    String(
      state.layout.visibility.copilot,
    ),
  );

  window.localStorage.setItem(
    LEGACY_PHYSICS_KEY,
    String(
      state.layout.visibility.physics,
    ),
  );
}

export function resetShellState():
  ShellWorkspaceState {
  const state =
    cloneDefault();

  try {
    window.localStorage.removeItem(
      STORAGE_KEY,
    );
  } catch {
    // Reset still succeeds in memory.
  }

  return state;
}
