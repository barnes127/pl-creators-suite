import { useEffect, useRef } from "react";

import type { ReactNode } from "react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const panelRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(
    () => {
      const previousFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const panel =
        panelRef.current;

      const focusable =
        panel?.querySelector<HTMLElement>(
          [
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[href]",
            '[tabindex]:not([tabindex="-1"])',
          ].join(","),
        );

      focusable?.focus();

      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          event.preventDefault();

          onClose();

          return;
        }

        if (
          event.key !==
            "Tab" ||
          !panel
        ) {
          return;
        }

        const focusableElements =
          Array.from(
            panel.querySelectorAll<HTMLElement>(
              [
                "button:not([disabled])",
                "input:not([disabled])",
                "select:not([disabled])",
                "textarea:not([disabled])",
                "[href]",
                '[tabindex]:not([tabindex="-1"])',
              ].join(","),
            ),
          );

        if (
          focusableElements.length ===
          0
        ) {
          event.preventDefault();

          return;
        }

        const first =
          focusableElements[0];

        const last =
          focusableElements[
            focusableElements.length -
            1
          ];

        if (
          event.shiftKey &&
          document.activeElement ===
            first
        ) {
          event.preventDefault();

          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            last
        ) {
          event.preventDefault();

          first.focus();
        }
      }

      document.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.removeEventListener(
          "keydown",
          handleKeyDown,
        );

        previousFocus?.focus();
      };
    },
    [
      onClose,
    ],
  );
  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modalPanel"
        ref={panelRef}
      >
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
