export interface ShortcutBinding {
  id: string;

  label: string;

  shortcut: string;

  execute: () => void;

  allowInEditable?: boolean;
}


export interface ShortcutConflict {
  shortcut: string;

  bindingIds: string[];
}


const MODIFIER_ORDER = [
  "ctrl",
  "alt",
  "shift",
  "meta",
];


function normalizeKey(
  value: string,
) {
  const key =
    value
      .trim()
      .toLowerCase();

  if (
    key === "control"
  ) {
    return "ctrl";
  }

  if (
    key === "cmd" ||
    key === "command"
  ) {
    return "meta";
  }

  if (
    key === "plus"
  ) {
    return "=";
  }

  return key;
}


export function normalizeShortcut(
  shortcut: string,
): string {
  const parts =
    shortcut
      .split("+")
      .map(
        normalizeKey,
      )
      .filter(Boolean);

  const modifiers =
    MODIFIER_ORDER.filter(
      (modifier) =>
        parts.includes(
          modifier,
        ),
    );

  const key =
    parts.find(
      (part) =>
        !MODIFIER_ORDER.includes(
          part,
        ),
    );

  return [
    ...modifiers,
    key,
  ]
    .filter(Boolean)
    .join("+");
}


export function keyboardEventToShortcut(
  event: KeyboardEvent,
): string {
  const parts: string[] = [];

  if (
    event.ctrlKey
  ) {
    parts.push(
      "ctrl",
    );
  }

  if (
    event.altKey
  ) {
    parts.push(
      "alt",
    );
  }

  if (
    event.shiftKey
  ) {
    parts.push(
      "shift",
    );
  }

  if (
    event.metaKey
  ) {
    parts.push(
      "meta",
    );
  }

  const key =
    normalizeKey(
      event.key,
    );

  if (
    !MODIFIER_ORDER.includes(
      key,
    )
  ) {
    parts.push(
      key,
    );
  }

  return normalizeShortcut(
    parts.join("+"),
  );
}


export function isEditableShortcutTarget(
  target: EventTarget | null,
): boolean {
  if (
    !(target instanceof HTMLElement)
  ) {
    return false;
  }

  const tag =
    target.tagName.toLowerCase();

  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}


export function findShortcutConflicts(
  bindings: ShortcutBinding[],
): ShortcutConflict[] {
  const grouped =
    new Map<
      string,
      string[]
    >();


  for (
    const binding
    of bindings
  ) {
    const shortcut =
      normalizeShortcut(
        binding.shortcut,
      );

    const existing =
      grouped.get(
        shortcut,
      ) ?? [];

    existing.push(
      binding.id,
    );

    grouped.set(
      shortcut,
      existing,
    );
  }


  return Array
    .from(
      grouped.entries(),
    )
    .filter(
      (
        [
          ,
          ids,
        ],
      ) =>
        ids.length > 1,
    )
    .map(
      (
        [
          shortcut,
          bindingIds,
        ],
      ) => ({
        shortcut,
        bindingIds,
      }),
    );
}


export function assertNoShortcutConflicts(
  bindings: ShortcutBinding[],
) {
  const conflicts =
    findShortcutConflicts(
      bindings,
    );

  if (
    conflicts.length === 0
  ) {
    return;
  }

  const description =
    conflicts
      .map(
        (conflict) =>
          `${conflict.shortcut}: ${conflict.bindingIds.join(", ")}`,
      )
      .join("; ");

  throw new Error(
    `Shortcut conflict detected: ${description}`,
  );
}
