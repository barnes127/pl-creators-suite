import type {
  RegisteredCommand,
  SearchResultKind,
} from "@pl/platform";

export type PaletteResultKind =
  | SearchResultKind
  | "command"
  | "setting"
  | "help";

export type PaletteResultRef =
  | {
      type: "command";
      commandId: string;
    }
  | {
      type: "resource";
      sourceId: string;
      resultId: string;
      kind: SearchResultKind;
      projectRelativePath?: string;
      line?: number;
      column?: number;
    }
  | {
      type: "unavailable";
    };

export interface PaletteResult {
  key: string;
  kind: PaletteResultKind;
  title: string;
  subtitle?: string;
  category: string;
  score: number;
  sourceId: string;
  ref: PaletteResultRef;
  requiredPermissions: readonly string[];
  enabled: boolean;
  disabledReason?: string;
  /** Safe, public command keywords used for alias discovery. */
  searchTerms?: readonly string[];
  /** Exact normalized query for which a trusted provider returned this hit. */
  providerMatchedForQuery?: string;
}

export interface PaletteSearchInput {
  text: string;
  kinds?: readonly PaletteResultKind[];
  limit?: number;
}

export type CommandPublicRecord = RegisteredCommand;
