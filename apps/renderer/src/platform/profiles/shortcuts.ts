import type {
  ShortcutBinding,
} from "../shell/shortcuts";

import type {
  CreatorShortcutOverrides,
} from "./types";


export function applyCreatorShortcutOverrides(
  bindings:
    ShortcutBinding[],
  overrides:
    CreatorShortcutOverrides,
):
  ShortcutBinding[] {
  return bindings.flatMap(
    (
      binding,
    ) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          overrides,
          binding.id,
        )
      ) {
        return [
          binding,
        ];
      }


      const override =
        overrides[
          binding.id
        ];


      if (
        override ===
        null
      ) {
        return [];
      }


      return [
        {
          ...binding,

          shortcut:
            override,
        },
      ];
    },
  );
}
