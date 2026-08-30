import {
  collectDerivedInvalidations,
} from "./cache";

import type {
  AssetDependencyGraph,
} from "./dependencyGraph";

import type {
  AssetRegistry,
} from "./registry";

import type {
  AssetId,
} from "./types";


export function invalidateDerivedAssets(
  sourceAssetId:
    AssetId,
  assets:
    AssetRegistry,
  graph:
    AssetDependencyGraph,
) {
  const result =
    collectDerivedInvalidations(
      sourceAssetId,
      assets.list(),
      graph,
    );


  const staleAssets =
    assets.markStale(
      result.invalidated,
    );


  return {
    sourceAssetId,

    invalidated:
      staleAssets.map(
        (
          asset,
        ) =>
          asset.id,
      ),
  };
}
