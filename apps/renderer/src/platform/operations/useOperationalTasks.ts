import {
  useEffect,
  useState,
} from "react";

import {
  rpc,
} from "../../rpc";

import {
  platformRuntime,
} from "../runtime";

import {
  toOperationalTaskResult,
} from "./selectors";

import type {
  OperationalTaskResult,
} from "./types";

type OperationalTaskSnapshot = {
  value: OperationalTaskResult;
  loading: boolean;
  error: string;
};

const EMPTY_RESULT:
  OperationalTaskResult = {
    tasks: [],
    historyAvailable: true,
  };

let snapshot:
  OperationalTaskSnapshot = {
    value: EMPTY_RESULT,
    loading: true,
    error: "",
  };

let initialized = false;
let refreshPromise:
  Promise<void> |
  null = null;

const listeners =
  new Set<
    (
      next: OperationalTaskSnapshot,
    ) => void
  >();

let taskEventUsers = 0;
let taskEventUnsubscribers:
  Array<() => void> = [];

function publish(
  next: OperationalTaskSnapshot,
) {
  snapshot = next;

  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function refreshOperationalTasks() {
  if (refreshPromise) {
    return refreshPromise;
  }

  publish({
    ...snapshot,
    loading: true,
  });

  refreshPromise =
    (async () => {
      try {
        const response =
          await rpc<unknown>(
            "tasks.overview",
            {},
          );

        const value =
          toOperationalTaskResult(
            response,
          );

        initialized = true;
        publish({
          value,
          loading: false,
          error: "",
        });
      } catch {
        initialized = true;
        publish({
          ...snapshot,
          loading: false,
          error:
            "Task activity is temporarily unavailable.",
        });
      }
    })()
      .finally(
        () => {
          refreshPromise = null;
        },
      );

  return refreshPromise;
}

function retainTaskEventRefresh() {
  taskEventUsers += 1;

  if (taskEventUsers === 1) {
    const refreshFromEvent =
      async () => {
        await refreshOperationalTasks();
      };

    taskEventUnsubscribers = [
      platformRuntime.eventApi.subscribe(
        "task.started",
        refreshFromEvent,
      ),
      platformRuntime.eventApi.subscribe(
        "task.progress",
        refreshFromEvent,
      ),
      platformRuntime.eventApi.subscribe(
        "task.completed",
        refreshFromEvent,
      ),
    ];
  }

  return () => {
    taskEventUsers =
      Math.max(
        0,
        taskEventUsers - 1,
      );

    if (taskEventUsers === 0) {
      for (
        const unsubscribe
        of taskEventUnsubscribers
      ) {
        unsubscribe();
      }

      taskEventUnsubscribers = [];
    }
  };
}

export function useOperationalTasks() {
  const [current, setCurrent] =
    useState(snapshot);

  useEffect(
    () => {
      listeners.add(setCurrent);

      const firstEventUser =
        taskEventUsers === 0;

      const releaseEvents =
        retainTaskEventRefresh();

      if (
        !initialized ||
        firstEventUser
      ) {
        void refreshOperationalTasks();
      }

      return () => {
        listeners.delete(setCurrent);
        releaseEvents();
      };
    },
    [],
  );

  return {
    ...current,
    refresh:
      refreshOperationalTasks,
  };
}

