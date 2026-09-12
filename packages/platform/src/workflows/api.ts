import type {
  WorkflowApiAdapter,
  WorkflowDocument,
  WorkflowTaskDefinition,
  WorkflowSaveOptions,
  WorkflowDeleteOptions,
} from "./types";

export const WORKFLOW_API_SERVICE_ID =
  "core.workflow";

export const WORKFLOW_RUN_HANDLER_ID =
  "workflow.run";

export class WorkflowApi {
  constructor(
    private readonly adapter:
      WorkflowApiAdapter,
  ) {}

  list(
    projectRoot: string,
  ) {
    return this.adapter.list(
      projectRoot,
    );
  }

  create(
    projectRoot: string,
    name: string,
  ) {
    return this.adapter.create(
      projectRoot,
      name,
    );
  }

  read(
    projectRoot: string,
    name: string,
  ) {
    return this.adapter.read(
      projectRoot,
      name,
    );
  }

  save(
    projectRoot: string,
    name: string,
    workflow:
      WorkflowDocument,
    options?:
      WorkflowSaveOptions,
  ) {
    return this.adapter.save(
      projectRoot,
      name,
      workflow,
      options,
    );
  }

  delete(
    projectRoot: string,
    name: string,
    options?:
      WorkflowDeleteOptions,
  ) {
    return this.adapter.delete(
      projectRoot,
      name,
      options,
    );
  }

  createRunTask(
    projectRoot: string,
    name: string,
  ):
    WorkflowTaskDefinition {
    return {
      handlerId:
        WORKFLOW_RUN_HANDLER_ID,

      kind:
        "workflow",

      title:
        `Run workflow: ${name}`,

      input: {
        projectRoot,
        name,
      },

      supportsCancellation:
        true,

      metadata: {
        workflowName:
          name,

        projectRoot,
      },
    };
  }
}
