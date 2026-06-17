import { useEffect, useState, type ReactNode } from "react";

type CollapsiblePanelProps = {
  title: string;
  defaultOpen?: boolean;
  storageKey?: string;
  children: ReactNode;
};

function readStoredOpen(storageKey: string | undefined, fallback: boolean) {
  if (!storageKey) return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return fallback;
  } catch {
    return fallback;
  }
}

export function CollapsiblePanel({
  title,
  defaultOpen = true,
  storageKey,
  children,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(() => readStoredOpen(storageKey, defaultOpen));

  useEffect(() => {
    if (!storageKey) return;

    try {
      window.localStorage.setItem(storageKey, String(open));
    } catch {
      // Ignore storage failures.
    }
  }, [open, storageKey]);

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
