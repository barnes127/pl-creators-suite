import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  loadDashboardState,
  resetDashboardState,
  saveDashboardState,
} from "./storage";

import type {
  DashboardProfileState,
} from "./types";


export function useDashboardState(
  profileId:
    string,
) {
  const [
    state,
    setState,
  ] =
    useState<
      DashboardProfileState
    >(
      () =>
        loadDashboardState(
          profileId,
        ),
    );


  useEffect(
    () => {
      setState(
        loadDashboardState(
          profileId,
        ),
      );
    },
    [
      profileId,
    ],
  );


  useEffect(
    () => {
      saveDashboardState(
        state,
      );
    },
    [
      state,
    ],
  );


  const reset =
    useCallback(
      () => {
        setState(
          resetDashboardState(
            profileId,
          ),
        );
      },
      [
        profileId,
      ],
    );


  return {
    state,
    setState,
    reset,
  };
}
