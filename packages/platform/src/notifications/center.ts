import type {
  NotificationInput,
  NotificationListOptions,
  NotificationRecord,
} from "./types";

export const NOTIFICATION_API_SERVICE_ID =
  "core.notification";

export class NotificationCenter {
  private readonly records =
    new Map<
      string,
      NotificationRecord
    >();

  private nextId =
    1;

  push(
    input:
      NotificationInput,
  ) {
    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        "Notification title is required.",
      );
    }

    const id =
      `notification-${this.nextId++}`;

    const record:
      NotificationRecord = {
        ...input,

        id,

        title,

        severity:
          input.severity ??
          "info",

        category:
          input.category ??
          "system",

        createdAt:
          new Date()
            .toISOString(),
      };

    this.records.set(
      id,
      record,
    );

    return record;
  }

  get(
    id: string,
  ) {
    return this.records.get(
      id,
    );
  }

  dismiss(
    id: string,
  ) {
    const record =
      this.records.get(
        id,
      );

    if (!record) {
      return false;
    }

    if (
      record.dismissedAt
    ) {
      return true;
    }

    this.records.set(
      id,
      {
        ...record,

        dismissedAt:
          new Date()
            .toISOString(),
      },
    );

    return true;
  }

  remove(
    id: string,
  ) {
    return this.records
      .delete(
        id,
      );
  }

  clear() {
    this.records.clear();
  }

  list(
    options:
      NotificationListOptions = {},
  ) {
    return Array
      .from(
        this.records.values(),
      )
      .filter(
        (
          record,
        ) => {
          if (
            !options
              .includeDismissed &&
            record.dismissedAt
          ) {
            return false;
          }

          if (
            options.severity &&
            record.severity !==
              options.severity
          ) {
            return false;
          }

          if (
            options.category &&
            record.category !==
              options.category
          ) {
            return false;
          }

          if (
            options.sourceId &&
            record.sourceId !==
              options.sourceId
          ) {
            return false;
          }

          return true;
        },
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.createdAt
            .localeCompare(
              left.createdAt,
            ),
      );
  }
}
