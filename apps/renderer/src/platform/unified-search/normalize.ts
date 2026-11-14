import type {
  RegisteredCommand,
  SearchResult,
} from "@pl/platform";

import type {
  PaletteResult,
} from "./types";

function isControlCharacter(character: string): boolean {
  const code = character.charCodeAt(0);
  return code <= 0x1f || code === 0x7f;
}

function displayText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;

  const normalized = Array.from(
    value,
    (character) => isControlCharacter(character) ? " " : character,
  ).join("").trim();

  return normalized.slice(0, 240) || fallback;
}

function safeProjectRelativePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const candidate = value.trim().replace(/\\/g, "/");

  if (
    !candidate ||
    Array.from(candidate).some(isControlCharacter) ||
    candidate.startsWith("/") ||
    /^[a-zA-Z]:/.test(candidate)
  ) {
    return undefined;
  }

  const segments = candidate.split("/");

  if (
    segments.some(
      (segment) =>
        segment === ".." ||
        segment === "",
    )
  ) {
    return undefined;
  }

  return candidate;
}

function safePosition(value: unknown): number | undefined {
  return Number.isSafeInteger(value) && Number(value) > 0
    ? Number(value)
    : undefined;
}

export function fromRegisteredCommand(
  command: RegisteredCommand,
  availablePermissions: ReadonlySet<string> = new Set(),
): PaletteResult {
  const missingPermissions = command.requiredPermissions.filter(
    (permission) => !availablePermissions.has(permission),
  );
  const enabled =
    command.status === "active" &&
    missingPermissions.length === 0;

  return {
    key: `command:${command.id}`,
    kind: "command",
    title: displayText(command.title, "Unnamed command"),
    subtitle: displayText(command.description, ""),
    category: displayText(command.category, "Commands"),
    score: 0,
    sourceId: "core.command",
    ref: {
      type: "command",
      commandId: command.id,
    },
    requiredPermissions: [...command.requiredPermissions],
    searchTerms: command.keywords
      .map((term) => displayText(term, ""))
      .filter(Boolean)
      .slice(0, 20),
    enabled,
    disabledReason: enabled
      ? undefined
      : command.status === "deprecated"
        ? "Command is deprecated"
        : "Required permission unavailable",
  };
}

export function fromSearchResult(result: SearchResult): PaletteResult {
  const relativePath = safeProjectRelativePath(result.projectRelativePath);
  const line = safePosition(result.line);
  const column = safePosition(result.column);

  return {
    key: `resource:${result.sourceId}:${result.kind}:${result.id}`,
    kind: result.kind,
    title: displayText(result.title, "Unnamed resource"),
    subtitle: displayText(result.subtitle, ""),
    category: result.kind,
    score:
      typeof result.score === "number" &&
      Number.isFinite(result.score)
        ? result.score
        : 0,
    sourceId: result.sourceId,
    ref: {
      type: "resource",
      sourceId: result.sourceId,
      resultId: result.id,
      kind: result.kind,
      ...(relativePath
        ? {projectRelativePath: relativePath}
        : {}),
      ...(line ? {line} : {}),
      ...(column ? {column} : {}),
    },
    requiredPermissions: [],
    enabled: false,
    disabledReason: "Resource navigation not connected yet",
  };
}
