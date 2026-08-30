import type {
  AssetId,
  AssetReference,
} from "./types";


export interface DependencyEdge {
  from:
    AssetId;

  to:
    AssetId;

  relationship:
    AssetReference["relationship"];
}


export class AssetDependencyGraph {
  private readonly edges =
    new Map<
      AssetId,
      Map<
        AssetId,
        DependencyEdge
      >
    >();


  add(
    edge:
      DependencyEdge,
  ) {
    if (
      edge.from ===
      edge.to
    ) {
      throw new Error(
        `Asset ${edge.from} cannot depend on itself.`,
      );
    }


    const outgoing =
      this.edges.get(
        edge.from,
      ) ??
      new Map<
        AssetId,
        DependencyEdge
      >();


    outgoing.set(
      edge.to,
      edge,
    );


    this.edges.set(
      edge.from,
      outgoing,
    );
  }


  remove(
    from: AssetId,
    to: AssetId,
  ) {
    const outgoing =
      this.edges.get(
        from,
      );


    if (
      !outgoing
    ) {
      return false;
    }


    const removed =
      outgoing.delete(
        to,
      );


    if (
      outgoing.size ===
      0
    ) {
      this.edges.delete(
        from,
      );
    }


    return removed;
  }


  dependenciesOf(
    assetId:
      AssetId,
  ) {
    return Array.from(
      this.edges
        .get(
          assetId,
        )
        ?.values() ??
      [],
    );
  }


  dependentsOf(
    assetId:
      AssetId,
  ) {
    const dependents:
      DependencyEdge[] =
        [];


    for (
      const outgoing
      of this.edges.values()
    ) {
      for (
        const edge
        of outgoing.values()
      ) {
        if (
          edge.to ===
          assetId
        ) {
          dependents.push(
            edge,
          );
        }
      }
    }


    return dependents;
  }


  references(
    assetId:
      AssetId,
  ) {
    return {
      outgoing:
        this.dependenciesOf(
          assetId,
        ),

      incoming:
        this.dependentsOf(
          assetId,
        ),
    };
  }


  clearAsset(
    assetId:
      AssetId,
  ) {
    this.edges.delete(
      assetId,
    );


    for (
      const [
        from,
        outgoing,
      ]
      of this.edges
    ) {
      outgoing.delete(
        assetId,
      );


      if (
        outgoing.size ===
        0
      ) {
        this.edges.delete(
          from,
        );
      }
    }
  }
}
