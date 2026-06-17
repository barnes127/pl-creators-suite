import { useState, type ReactNode } from "react";

type CollapsiblePanelProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsiblePanel({
  title,
  defaultOpen = true,
  children,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel">
      <button
        className="panelTitle"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "▼" : "▶"} {title}
      </button>

      {open && <div>{children}</div>}
    </div>
  );
}
