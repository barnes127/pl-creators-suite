import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "default" | "info" | "success" | "warning" | "danger" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export function Badge({
  tone = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={`badge badge-${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
