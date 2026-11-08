import type {
  PaletteResult,
  PaletteSearchInput,
} from "./types";

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function boundedProviderScore(score: number): number {
  if (!Number.isFinite(score)) return 0;

  return Math.max(-100, Math.min(100, score));
}

function compareText(left: string, right: string): number {
  if (left === right) return 0;

  return left < right ? -1 : 1;
}

function resultTieKey(result: PaletteResult): string {
  const ref = result.ref.type === "command"
    ? [result.ref.type, result.ref.commandId]
    : result.ref.type === "resource"
      ? [
          result.ref.type,
          result.ref.sourceId,
          result.ref.resultId,
          result.ref.kind,
          result.ref.projectRelativePath ?? "",
          result.ref.line ?? "",
          result.ref.column ?? "",
        ]
      : [result.ref.type];

  return JSON.stringify([
    result.kind,
    result.title,
    result.subtitle ?? "",
    result.category,
    result.sourceId,
    ref,
    result.requiredPermissions,
    result.enabled,
    result.disabledReason ?? "",
    result.searchTerms ?? [],
    result.providerMatchedForQuery ?? "",
  ]);
}

export function scoreMatch(
  result: PaletteResult,
  query: string,
): number {
  const providerScore = boundedProviderScore(result.score);
  const needle = normalize(query);

  if (!needle) return providerScore;

  const title = normalize(result.title);
  const category = normalize(result.category);
  const key = normalize(result.key);

  if (title === needle) return providerScore + 1000;
  if (title.startsWith(needle)) return providerScore + 700;
  if (title.includes(needle)) return providerScore + 400;
  if (category.includes(needle)) return providerScore + 100;
  if (key.includes(needle)) return providerScore + 50;
  if (
    result.searchTerms?.some(
      (term) => normalize(term).includes(needle),
    )
  ) {
    return providerScore + 40;
  }
  if (
    result.ref.type === "resource" &&
    result.providerMatchedForQuery === needle
  ) {
    return providerScore + 10;
  }

  return Number.NEGATIVE_INFINITY;
}

export function selectPaletteResults(
  entries: readonly PaletteResult[],
  input: PaletteSearchInput,
): PaletteResult[] {
  const limit = Number.isFinite(input.limit)
    ? Math.max(1, Math.min(100, Math.floor(input.limit!)))
    : 50;
  const kinds = input.kinds?.length
    ? new Set(input.kinds)
    : null;
  const seen = new Set<string>();

  return entries
    .filter((entry) => !kinds || kinds.has(entry.kind))
    .map((entry) => {
      const boundedEntry = {
        ...entry,
        score: boundedProviderScore(entry.score),
      };

      return {
        entry: boundedEntry,
        matchScore: scoreMatch(boundedEntry, input.text),
        tieKey: resultTieKey(boundedEntry),
      };
    })
    .filter((item) => Number.isFinite(item.matchScore))
    .sort((left, right) =>
      right.matchScore - left.matchScore ||
      compareText(left.entry.key, right.entry.key) ||
      compareText(left.tieKey, right.tieKey),
    )
    .filter(({entry}) => {
      if (seen.has(entry.key)) return false;

      seen.add(entry.key);
      return true;
    })
    .slice(0, limit)
    .map(({entry, matchScore}) => ({
      ...entry,
      score: matchScore,
    }));
}
