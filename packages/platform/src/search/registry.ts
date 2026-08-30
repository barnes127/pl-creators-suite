import type {
  SearchContext,
  SearchProvider,
  SearchQuery,
  SearchResult,
  SearchResultKind,
} from "./types";


export class SearchProviderRegistry {
  private readonly providers =
    new Map<
      string,
      SearchProvider
    >();


  register(
    provider:
      SearchProvider,
  ) {
    if (
      provider.id.trim().length ===
      0
    ) {
      throw new Error(
        "Search provider ID cannot be empty.",
      );
    }


    if (
      this.providers.has(
        provider.id,
      )
    ) {
      throw new Error(
        `Search provider already registered: ${provider.id}`,
      );
    }


    this.providers.set(
      provider.id,
      provider,
    );


    return () => {
      this.unregister(
        provider.id,
      );
    };
  }


  unregister(
    providerId: string,
  ) {
    return this.providers.delete(
      providerId,
    );
  }


  has(
    providerId: string,
  ) {
    return this.providers.has(
      providerId,
    );
  }


  list() {
    return Array.from(
      this.providers.values(),
    );
  }


  providersForKinds(
    kinds?:
      readonly SearchResultKind[],
  ) {
    if (
      !kinds ||
      kinds.length ===
      0
    ) {
      return this.list();
    }


    const requested =
      new Set(
        kinds,
      );


    return this
      .list()
      .filter(
        (
          provider,
        ) =>
          provider.kinds.some(
            (
              kind,
            ) =>
              requested.has(
                kind,
              ),
          ),
      );
  }


  async search(
    query:
      SearchQuery,
    context:
      SearchContext,
  ): Promise<
    SearchResult[]
  > {
    const text =
      query.text.trim();


    if (
      text.length ===
      0
    ) {
      return [];
    }


    context
      .cancellationToken
      ?.throwIfCancelled();


    const providers =
      this.providersForKinds(
        query.kinds,
      );


    const collected:
      SearchResult[] =
        [];


    for (
      const provider
      of providers
    ) {
      context
        .cancellationToken
        ?.throwIfCancelled();


      const results =
        await provider.search(
          {
            ...query,

            text,
          },
          context,
        );


      collected.push(
        ...results,
      );
    }


    const limit =
      Math.max(
        1,
        query.limit ??
        100,
      );


    return collected
      .sort(
        (
          left,
          right,
        ) =>
          (
            right.score ??
            0
          ) -
          (
            left.score ??
            0
          ),
      )
      .slice(
        0,
        limit,
      );
  }
}
