import type {
  TaskDefinition,
  TaskRecord,
  TaskService,
} from "./types";

export const TASK_API_SERVICE_ID =
  "core.task";

export class TaskApi {
  constructor(
    private readonly service:
      TaskService,
  ) {}

  start<
    TInput = unknown,
    TResult = unknown,
  >(
    definition:
      TaskDefinition<TInput>,
  ) {
    return this.service.start<
      TInput,
      TResult
    >(
      definition,
    );
  }

  cancel(
    taskId: string,
  ) {
    return this.service.cancel(
      taskId,
    );
  }

  get(
    taskId: string,
  ) {
    return this.service.get(
      taskId,
    );
  }

  list():
    Promise<
      readonly TaskRecord[]
    > {
    return this.service.list();
  }
}
