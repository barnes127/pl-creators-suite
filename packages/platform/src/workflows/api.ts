import type {
  WorkflowApiAdapter,
  WorkflowDocument,
  WorkflowTaskDefinition,
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
  ) {
    return this.adapter.save(
      projectRoot,
      name,
      workflow,
    );
  }

  delete(
    projectRoot: string,
    name: string,
  ) {
    return this.adapter.delete(
      projectRoot,
      name,
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
