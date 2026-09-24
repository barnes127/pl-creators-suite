import {
  DEFAULT_SHELL_LAYOUT,
} from "../shell/defaults";

import {
  CREATOR_SESSION_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorSessionRecord,
  CreatorSessionStore,
} from "./types";


export function createEmptyCreatorSessionStore():
  CreatorSessionStore {
  return {
    schemaVersion:
      CREATOR_SESSION_SCHEMA_VERSION,

    activeSessionId:
      null,

    sessions:
      [],
  };
}


export function createCreatorSessionRecord(
  input: {
    id:
      string;

    profileId:
      string;

    activeWorkspace:
      string;

    projectRoot?:
      string | null;

    layout?:
      CreatorSessionRecord[
        "layout"
      ];

    startedAt?:
      string;

    updatedAt?:
      string;

    cleanShutdown?:
      boolean;
  },
):
  CreatorSessionRecord {
  const now =
    new Date()
      .toISOString();

  const startedAt =
    input.startedAt ??
    now;


  return {
    schemaVersion:
      CREATOR_SESSION_SCHEMA_VERSION,

    id:
      input.id,

    profileId:
      input.profileId,

    projectRoot:
      input.projectRoot ??
      null,

    activeWorkspace:
      input.activeWorkspace,

    layout:
      structuredClone(
        input.layout ??
        DEFAULT_SHELL_LAYOUT,
      ),

    openResources:
      [],

    selectedResources:
      [],

    taskRefs:
      [],

    terminalRefs:
      [],

    recoveryRefs:
      [],

    resumePolicy:
      "metadata-only",

    startedAt,

    updatedAt:
      input.updatedAt ??
      startedAt,

    cleanShutdown:
      input.cleanShutdown ??
      false,
  };
}
