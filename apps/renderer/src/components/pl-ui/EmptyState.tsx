import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className="emptyState emptyStateCard">
      <div className="emptyStateIcon">✦</div>
      <div className="emptyStateTitle">{title}</div>
      {description && <div className="emptyStateDescription">{description}</div>}
      {actions && <div className="emptyStateActions">{actions}</div>}
    </div>
  );
}
