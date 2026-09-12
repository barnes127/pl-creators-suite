export type NotificationSeverity =
  | "info"
  | "success"
  | "warning"
  | "error";

export type NotificationCategory =
  | "system"
  | "project"
  | "task"
  | "workflow"
  | "security"
  | "other";

export interface NotificationAction {
  id: string;

  label: string;

  commandId?: string;
}

export interface NotificationInput {
  title: string;

  message?: string;

  severity?:
    NotificationSeverity;

  category?:
    NotificationCategory;

  sourceId?: string;

  projectRoot?: string;

  resourceId?: string;

  actions?:
    readonly NotificationAction[];

  metadata?:
    Readonly<
      Record<
        string,
        unknown
      >
    >;
}

export interface NotificationRecord
  extends NotificationInput {
  id: string;

  createdAt: string;

  dismissedAt?: string;

  severity:
    NotificationSeverity;

  category:
    NotificationCategory;
}

export interface NotificationListOptions {
  includeDismissed?: boolean;

  severity?:
    NotificationSeverity;

  category?:
    NotificationCategory;

  sourceId?: string;
}
