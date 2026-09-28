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

  const restorableSession =
    useMemo(
      () =>
        getActiveCreatorSession(
          initialStore,
        ),
      [
        initialStore,
      ],
    );

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

        return getActiveCreatorSession(
          next,
        );
      },
      [
        persistStore,
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
    activeSession,
    restorableSession,
    captureSession,
    markClean,
  };
}
