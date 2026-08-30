import type {
  CSSProperties,
  ReactNode,
} from "react";

import type {
  ShellSaveState,
  ShellThemeMode,
} from "./types";


export interface ApplicationShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  zoom?: number;
  themeMode?: ShellThemeMode;
}


export function ApplicationShell({
  sidebar,
  children,
  zoom = 1,
  themeMode = "default",
}: ApplicationShellProps) {
  const safeZoom =
    Math.min(
      2,
      Math.max(
        0.5,
        zoom,
      ),
    );

  const shellStyle: CSSProperties = {
    transform:
      `scale(${safeZoom})`,

    transformOrigin:
      "top left",

    width:
      `${100 / safeZoom}%`,

    height:
      `${100 / safeZoom}%`,
  };

  return (
    <div className="shell"
      data-theme={themeMode}
      data-zoom={safeZoom}
      style={shellStyle}
    >
      {sidebar}

      {children}
    </div>
  );
}


export interface ShellSidebarProps {
  children: ReactNode;
}


export function ShellSidebar({
  children,
}: ShellSidebarProps) {
  return (
    <aside className="sidebar">
      {children}
    </aside>
  );
}


export interface ShellMainProps {
  children: ReactNode;
}


export function ShellMain({
  children,
}: ShellMainProps) {
  return (
    <main className="main">
      {children}
    </main>
  );
}


export interface ShellTopBarProps {
  children: ReactNode;
}


export function ShellTopBar({
  children,
}: ShellTopBarProps) {
  return (
    <header className="topbar">
      {children}
    </header>
  );
}


export interface ShellWorkspaceRegionProps {
  children: ReactNode;
}


export function ShellWorkspaceRegion({
  children,
}: ShellWorkspaceRegionProps) {
  return (
    <section className="workspace">
      {children}
    </section>
  );
}


export interface ShellBottomPanelProps {
  className?: string;

  children: ReactNode;
}


export function ShellBottomPanel({
  className = "",
  children,
}: ShellBottomPanelProps) {
  return (
    <section
      className={
        className
      }
    >
      {children}
    </section>
  );
}


export interface ShellStatusBarProps {
  status: string;
  productLabel: string;
  saveState?: ShellSaveState;
}


export function ShellStatusBar({
  status,
  productLabel,
  saveState,
}: ShellStatusBarProps) {
  return (
    <footer className="statusbar">
      <div className="statusLeft">
        <span>
          Status: {status}
        </span>

        {saveState && (
          <ShellSaveIndicator
            state={
              saveState
            }
          />
        )}
      </div>

      <div className="statusRight">
        {productLabel}
      </div>
    </footer>
  );
}

export interface ShellSaveIndicatorProps {
  state: ShellSaveState;
}


export function ShellSaveIndicator({
  state,
}: ShellSaveIndicatorProps) {
  let label =
    "Saved";

  let kind =
    "saved";


  if (
    state.error
  ) {
    label =
      "Save error";

    kind =
      "error";
  } else if (
    state.saving
  ) {
    label =
      "Saving…";

    kind =
      "saving";
  } else if (
    state.dirty
  ) {
    label =
      "Unsaved changes";

    kind =
      "dirty";
  }


  return (
    <div
      className={`shellSaveIndicator shellSaveIndicator-${kind}`}
      data-save-state={
        kind
      }
      role="status"
      aria-live="polite"
      title={
        state.error ??
        state.lastSavedAt ??
        label
      }
    >
      <span
        className="shellSaveDot"
        aria-hidden="true"
      />

      <span>
        {label}
      </span>
    </div>
  );
}
