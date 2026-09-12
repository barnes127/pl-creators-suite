import type {
  ProjectMetadata,
  ProjectRecentItem,
  ProjectTreeNode,
} from "./types";

export const PROJECT_API_SERVICE_ID =
  "core.project";

export interface ProjectTreeOptions {
  ignore?:
    readonly string[];
}

export interface ProjectApiAdapter {
  getMetadata(
    projectRoot: string,
  ):
    Promise<ProjectMetadata>;

  listRecents():
    Promise<
      readonly ProjectRecentItem[]
    >;

  getTree(
    projectRoot: string,
    options?: ProjectTreeOptions,
  ):
    Promise<ProjectTreeNode>;
}

export class ProjectApi {
  constructor(
    private readonly adapter:
      ProjectApiAdapter,
  ) {}

  getMetadata(
    projectRoot: string,
  ) {
    return this.adapter
      .getMetadata(
        projectRoot,
      );
  }

  listRecents() {
    return this.adapter
      .listRecents();
  }

  getTree(
    projectRoot: string,
    options:
      ProjectTreeOptions = {},
  ) {
    return this.adapter
      .getTree(
        projectRoot,
        options,
      );
  }
}
