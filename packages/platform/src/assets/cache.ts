import type {
  AssetId,
  AssetRecord,
} from "./types";

import type {
  AssetDependencyGraph,
} from "./dependencyGraph";


export interface CacheInvalidationResult {
  sourceAssetId:
    AssetId;

  invalidated:
    readonly AssetId[];
}


export function collectDerivedInvalidations(
  sourceAssetId: AssetId,
  assets:
    readonly AssetRecord[],
  graph:
    AssetDependencyGraph,
): CacheInvalidationResult {
  const assetMap =
    new Map(
      assets.map(
        (
          asset,
        ) => [
          asset.id,
          asset,
        ],
      ),
    );


  const invalidated =
    new Set<
      AssetId
    >();


  const pending:
    AssetId[] = [
      sourceAssetId,
    ];


  while (
    pending.length >
    0
  ) {
    const current =
      pending.shift();


    if (
      !current
    ) {
      continue;
    }


    for (
      const edge
      of graph.dependentsOf(
        current,
      )
    ) {
      const dependent =
        assetMap.get(
          edge.from,
        );


      if (
        !dependent ||
        dependent.ownership !==
          "derived" ||
        invalidated.has(
          dependent.id,
        )
      ) {
        continue;
      }


      invalidated.add(
        dependent.id,
      );


      pending.push(
        dependent.id,
      );
    }
  }


  return {
    sourceAssetId,

    invalidated:
      Array.from(
        invalidated,
      ),
  };
}
