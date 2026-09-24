import {
  DEFAULT_SHELL_LAYOUT,
} from "../shell/defaults";

import type {
  ShellPanelLayout,
} from "../shell/types";

import {
  CREATOR_SESSION_SCHEMA_VERSION,
} from "./types";

import type {
  CreatorSessionRecord,
  CreatorSessionRecoveryRef,
  CreatorSessionResourceRef,
  CreatorSessionStore,
  CreatorSessionTaskRef,
  CreatorSessionTerminalRef,
} from "./types";


function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    Boolean(
      value,
    ) &&
    typeof value ===
      "object" &&
    !Array.isArray(
      value,
    )
  );
}


function normalizeTimestamp(
  value:
    unknown,
  fallback:
    string,
) {
  if (
    typeof value !==
      "string"
  ) {
    return fallback;
  }

  const parsed =
    Date.parse(
      value,
    );

  return Number.isFinite(
    parsed,
  )
    ? new Date(
        parsed,
      )
        .toISOString()
    : fallback;
}


function normalizeLayout(
  value:
    unknown,
):
  ShellPanelLayout {
  const fallback =
    structuredClone(
      DEFAULT_SHELL_LAYOUT,
    );

  if (
    !isRecord(
      value,
    )
  ) {
    return fallback;
  }

  const visibility =
    isRecord(
      value.visibility,
    )
      ? value.visibility
      : {};

  for (
    const panelId of Object.keys(
      fallback.visibility,
    )
  ) {
    const candidate =
      visibility[
        panelId
      ];

    if (
      typeof candidate ===
      "boolean"
    ) {
      fallback.visibility[
        panelId as keyof typeof fallback.visibility
      ] =
        candidate;
    }
  }


  if (
    typeof value.primarySidebarWidth ===
      "number" &&
    Number.isFinite(
      value.primarySidebarWidth,
    )
  ) {
    fallback.primarySidebarWidth =
      Math.max(
        160,
        Math.min(
          640,
          value.primarySidebarWidth,
        ),
      );
  }


  if (
    typeof value.inspectorWidth ===
      "number" &&
    Number.isFinite(
      value.inspectorWidth,
    )
  ) {
    fallback.inspectorWidth =
      Math.max(
        180,
        Math.min(
          720,
          value.inspectorWidth,
        ),
      );
  }


  if (
    typeof value.bottomPanelHeight ===
      "number" &&
    Number.isFinite(
      value.bottomPanelHeight,
    )
  ) {
    fallback.bottomPanelHeight =
      Math.max(
        100,
        Math.min(
          720,
          value.bottomPanelHeight,
        ),
      );
  }


  return fallback;
}


function normalizeResourceRefs(
  value:
    unknown,
):
  CreatorSessionResourceRef[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      isRecord,
    )
    .flatMap(
      (
        entry,
      ) => {
        if (
          typeof entry.kind !==
            "string" ||
          !entry.kind.trim() ||
          typeof entry.id !==
            "string" ||
          !entry.id.trim()
        ) {
          return [];
        }

        return [
          {
            kind:
              entry.kind.trim(),

            id:
              entry.id.trim(),

            label:
              typeof entry.label ===
                "string" &&
              entry.label.trim()
                ? entry.label.trim()
                : undefined,
          },
        ];
      },
    );
}


function normalizeTaskRefs(
  value:
    unknown,
):
  CreatorSessionTaskRef[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      isRecord,
    )
    .flatMap(
      (
        entry,
      ) => {
        if (
          typeof entry.id !==
            "string" ||
          !entry.id.trim()
        ) {
          return [];
        }

        return [
          {
            id:
              entry.id.trim(),

            status:
              typeof entry.status ===
                "string" &&
              entry.status.trim()
                ? entry.status.trim()
                : undefined,
          },
        ];
      },
    );
}


function normalizeTerminalRefs(
  value:
    unknown,
):
  CreatorSessionTerminalRef[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      isRecord,
    )
    .flatMap(
      (
        entry,
      ) => {
        if (
          typeof entry.id !==
            "string" ||
          !entry.id.trim()
        ) {
          return [];
        }

        return [
          {
            id:
              entry.id.trim(),

            profileId:
              typeof entry.profileId ===
                "string" &&
              entry.profileId.trim()
                ? entry.profileId.trim()
                : undefined,

            workingDirectory:
              typeof entry.workingDirectory ===
                "string" &&
              entry.workingDirectory.trim()
                ? entry.workingDirectory.trim()
                : undefined,
          },
        ];
      },
    );
}


function normalizeRecoveryRefs(
  value:
    unknown,
):
  CreatorSessionRecoveryRef[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      isRecord,
    )
    .flatMap(
      (
        entry,
      ) => {
        const kind =
          entry.kind;
        if (
          (
            kind !==
              "autosave" &&
            kind !==
              "checkpoint" &&
            kind !==
              "snapshot" &&
            kind !==
              "journal"
          ) ||
          typeof entry.id !==
            "string" ||
          !entry.id.trim()
        ) {
          return [];
        }

        return [
          {
            kind,

            id:
              entry.id.trim(),
          },
        ];
      },
    );
}


export function normalizeCreatorSessionRecord(
  value:
    unknown,
  now =
    new Date()
      .toISOString(),
):
  CreatorSessionRecord |
  undefined {
  if (
    !isRecord(
      value,
    ) ||
    typeof value.id !==
      "string" ||
    !value.id.trim() ||
    typeof value.profileId !==
      "string" ||
    !value.profileId.trim()
  ) {
    return undefined;
  }


  const startedAt =
    normalizeTimestamp(
      value.startedAt,
      now,
    );


  return {
    schemaVersion:
      CREATOR_SESSION_SCHEMA_VERSION,

    id:
      value.id.trim(),

    profileId:
      value.profileId.trim(),

    projectRoot:
      typeof value.projectRoot ===
        "string" &&
      value.projectRoot.trim()
        ? value.projectRoot.trim()
        : null,

    activeWorkspace:
      typeof value.activeWorkspace ===
        "string" &&
      value.activeWorkspace.trim()
        ? value.activeWorkspace.trim()
        : "code",

    layout:
      normalizeLayout(
        value.layout,
      ),

    openResources:
      normalizeResourceRefs(
        value.openResources,
      ),

    selectedResources:
      normalizeResourceRefs(
        value.selectedResources,
      ),

    taskRefs:
      normalizeTaskRefs(
        value.taskRefs,
      ),

    terminalRefs:
      normalizeTerminalRefs(
        value.terminalRefs,
      ),

    recoveryRefs:
      normalizeRecoveryRefs(
        value.recoveryRefs,
      ),

    resumePolicy:
      "metadata-only",

    startedAt,

    updatedAt:
      normalizeTimestamp(
        value.updatedAt,
        startedAt,
      ),

    cleanShutdown:
      value.cleanShutdown ===
      true,
  };
}


export function normalizeCreatorSessionStore(
  value:
    unknown,
  fallback:
    CreatorSessionStore,
):
  CreatorSessionStore {
  if (
    !isRecord(
      value,
    ) ||
    value.schemaVersion !==
      CREATOR_SESSION_SCHEMA_VERSION
  ) {
    return fallback;
  }


  const sessions =
    Array.isArray(
      value.sessions,
    )
      ? value.sessions
          .map(
            (
              session,
            ) =>
              normalizeCreatorSessionRecord(
                session,
              ),
          )
          .filter(
            (
              session,
            ):
              session is
                CreatorSessionRecord =>
              Boolean(
                session,
              ),
          )
      : [];


  const uniqueSessions =
    Array.from(
      new Map(
        sessions.map(
          (
            session,
          ) => [
            session.id,
            session,
          ],
        ),
      ).values(),
    );


  const requestedActiveSessionId =
    typeof value.activeSessionId ===
      "string"
      ? value.activeSessionId
          .trim()
      : null;


  const activeSessionId =
    requestedActiveSessionId &&
    uniqueSessions.some(
      (
        session,
      ) =>
        session.id ===
        requestedActiveSessionId,
    )
      ? requestedActiveSessionId
      : null;


  return {
    schemaVersion:
      CREATOR_SESSION_SCHEMA_VERSION,

    activeSessionId,

    sessions:
      uniqueSessions,
  };
}
