import type {
  ReactNode,
} from "react";


export type ShellStateKind =
  | "loading"
  | "empty"
  | "error"
  | "disabled"
  | "warning"
  | "permission"
  | "destructive";


export interface ShellStateProps {
  kind: ShellStateKind;

  title: string;

  message?: string;

  actions?: ReactNode;

  compact?: boolean;

  role?: "status" | "alert";
}


export function ShellState({
  kind,
  title,
  message,
  actions,
  compact = false,
  role,
}: ShellStateProps) {
  const resolvedRole =
    role ??
    (
      kind === "error" ||
      kind === "warning" ||
      kind === "destructive"
        ? "alert"
        : "status"
    );

  return (
    <div
      className={[
        "shellState",
        `shellState-${kind}`,
        compact
          ? "shellState-compact"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-state-kind={
        kind
      }
      role={
        resolvedRole
      }
      aria-live={
        resolvedRole === "alert"
          ? "assertive"
          : "polite"
      }
    >
      <div className="shellStateHeader">
        <span
          className="shellStateIndicator"
          aria-hidden="true"
        />

        <strong className="shellStateTitle">
          {title}
        </strong>
      </div>

      {message && (
        <div className="shellStateMessage">
          {message}
        </div>
      )}

      {actions && (
        <div className="shellStateActions">
          {actions}
        </div>
      )}
    </div>
  );
}


export function LoadingState({
  title = "Loading",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <ShellState
      kind="loading"
      title={title}
      message={message}
    />
  );
}


export function EmptyState({
  title = "Nothing here yet",
  message,
  actions,
}: {
  title?: string;
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <ShellState
      kind="empty"
      title={title}
      message={message}
      actions={actions}
    />
  );
}


export function ErrorState({
  title = "Something went wrong",
  message,
  actions,
}: {
  title?: string;
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <ShellState
      kind="error"
      title={title}
      message={message}
      actions={actions}
    />
  );
}


export function DisabledState({
  title = "Unavailable",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <ShellState
      kind="disabled"
      title={title}
      message={message}
    />
  );
}


export function WarningState({
  title = "Warning",
  message,
  actions,
}: {
  title?: string;
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <ShellState
      kind="warning"
      title={title}
      message={message}
      actions={actions}
    />
  );
}


export function PermissionState({
  title = "Permission required",
  message,
  actions,
}: {
  title?: string;
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <ShellState
      kind="permission"
      title={title}
      message={message}
      actions={actions}
    />
  );
}


export function DestructiveState({
  title = "Confirm destructive action",
  message,
  actions,
}: {
  title?: string;
  message?: string;
  actions?: ReactNode;
}) {
  return (
    <ShellState
      kind="destructive"
      title={title}
      message={message}
      actions={actions}
    />
  );
}
