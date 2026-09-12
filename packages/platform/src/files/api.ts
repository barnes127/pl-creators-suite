import type {
  FileEntry,
  FileStat,
  FileWriteOptions,
} from "./types";

export const FILE_API_SERVICE_ID =
  "core.file";

export interface FileApiAdapter {
  readText(
    projectRoot: string,
    relativePath: string,
  ):
    Promise<string>;

  list(
    projectRoot: string,
    relativePath?: string,
  ):
    Promise<
      readonly FileEntry[]
    >;

  stat(
    projectRoot: string,
    relativePath: string,
  ):
    Promise<FileStat>;

  writeText(
    projectRoot: string,
    relativePath: string,
    content: string,
    options?: FileWriteOptions,
  ):
    Promise<void>;
}

export class FileApi {
  constructor(
    private readonly adapter:
      FileApiAdapter,
  ) {}

  readText(
    projectRoot: string,
    relativePath: string,
  ) {
    return this.adapter
      .readText(
        projectRoot,
        relativePath,
      );
  }

  list(
    projectRoot: string,
    relativePath = "",
  ) {
    return this.adapter
      .list(
        projectRoot,
        relativePath,
      );
  }

  stat(
    projectRoot: string,
    relativePath: string,
  ) {
    return this.adapter
      .stat(
        projectRoot,
        relativePath,
      );
  }

  writeText(
    projectRoot: string,
    relativePath: string,
    content: string,
    options:
      FileWriteOptions = {},
  ) {
    return this.adapter
      .writeText(
        projectRoot,
        relativePath,
        content,
        options,
      );
  }
}
