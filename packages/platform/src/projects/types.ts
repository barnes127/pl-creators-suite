export type ProjectResourceState =
  | "embedded"
  | "linked"
  | "external"
  | "generated"
  | "cached"
  | "stale"
  | "missing"
  | "shared"
  | "derived";


export interface ProjectMetadata {
  id?: string;

  name: string;

  projectRoot: string;

  schemaVersion: number;

  createdAt?: string;

  updatedAt?: string;

  lastOpenedAt?: string;
}


export interface ProjectRecentItem {
  projectRoot: string;

  name: string;

  lastOpenedAt: string;
}


export type ProjectTreeNodeKind =
  | "file"
  | "directory";


export interface ProjectTreeNode {
  id: string;

  name: string;

  relativePath: string;

  kind: ProjectTreeNodeKind;

  children?:
    readonly ProjectTreeNode[];
}
