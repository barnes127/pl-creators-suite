import type {
  ReactNode,
} from "react";


export interface ApplicationShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}


export function ApplicationShell({
  sidebar,
  children,
}: ApplicationShellProps) {
  return (
    <div className="shell">
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
}


export function ShellStatusBar({
  status,
  productLabel,
}: ShellStatusBarProps) {
  return (
    <footer className="statusbar">
      <div className="statusLeft">
        Status: {status}
      </div>

      <div className="statusRight">
        {productLabel}
      </div>
    </footer>
  );
}
