import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div className={`panel ${className}`.trim()}>
      {title && <div className="panelTitle">{title}</div>}
      {children}
    </div>
  );
}
