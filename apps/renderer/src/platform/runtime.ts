import {
  createPlatformRuntime,
} from "@pl/platform";

import type {
  AppId,
} from "../types/app";


export const platformRuntime =
  createPlatformRuntime();


export function bindBuiltInSliceConsumers(
  setActive:
    (
      workspace: AppId,
    ) => void,
) {
  const unregisterCode =
    platformRuntime.commandApi.register<
      undefined,
      AppId
    >({
      id:
        "code.workspace.activate",

      title:
        "Open Code Workspace",

      description:
        "Activate the PL Code IDE workspace.",

      category:
        "workspace",

      version:
        "1.0.0",

      keywords: [
        "code",
        "ide",
        "workspace",
      ],

      execute() {
        setActive(
          "code",
        );

        return {
          ok:
            true,

          value:
            "code",
        };
      },
    });


  const unregisterDocs =
    platformRuntime.commandApi.register<
      undefined,
      AppId
    >({
      id:
        "docs.workspace.activate",

      title:
        "Open Docs Workspace",

      description:
        "Activate the PL Docs workspace.",

      category:
        "workspace",

      version:
        "1.0.0",

      keywords: [
        "docs",
        "document",
        "workspace",
      ],

      execute() {
        setActive(
          "docs",
        );

        return {
          ok:
            true,

          value:
            "docs",
        };
      },
    });


  platformRuntime.settingsApi.set(
    {
      kind:
        "slice",

      id:
        "code",
    },
    "workspace.registered",
    true,
  );


  platformRuntime.settingsApi.set(
    {
      kind:
        "slice",

      id:
        "docs",
    },
    "workspace.registered",
    true,
  );


  return () => {
    unregisterCode();
    unregisterDocs();
  };
}
