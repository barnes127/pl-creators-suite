import type { ReactNode } from "react";

type WorkspaceHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function WorkspaceHeader({
  title,
  subtitle,
  actions,
}: WorkspaceHeaderProps) {
  return (
    <div className="workspaceHeader">
      <div>
        <h2 className="workspaceTitle">{title}</h2>
        {subtitle && <div className="workspaceSubtitle">{subtitle}</div>}
      </div>

      {actions && <div className="workspaceActions">{actions}</div>}
    </div>
  );
}
