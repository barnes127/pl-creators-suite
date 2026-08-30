import {
  useEffect,
  useState,
} from "react";

import {
  loadShellState,
  resetShellState,
  saveShellState,
} from "./storage";

import {
  setActiveWorkspace,
  setPanelVisibility,
  setShellZoom,
  setWorkspaceProfile,
  togglePanel,
} from "./state";

import type {
  ShellPanelId,
  ShellWorkspaceState,
  WorkspaceProfileId,
} from "./types";


export function useShellState() {
  const [
    shellState,
    setShellStateValue,
  ] = useState<ShellWorkspaceState>(
    () =>
      loadShellState(),
  );


  useEffect(
    () => {
      try {
        saveShellState(
          shellState,
        );
      } catch {
        // Shell state remains usable in memory
        // if persistent storage is unavailable.
      }
    },
    [
      shellState,
    ],
  );


  function setWorkspace(
    workspace: string,
  ) {
    setShellStateValue(
      (current) =>
        setActiveWorkspace(
          current,
          workspace,
        ),
    );
  }


  function setProfile(
    profileId: WorkspaceProfileId,
  ) {
    setShellStateValue(
      (current) =>
        setWorkspaceProfile(
          current,
          profileId,
        ),
    );
  }


  function setPanel(
    panel: ShellPanelId,
    visible: boolean,
  ) {
    setShellStateValue(
      (current) =>
        setPanelVisibility(
          current,
          panel,
          visible,
        ),
    );
  }


  function toggleShellPanel(
    panel: ShellPanelId,
  ) {
    setShellStateValue(
      (current) =>
        togglePanel(
          current,
          panel,
        ),
    );
  }


  function setZoom(
    zoom: number,
  ) {
    setShellStateValue(
      (current) =>
        setShellZoom(
          current,
          zoom,
        ),
    );
  }


  function resetLayout() {
    const reset =
      resetShellState();

    setShellStateValue(
      reset,
    );

    return reset;
  }


  return {
    shellState,

    setWorkspace,

    setProfile,

    setPanel,

    togglePanel:
      toggleShellPanel,

    setZoom,

    resetLayout,
  };
}
