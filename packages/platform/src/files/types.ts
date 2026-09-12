export type FileEntryKind =
  | "file"
  | "directory"
  | "other";

export interface FileEntry {
  name: string;

  relativePath: string;

  kind:
    FileEntryKind;
}

export interface FileStat {
  relativePath: string;

  kind:
    FileEntryKind;

  size: number;

  modifiedAt?: string;
}

export interface FileWriteOptions {
  overwrite?: boolean;
}
