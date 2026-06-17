import type { ReactNode } from "react";

type WorkspaceSplitProps = {
  left?: ReactNode;
  main: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function WorkspaceSplit({
  left,
  main,
  right,
  className = "",
}: WorkspaceSplitProps) {
  return (
    <div className={`workspaceSplit ${className}`.trim()}>
      {left && <aside className="workspaceSplitSide">{left}</aside>}
      <section className="workspaceSplitMain">{main}</section>
      {right && <aside className="workspaceSplitSide">{right}</aside>}
    </div>
  );
}
