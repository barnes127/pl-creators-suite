import {
  CREATOR_PROFILE_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorProfile,
} from "./types";

import {
  normalizeCreatorProfile,
} from "./validation";


const PROFILE_EXPORT_FORMAT =
  "pl-creator-profile";

const PROFILE_EXPORT_VERSION =
  1;


interface CreatorProfileExportEnvelope {
  format:
    typeof PROFILE_EXPORT_FORMAT;

  exportVersion:
    typeof PROFILE_EXPORT_VERSION;

  exportedAt:
    string;

  profile:
    CreatorProfile;
}


export function exportCreatorProfile(
  profile:
    CreatorProfile,
):
  string {
  const envelope:
    CreatorProfileExportEnvelope = {
      format:
        PROFILE_EXPORT_FORMAT,

      exportVersion:
        PROFILE_EXPORT_VERSION,

      exportedAt:
        new Date()
          .toISOString(),

      profile,
    };


  return JSON.stringify(
    envelope,
    null,
    2,
  );
}


export function importCreatorProfile(
  serialized:
    string,
  importedId?:
    string,
):
  CreatorProfile {
  const parsed:
    unknown =
      JSON.parse(
        serialized,
      );


  if (
    !parsed ||
    typeof parsed !==
      "object"
  ) {
    throw new Error(
      "Profile import is not an object.",
    );
  }


  const envelope =
    parsed as Partial<
      CreatorProfileExportEnvelope
    >;


  if (
    envelope.format !==
      PROFILE_EXPORT_FORMAT ||
    envelope.exportVersion !==
      PROFILE_EXPORT_VERSION
  ) {
    throw new Error(
      "Unsupported creator profile export format.",
    );
  }


  const profile =
    normalizeCreatorProfile(
      envelope.profile,
    );


  if (
    !profile
  ) {
    throw new Error(
      "Creator profile payload is invalid.",
    );
  }


  if (
    profile.schemaVersion !==
      CREATOR_PROFILE_SCHEMA_VERSION
  ) {
    throw new Error(
      "Creator profile schema is incompatible.",
    );
  }


  const id =
    importedId?.trim() ||
    profile.id;


  if (
    !id
  ) {
    throw new Error(
      "Imported profile requires an ID.",
    );
  }


  const now =
    new Date()
      .toISOString();


  return {
    ...profile,

    id,

    kind:
      "custom",

    updatedAt:
      now,
  };
}
