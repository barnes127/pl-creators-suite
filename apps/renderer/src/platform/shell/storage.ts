import {
  DEFAULT_WORKSPACE_STATE,
} from "./defaults";

import type {
  ShellWorkspaceState,
} from "./types";


const STORAGE_KEY =
  "pl.shell.workspace-state.v1";


function cloneDefault():
  ShellWorkspaceState {
  return structuredClone(
    DEFAULT_WORKSPACE_STATE,
  );
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
      return cloneDefault();
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
