import {
  useEffect,
  useMemo,
} from "react";

import {
  assertNoShortcutConflicts,
  isEditableShortcutTarget,
  keyboardEventToShortcut,
  normalizeShortcut,
} from "./shortcuts";

import type {
  ShortcutBinding,
} from "./shortcuts";


export function useShellShortcuts(
  bindings: ShortcutBinding[],
) {
  const normalizedBindings =
    useMemo(
      () =>
        bindings.map(
          (binding) => ({
            ...binding,

            shortcut:
              normalizeShortcut(
                binding.shortcut,
              ),
          }),
        ),
      [
        bindings,
      ],
    );


  useEffect(
    () => {
      assertNoShortcutConflicts(
        normalizedBindings,
      );


      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        const shortcut =
          keyboardEventToShortcut(
            event,
          );

        const binding =
          normalizedBindings.find(
            (candidate) =>
              candidate.shortcut ===
              shortcut,
          );

        if (
          !binding
        ) {
          return;
        }

        if (
          !binding.allowInEditable &&
          isEditableShortcutTarget(
            event.target,
          )
        ) {
          return;
        }

        event.preventDefault();

        binding.execute();
      }


      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      normalizedBindings,
    ],
  );
}
