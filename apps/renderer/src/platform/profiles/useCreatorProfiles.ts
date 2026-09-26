import {
  useState,
} from "react";

import type {
  ShellWorkspaceState,
} from "../shell/types";

import {
  activateCreatorProfile,
  loadEnsuredCreatorProfileStore,
} from "./storage";

import type {
  CreatorProfile,
  CreatorProfileStore,
} from "./types";


export function useCreatorProfiles() {
  const [
    profileStore,
    setProfileStore,
  ] =
    useState<CreatorProfileStore>(
      () =>
        loadEnsuredCreatorProfileStore(),
    );


  const activeProfile =
    profileStore.profiles.find(
      (
        profile,
      ) =>
        profile.id ===
        profileStore.activeProfileId,
    );


  function switchProfile(
    profileId:
      string,
    shellState:
      ShellWorkspaceState,
  ):
    CreatorProfile |
    undefined {
    const result =
      activateCreatorProfile(
        profileId,
        shellState,
      );


    if (
      !result
    ) {
      return undefined;
    }


    setProfileStore(
      result.store,
    );


    return result.profile;
  }


  function refreshProfiles() {
    const next =
      loadEnsuredCreatorProfileStore();

    setProfileStore(
      next,
    );

    return next;
  }


  return {
    profileStore,

    profiles:
      profileStore.profiles,

    activeProfile,

    switchProfile,

    refreshProfiles,
  };
}
