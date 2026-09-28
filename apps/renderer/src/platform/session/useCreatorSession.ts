import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  loadCreatorSessionStore,
  saveCreatorSessionStore,
} from "./storage";

import {
  captureCreatorSession,
  getActiveCreatorSession,
  markCreatorSessionClean,
} from "./lifecycle";

import {
  createCreatorSessionRestorePoint,
  resolveCreatorSessionRestorePlan,
  restoreCreatorSessionFromPoint,
} from "./recovery";

import {
  loadCreatorSessionRecoveryStore,
  saveCreatorSessionRecoveryStore,
} from "./recoveryStorage";

import type {
  CreatorSessionRecoveryStore,
} from "./recovery";

import type {
  CreatorSessionCaptureInput,
} from "./lifecycle";

import type {
  CreatorSessionStore,
} from "./types";


export function useCreatorSession() {
  const initialStore =
    useMemo(
      () =>
        loadCreatorSessionStore(),
      [],
    );

  const initialRecoveryStore =
    useMemo(
      () =>
        loadCreatorSessionRecoveryStore(),
      [],
    );

  const [
    sessionStore,
    setSessionStore,
  ] =
    useState<CreatorSessionStore>(
      initialStore,
    );

  const storeRef =
    useRef<CreatorSessionStore>(
      initialStore,
    );

  const [
    recoveryStore,
    setRecoveryStore,
  ] =
    useState<CreatorSessionRecoveryStore>(
      initialRecoveryStore,
    );

  const recoveryStoreRef =
    useRef<CreatorSessionRecoveryStore>(
      initialRecoveryStore,
    );

  const restorePlan =
    useMemo(
      () =>
        resolveCreatorSessionRestorePlan(
          getActiveCreatorSession(
            initialStore,
          ),
          initialRecoveryStore,
        ),
      [
        initialStore,
        initialRecoveryStore,
      ],
    );

  const restorableSession =
    restorePlan.session;

  const persistStore =
    useCallback(
      (
        next:
          CreatorSessionStore,
      ) => {
        storeRef.current =
          next;

        saveCreatorSessionStore(
          next,
        );

        setSessionStore(
          next,
        );
      },
      [],
    );

  const persistRecoveryStore =
    useCallback(
      (
        next:
          CreatorSessionRecoveryStore,
      ) => {
        recoveryStoreRef.current =
          next;

        saveCreatorSessionRecoveryStore(
          next,
        );

        setRecoveryStore(
          next,
        );
      },
      [],
    );

  const captureSession =
    useCallback(
      (
        input:
          CreatorSessionCaptureInput,
      ) => {
        const next =
          captureCreatorSession(
            storeRef.current,
            input,
          );

        persistStore(
          next,
        );

        const active =
          getActiveCreatorSession(
          next,
        );

        if (active) {
          const recovery =
            createCreatorSessionRestorePoint(
              recoveryStoreRef.current,
              active,
              {kind:"automatic"}
            );

          persistRecoveryStore(recovery.store);
        }
        return active;
      },
      [
        persistStore,
        persistRecoveryStore,
      ],
    );


  const markClean =
    useCallback(
      () => {
        const next =
          markCreatorSessionClean(
            storeRef.current,
          );

        persistStore(
          next,
        );

        return getActiveCreatorSession(
          next,
        );
      },
      [
        persistStore,
      ],
    );

  const createManualRestorePoint =
    useCallback(
      (label: string) => {
        const active =
          getActiveCreatorSession(
            storeRef.current,
          );
        if (!active) {
          return undefined;
        }
        const result =
          createCreatorSessionRestorePoint(
            recoveryStoreRef.current,
            active,
            {
              kind: "manual",
              label,
            },
          );
        persistRecoveryStore(
          result.store,
        );
        return result.restorePoint;
      },
      [
        persistRecoveryStore,
      ],
    );

  const restoreFromRestorePoint =
    useCallback(
      (restorePointId: string) => {
        const next =
          restoreCreatorSessionFromPoint(
            storeRef.current,
            recoveryStoreRef.current,
            restorePointId,
          );
        if (next === storeRef.current) {
          return undefined;
        }
        persistStore(next);
        return getActiveCreatorSession(next);
      },
      [
        persistStore,
      ],
    );

  const activeSession =
    useMemo(
      () =>
        getActiveCreatorSession(
          sessionStore,
        ),
      [
        sessionStore,
      ],
    );

  useEffect(
    () => {
      const handleBeforeUnload =
        () => {
          const next =
            markCreatorSessionClean(
              storeRef.current,
            );
          storeRef.current =
            next;
          saveCreatorSessionStore(
            next,
          );
        };
      window.addEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
      return () => {
        window.removeEventListener(
          "beforeunload",
          handleBeforeUnload,
        );
      };
    },
    [],
  );

  return {
    sessionStore,
    recoveryStore,
    activeSession,
    restorableSession,
    restorePlan,
    captureSession,
    createManualRestorePoint,
    restoreFromRestorePoint,
    markClean,
  };
}
