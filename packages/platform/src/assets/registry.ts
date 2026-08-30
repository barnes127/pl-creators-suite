import type {
  AssetId,
  AssetRecord,
} from "./types";


export class AssetRegistry {
  private readonly assets =
    new Map<
      AssetId,
      AssetRecord
    >();


  register(
    asset:
      AssetRecord,
  ) {
    if (
      asset.id.trim().length ===
      0
    ) {
      throw new Error(
        "Asset ID cannot be empty.",
      );
    }


    if (
      asset.name.trim().length ===
      0
    ) {
      throw new Error(
        `Asset ${asset.id} requires a name.`,
      );
    }


    if (
      this.assets.has(
        asset.id,
      )
    ) {
      throw new Error(
        `Asset already registered: ${asset.id}`,
      );
    }


    this.assets.set(
      asset.id,
      asset,
    );


    return () => {
      this.unregister(
        asset.id,
      );
    };
  }


  upsert(
    asset:
      AssetRecord,
  ) {
    this.assets.set(
      asset.id,
      asset,
    );

    return asset;
  }


  unregister(
    assetId:
      AssetId,
  ) {
    return this.assets.delete(
      assetId,
    );
  }


  has(
    assetId:
      AssetId,
  ) {
    return this.assets.has(
      assetId,
    );
  }


  get(
    assetId:
      AssetId,
  ) {
    return this.assets.get(
      assetId,
    );
  }


  list() {
    return Array
      .from(
        this.assets.values(),
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.name.localeCompare(
            right.name,
          ),
      );
  }


  findByPath(
    relativePath: string,
  ) {
    return this
      .list()
      .find(
        (
          asset,
        ) =>
          asset.relativePath ===
          relativePath,
      );
  }


  findMissing() {
    return this
      .list()
      .filter(
        (
          asset,
        ) =>
          asset.state ===
          "missing",
      );
  }


  findDerived() {
    return this
      .list()
      .filter(
        (
          asset,
        ) =>
          asset.ownership ===
          "derived",
      );
  }

  markStale(
    assetIds:
      readonly AssetId[],
  ) {
    const changed:
      AssetRecord[] =
        [];

    for (
      const assetId
      of assetIds
    ) {
      const asset =
        this.assets.get(
          assetId,
        );

      if (
        !asset ||
        asset.ownership !==
          "derived"
      ) {
        continue;
      }

      const staleAsset:
        AssetRecord = {
          ...asset,

          state:
            "stale",

          updatedAt:
            new Date()
              .toISOString(),
        };

      this.assets.set(
        assetId,
        staleAsset,
      );

      changed.push(
        staleAsset,
      );
    }

    return changed;
  }
}
