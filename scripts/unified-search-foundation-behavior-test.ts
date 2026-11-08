import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";

import type {
  RegisteredCommand,
  SearchResult,
} from "../packages/platform/src/index";
import {
  fromRegisteredCommand,
  fromSearchResult,
} from "../apps/renderer/src/platform/unified-search/normalize.ts";
import {
  scoreMatch,
  selectPaletteResults,
} from "../apps/renderer/src/platform/unified-search/rank.ts";
import type {
  PaletteResult,
  PaletteResultKind,
} from "../apps/renderer/src/platform/unified-search/types.ts";

let passed = 0;
let performanceDurationMs = 0;

function check(name: string, test: () => void): void {
  test();
  passed += 1;
  console.log(`PASS ${passed}: ${name}`);
}

function paletteResult(
  key: string,
  title: string,
  overrides: Partial<PaletteResult> = {},
): PaletteResult {
  return {
    key,
    kind: "document",
    title,
    category: "documents",
    score: 0,
    sourceId: "test.search",
    ref: {
      type: "resource",
      sourceId: "test.search",
      resultId: key,
      kind: "document",
    },
    requiredPermissions: [],
    enabled: false,
    disabledReason: "Resource navigation not connected yet",
    ...overrides,
  };
}

function searchResult(
  id: string,
  overrides: Partial<SearchResult> = {},
): SearchResult {
  return {
    id,
    kind: "document",
    title: `Resource ${id}`,
    sourceId: "test.search",
    ...overrides,
  };
}

const activeCommand: RegisteredCommand = {
  id: "docs.workspace.activate",
  title: "Open Documents",
  description: "Go to the documents workspace",
  category: "workspace",
  version: "1.0.0",
  status: "active",
  keywords: ["docs"],
  requiredPermissions: ["workspace.read"],
};

check(
  "command permissions and deprecated state are presentation-only",
  () => {
    const denied = fromRegisteredCommand(activeCommand);
    const allowed = fromRegisteredCommand(
      activeCommand,
      new Set(["workspace.read"]),
    );
    const deprecated = fromRegisteredCommand(
      {
        ...activeCommand,
        id: "docs.workspace.legacy",
        status: "deprecated",
      },
      new Set(["workspace.read"]),
    );

    assert.equal(denied.enabled, false);
    assert.equal(
      denied.disabledReason,
      "Required permission unavailable",
    );
    assert.deepEqual(
      denied.requiredPermissions,
      ["workspace.read"],
    );
    assert.equal(denied.ref.type, "command");
    assert.equal(allowed.enabled, true);
    assert.equal(allowed.disabledReason, undefined);
    assert.equal(deprecated.enabled, false);
    assert.equal(
      deprecated.disabledReason,
      "Command is deprecated",
    );
  },
);

check(
  "empty queries return deterministic listings capped at 100",
  () => {
    const entries = Array.from(
      {length: 150},
      (_, index) =>
        paletteResult(
          `empty:${String(index).padStart(3, "0")}`,
          `Entry ${index}`,
          {score: index % 7},
        ),
    );
    const defaultResults = selectPaletteResults(entries, {text: ""});
    const cappedResults = selectPaletteResults(entries, {
      text: "   ",
      limit: 10_000,
    });
    const reversedResults = selectPaletteResults(
      [...entries].reverse(),
      {text: "", limit: 10_000},
    );

    assert.equal(defaultResults.length, 50);
    assert.equal(cappedResults.length, 100);
    assert.deepEqual(
      cappedResults.map((entry) => entry.key),
      reversedResults.map((entry) => entry.key),
    );
  },
);

check(
  "case-insensitive exact, prefix, substring, and category ranks",
  () => {
    const ranked = selectPaletteResults(
      [
        paletteResult("rank:category", "Unrelated", {
          category: "Notes",
        }),
        paletteResult("rank:substring", "Project Notes"),
        paletteResult("rank:prefix", "Notes Archive"),
        paletteResult("rank:exact", "Notes"),
      ],
      {text: "nOtEs"},
    );

    assert.deepEqual(
      ranked.map((entry) => entry.key),
      [
        "rank:exact",
        "rank:prefix",
        "rank:substring",
        "rank:category",
      ],
    );
  },
);

check(
  "single, multiple, empty, and unsupported kind filters",
  () => {
    const entries = [
      paletteResult("kind:file", "File", {kind: "file"}),
      paletteResult("kind:document", "Document"),
      paletteResult("kind:command", "Command", {
        kind: "command",
        ref: {type: "command", commandId: "test.command"},
      }),
    ];

    assert.deepEqual(
      selectPaletteResults(entries, {
        text: "",
        kinds: ["file"],
      }).map((entry) => entry.kind),
      ["file"],
    );
    assert.deepEqual(
      new Set(
        selectPaletteResults(entries, {
          text: "",
          kinds: ["file", "command"],
        }).map((entry) => entry.kind),
      ),
      new Set(["file", "command"]),
    );
    assert.equal(
      selectPaletteResults(entries, {
        text: "",
        kinds: [] as PaletteResultKind[],
      }).length,
      3,
    );
    assert.equal(
      selectPaletteResults(entries, {
        text: "",
        kinds: ["unsupported" as PaletteResultKind],
      }).length,
      0,
    );
  },
);

check(
  "duplicate keys keep the highest-ranked entry without input mutation",
  () => {
    const entries = [
      paletteResult("duplicate:key", "Lower", {score: 1}),
      paletteResult("duplicate:key", "Higher", {score: 9}),
      paletteResult("duplicate:other", "Other", {score: 3}),
    ];
    const before = JSON.stringify(entries);
    const selected = selectPaletteResults(entries, {text: ""});

    assert.equal(selected.length, 2);
    assert.equal(
      selected.find((entry) => entry.key === "duplicate:key")?.title,
      "Higher",
    );
    assert.equal(JSON.stringify(entries), before);
    assert.notEqual(selected[0], entries[0]);
  },
);

check(
  "ties and conflicting duplicate content are input-order independent",
  () => {
    const alpha = paletteResult("tie:same", "Alpha", {
      category: "matched",
    });
    const zulu = paletteResult("tie:same", "Zulu", {
      category: "matched",
    });
    const keyed = [
      paletteResult("tie:b", "Equal", {score: 4}),
      paletteResult("tie:a", "Equal", {score: 4}),
    ];

    assert.deepEqual(
      selectPaletteResults(keyed, {text: ""}).map(
        (entry) => entry.key,
      ),
      ["tie:a", "tie:b"],
    );
    assert.equal(
      selectPaletteResults([zulu, alpha], {text: "matched"})[0]
        ?.title,
      "Alpha",
    );
    assert.equal(
      selectPaletteResults([alpha, zulu], {text: "matched"})[0]
        ?.title,
      "Alpha",
    );
  },
);

check(
  "invalid, negative, NaN, and infinite scores are deterministic",
  () => {
    const normalizedNaN = fromSearchResult(
      searchResult("nan-normalized", {score: Number.NaN}),
    );
    const entries = [
      paletteResult("score:nan", "NaN", {score: Number.NaN}),
      paletteResult("score:positive-infinity", "Positive infinity", {
        score: Number.POSITIVE_INFINITY,
      }),
      paletteResult("score:negative-infinity", "Negative infinity", {
        score: Number.NEGATIVE_INFINITY,
      }),
      paletteResult("score:negative", "Negative", {score: -25}),
    ];
    const selected = selectPaletteResults(entries, {text: ""});

    assert.equal(normalizedNaN.score, 0);
    assert.ok(selected.every((entry) => Number.isFinite(entry.score)));
    assert.equal(
      selected.find((entry) => entry.key === "score:negative")?.score,
      -25,
    );
    assert.deepEqual(
      selected.slice(0, 3).map((entry) => entry.key),
      [
        "score:nan",
        "score:negative-infinity",
        "score:positive-infinity",
      ],
    );
  },
);

check(
  "untrusted display text is cleaned and bounded to 240 characters",
  () => {
    const normalized = fromSearchResult(
      searchResult("long-text", {
        title: `\u0000Title\u001f${"x".repeat(300)}`,
        subtitle: `\u0007Subtitle\u007f${"y".repeat(300)}`,
      }),
    );

    assert.equal(normalized.title.length, 240);
    assert.equal(normalized.subtitle?.length, 240);
    assert.doesNotMatch(normalized.title, /[\u0000-\u001f\u007f]/);
    assert.doesNotMatch(
      normalized.subtitle ?? "",
      /[\u0000-\u001f\u007f]/,
    );
  },
);

check(
  "absolute, drive, UNC, empty-segment, and traversal paths are excluded",
  () => {
    const valid = fromSearchResult(
      searchResult("valid-path", {
        projectRelativePath: "docs/./notes.md",
        line: 4,
        column: 2,
      }),
    );
    const unsafePaths = [
      "/etc/passwd",
      "C:\\Users\\person\\secret.txt",
      "d:/private/secret.txt",
      "C:drive-relative.txt",
      "\\\\server\\share\\secret.txt",
      "../secret.txt",
      "docs/../../secret.txt",
      "docs//secret.txt",
      "docs/\u0000secret.txt",
    ];

    assert.equal(valid.ref.type, "resource");
    if (valid.ref.type === "resource") {
      assert.equal(
        valid.ref.projectRelativePath,
        "docs/./notes.md",
      );
      assert.equal(valid.ref.line, 4);
      assert.equal(valid.ref.column, 2);
    }

    for (const [index, path] of unsafePaths.entries()) {
      const normalized = fromSearchResult(
        searchResult(`unsafe-path-${index}`, {
          projectRelativePath: path,
        }),
      );

      assert.equal(normalized.ref.type, "resource");
      if (normalized.ref.type === "resource") {
        assert.equal(normalized.ref.projectRelativePath, undefined);
      }
    }
  },
);

check(
  "provider metadata, previews, task inputs, paths, and secrets are omitted",
  () => {
    const source = {
      ...searchResult("private-data", {
        preview: "SECRET_PREVIEW",
        metadata: {
          token: "SECRET_TOKEN",
          commandId: "system.delete",
          taskInputs: {password: "SECRET_PASSWORD"},
          absolutePath: "/home/person/private.txt",
        },
      }),
      taskInput: {privateKey: "SECRET_PRIVATE_KEY"},
    };
    const serialized = JSON.stringify(fromSearchResult(source));

    for (const forbidden of [
      "SECRET_PREVIEW",
      "SECRET_TOKEN",
      "SECRET_PASSWORD",
      "SECRET_PRIVATE_KEY",
      "/home/person/private.txt",
      "system.delete",
    ]) {
      assert.equal(serialized.includes(forbidden), false);
    }
  },
);

check(
  "resource text cannot turn a result into an executable command",
  () => {
    const resource = fromSearchResult(
      searchResult("command:system.delete", {
        kind: "file",
        title: "Delete Command",
        metadata: {commandId: "system.delete"},
      }),
    );
    const selected = selectPaletteResults([resource], {text: "delete"});

    assert.equal(selected.length, 1);
    assert.equal(selected[0]?.kind, "file");
    assert.equal(selected[0]?.ref.type, "resource");
    assert.equal(selected[0]?.enabled, false);
  },
);

check(
  "multi-thousand-result ranking remains bounded",
  () => {
    const entries = Array.from(
      {length: 8_000},
      (_, index) =>
        paletteResult(
          `performance:${String(index).padStart(5, "0")}`,
          index % 11 === 0
            ? `Needle result ${index}`
            : `Other result ${index}`,
          {score: (index % 201) - 100},
        ),
    );
    const startedAt = performance.now();
    const selected = selectPaletteResults(entries, {
      text: "needle",
      limit: 100_000,
    });

    performanceDurationMs = performance.now() - startedAt;
    assert.equal(selected.length, 100);
    assert.ok(
      performanceDurationMs < 2_000,
      `ranking took ${performanceDurationMs.toFixed(2)}ms`,
    );
  },
);

check(
  "bounded public command keywords support alias-only matching",
  () => {
    const command = fromRegisteredCommand(
      {
        ...activeCommand,
        title: "Open Knowledge Workspace",
        keywords: [
          "launch-docs",
          ...Array.from({length: 18}, (_, index) => `alias-${index}`),
          "x".repeat(300),
          "discarded-alias",
        ],
      },
      new Set(["workspace.read"]),
    );
    const selected = selectPaletteResults([command], {
      text: "launch-docs",
    });

    assert.equal(command.searchTerms?.length, 20);
    assert.ok(
      command.searchTerms?.every((term) => term.length <= 240),
    );
    assert.equal(selected.length, 1);
    assert.equal(selected[0]?.key, command.key);
  },
);

check(
  "content-only provider matches are query-scoped and reject stale tokens",
  () => {
    const resource = {
      ...fromSearchResult(
        searchResult("content-only", {
          title: "Opaque indexed result",
        }),
      ),
      providerMatchedForQuery: "needle",
    };
    const command = {
      ...fromRegisteredCommand({
        ...activeCommand,
        id: "opaque.command",
        title: "Opaque action",
        keywords: [],
        requiredPermissions: [],
      }),
      providerMatchedForQuery: "needle",
    };

    assert.equal(
      selectPaletteResults([resource], {text: " Needle "}).length,
      1,
    );
    assert.equal(
      selectPaletteResults([resource], {text: "changed"}).length,
      0,
    );
    assert.equal(
      selectPaletteResults([command], {text: "needle"}).length,
      0,
    );
  },
);

check(
  "provider scores are clamped to [-100, 100] before local boosts",
  () => {
    const entries = [
      paletteResult("bounded:high", "High", {score: 1_000_000}),
      paletteResult("bounded:low", "Low", {score: -1_000_000}),
      paletteResult("bounded:nan", "NaN", {score: Number.NaN}),
      paletteResult("bounded:infinity", "Infinity", {
        score: Number.POSITIVE_INFINITY,
      }),
    ];
    const selected = selectPaletteResults(entries, {text: ""});
    const scores = new Map(
      selected.map((entry) => [entry.key, entry.score]),
    );

    assert.equal(scores.get("bounded:high"), 100);
    assert.equal(scores.get("bounded:low"), -100);
    assert.equal(scores.get("bounded:nan"), 0);
    assert.equal(scores.get("bounded:infinity"), 0);
    assert.equal(scoreMatch(entries[2]!, ""), 0);
    assert.equal(
      scoreMatch(
        paletteResult("bounded:boost", "Exact", {score: 100_000}),
        "exact",
      ),
      1_100,
    );
  },
);

assert.equal(passed, 15);
console.log(
  `Unified search foundation behavior: PASS (${passed} cases, ` +
    `${performanceDurationMs.toFixed(2)}ms observed for 8,000 results)`,
);
