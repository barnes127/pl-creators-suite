import {
  useState,
} from "react";

import type {
  ShellWorkspaceState,
} from "../shell/types";

import {
  activateCreatorProfile,
  loadEnsuredCreatorProfileStore,
  saveCreatorProfileStore,
} from "./storage";

import {
  importCreatorProfileIntoStore,
} from "./transfer";

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

  function importProfile(
    serialized: string,
  ):
    CreatorProfile {
    const result =
      importCreatorProfileIntoStore(
        profileStore,
        serialized,
      );
    saveCreatorProfileStore(result.store,);
    setProfileStore(result.store);
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
    profiles: profileStore.profiles,
    activeProfile,
    switchProfile,
    importProfile,
    refreshProfiles,
  };
}
