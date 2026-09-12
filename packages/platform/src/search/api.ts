import type {
  SearchContext,
  SearchProvider,
  SearchQuery,
  SearchResult,
  SearchResultKind,
} from "./types";

import type {
  SearchProviderRegistry,
} from "./registry";

export const SEARCH_API_SERVICE_ID =
  "core.search";

export class SearchApi {
  constructor(
    private readonly registry:
      SearchProviderRegistry,
  ) {}

  register(
    provider:
      SearchProvider,
  ) {
    return this.registry.register(
      provider,
    );
  }

  unregister(
    providerId: string,
  ) {
    return this.registry.unregister(
      providerId,
    );
  }

  list() {
    return this.registry.list();
  }

  providersForKinds(
    kinds?:
      readonly SearchResultKind[],
  ) {
    return this.registry
      .providersForKinds(
        kinds,
      );
  }

  search(
    query:
      SearchQuery,
    context:
      SearchContext,
  ):
    Promise<SearchResult[]> {
    return this.registry.search(
      query,
      context,
    );
  }
}
