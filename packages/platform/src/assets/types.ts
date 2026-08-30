import type {
  ProjectResourceState,
} from "../projects";


export type AssetId =
  string;


export type AssetKind =
  | "image"
  | "audio"
  | "video"
  | "model"
  | "document"
  | "code"
  | "spreadsheet"
  | "scene"
  | "shot"
  | "game"
  | "workflow"
  | "extension"
  | "other";


export type AssetOwnership =
  | "source"
  | "derived";


export interface AssetReference {
  assetId: AssetId;

  relationship:
    | "depends-on"
    | "uses"
    | "contains"
    | "generated-from"
    | "references";
}


export interface AssetRecord {
  id: AssetId;

  name: string;

  kind: AssetKind;

  relativePath: string;

  sourcePath?: string;

  state:
    ProjectResourceState;

  ownership:
    AssetOwnership;

  contentHash?: string;

  sourceHash?: string;

  cacheKey?: string;

  createdAt: string;

  updatedAt: string;

  references:
    readonly AssetReference[];

  metadata?:
    Record<
      string,
      unknown
    >;
}
