import type {
  ShellPanelLayout,
} from "../shell/types";

import {
  createCreatorSessionRecord,
} from "./defaults";

import type {
  CreatorSessionRecord,
  CreatorSessionRecoveryRef,
  CreatorSessionResourceRef,
  CreatorSessionStore,
  CreatorSessionTaskRef,
  CreatorSessionTerminalRef,
} from "./types";


export interface CreatorSessionCaptureInput {
  profileId:
    string;

  projectRoot:
    string | null;

  activeWorkspace:
    string;

  layout:
    ShellPanelLayout;

  openResources?:
    readonly CreatorSessionResourceRef[];

  selectedResources?:
    readonly CreatorSessionResourceRef[];

  taskRefs?:
    readonly CreatorSessionTaskRef[];

  terminalRefs?:
    readonly CreatorSessionTerminalRef[];

  recoveryRefs?:
    readonly CreatorSessionRecoveryRef[];

  now?:
    string;
}


function cloneResourceRefs(
  refs:
    readonly CreatorSessionResourceRef[],
):
  CreatorSessionResourceRef[] {
  return refs.map(
    (ref) => ({
      ...ref,
    }),
  );
}


function cloneTaskRefs(
  refs:
    readonly CreatorSessionTaskRef[],
):
  CreatorSessionTaskRef[] {
  return refs.map(
    (ref) => ({
      ...ref,
    }),
  );
}


function cloneTerminalRefs(
  refs:
    readonly CreatorSessionTerminalRef[],
):
  CreatorSessionTerminalRef[] {
  return refs.map(
    (ref) => ({
      ...ref,
    }),
  );
}


function cloneRecoveryRefs(
  refs:
    readonly CreatorSessionRecoveryRef[],
):
  CreatorSessionRecoveryRef[] {
  return refs.map(
    (ref) => ({
      ...ref,
    }),
  );
}


function createCreatorSessionId(
  now:
    string,
) {
  return [
    "creator-session",
    Date.parse(
      now,
    ),
    Math.random()
      .toString(36)
      .slice(
        2,
        10,
      ),
  ].join(
    "-",
  );
}


export function getActiveCreatorSession(
  store:
    CreatorSessionStore,
):
  CreatorSessionRecord |
  undefined {
  if (
    !store.activeSessionId
  ) {
    return undefined;
  }

  return store.sessions.find(
    (session) =>
      session.id ===
      store.activeSessionId,
  );
}


export function captureCreatorSession(
  store:
    CreatorSessionStore,
  input:
    CreatorSessionCaptureInput,
):
  CreatorSessionStore {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const current =
    getActiveCreatorSession(
      store,
    );

  const openResources =
    cloneResourceRefs(
      input.openResources ??
      current?.openResources ??
      [],
    );

  const selectedResources =
    cloneResourceRefs(
      input.selectedResources ??
      current?.selectedResources ??
      [],
    );

  const taskRefs =
    cloneTaskRefs(
      input.taskRefs ??
      current?.taskRefs ??
      [],
    );

  const terminalRefs =
    cloneTerminalRefs(
      input.terminalRefs ??
      current?.terminalRefs ??
      [],
    );

  const recoveryRefs =
    cloneRecoveryRefs(
      input.recoveryRefs ??
      current?.recoveryRefs ??
      [],
    );


  const nextSession:
    CreatorSessionRecord =
      current
        ? {
            ...current,

            profileId:
              input.profileId,

            projectRoot:
              input.projectRoot,

            activeWorkspace:
              input.activeWorkspace,

            layout:
              structuredClone(
                input.layout,
              ),

            openResources,

            selectedResources,

            taskRefs,

            terminalRefs,

            recoveryRefs,

            resumePolicy:
              "metadata-only",

            updatedAt:
              now,

            cleanShutdown:
              false,
          }
        : {
            ...createCreatorSessionRecord({
              id:
                createCreatorSessionId(
                  now,
                ),

              profileId:
                input.profileId,

              projectRoot:
                input.projectRoot,

              activeWorkspace:
                input.activeWorkspace,

              layout:
                input.layout,

              startedAt:
                now,

              updatedAt:
                now,

              cleanShutdown:
                false,
            }),

            openResources,

            selectedResources,

            taskRefs,

            terminalRefs,

            recoveryRefs,
          };


  const sessions =
    current
      ? store.sessions.map(
          (session) =>
            session.id ===
            current.id
              ? nextSession
              : session,
        )
      : [
          ...store.sessions,
          nextSession,
        ];


  return {
    ...store,

    activeSessionId:
      nextSession.id,

    sessions,
  };
}


export function markCreatorSessionClean(
  store:
    CreatorSessionStore,
  cleanShutdown =
    true,
  now =
    new Date()
      .toISOString(),
):
  CreatorSessionStore {
  const active =
    getActiveCreatorSession(store);

  if (!active) {
    return store;
  }

  return {
    ...store,

    sessions:
      store.sessions.map(
        (session) =>
          session.id ===
          active.id
            ? {
                ...session,
                cleanShutdown,
                updatedAt:
                  now,
              }
            : session,
      ),
  };
}
