export type SearchResultKind =
  | "file"
  | "document"
  | "cell"
  | "symbol"
  | "asset"
  | "scene"
  | "shot"
  | "task"
  | "workflow"
  | "extension";


export interface SearchQuery {
  text: string;

  kinds?:
    readonly SearchResultKind[];

  limit?: number;
}


export interface SearchResult {
  id: string;

  kind:
    SearchResultKind;

  title: string;

  subtitle?: string;

  projectRelativePath?: string;

  line?: number;

  column?: number;

  preview?: string;

  score?: number;

  sourceId: string;

  metadata?:
    Record<
      string,
      unknown
    >;
}


export interface SearchContext {
  projectRoot: string;

  cancellationToken?: {
    isCancelled():
      boolean;

    throwIfCancelled():
      void;
  };
}


export interface SearchProvider {
  id: string;

  kinds:
    readonly SearchResultKind[];

  search(
    query: SearchQuery,
    context: SearchContext,
  ):
    Promise<
      readonly SearchResult[]
    >;
}
