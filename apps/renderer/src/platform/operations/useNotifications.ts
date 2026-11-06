import {
  useEffect,
  useState,
} from "react";

import type {
  NotificationRecord,
} from "@pl/platform";

import {
  platformRuntime,
} from "../runtime";

type NotificationSnapshot = {
  notifications:
    readonly NotificationRecord[];
  error: string;
};

let snapshot:
  NotificationSnapshot = {
    notifications: [],
    error: "",
  };

let initialized = false;

const listeners =
  new Set<
    (
      next: NotificationSnapshot,
    ) => void
  >();

let notificationEventUsers = 0;
let notificationEventUnsubscribe:
  (() => void) |
  null = null;

function publish(
  next: NotificationSnapshot,
) {
  snapshot = next;

  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function refreshNotifications() {
  try {
    initialized = true;
    publish({
      notifications:
        platformRuntime.notifications.list({
          includeDismissed: true,
        }),
      error: "",
    });
  } catch {
    initialized = true;
    publish({
      ...snapshot,
      error:
        "Notifications are temporarily unavailable.",
    });
  }
}

export function dismissNotification(
  notificationId: string,
) {
  const dismissed =
    platformRuntime.notifications.dismiss(
      notificationId,
    );

  refreshNotifications();

  return dismissed;
}

function retainNotificationEvents() {
  notificationEventUsers += 1;

  if (notificationEventUsers === 1) {
    notificationEventUnsubscribe =
      platformRuntime.eventApi.subscribe(
        "task.completed",
        () => {
          refreshNotifications();
        },
      );
  }

  return () => {
    notificationEventUsers =
      Math.max(
        0,
        notificationEventUsers - 1,
      );

    if (
      notificationEventUsers === 0 &&
      notificationEventUnsubscribe
    ) {
      notificationEventUnsubscribe();
      notificationEventUnsubscribe = null;
    }
  };
}

export function useNotifications() {
  const [current, setCurrent] =
    useState(snapshot);

  useEffect(
    () => {
      listeners.add(setCurrent);

      const firstEventUser =
        notificationEventUsers === 0;

      const releaseEvents =
        retainNotificationEvents();

      if (
        !initialized ||
        firstEventUser
      ) {
        refreshNotifications();
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
    dismiss:
      dismissNotification,
    refresh:
      refreshNotifications,
  };
}

