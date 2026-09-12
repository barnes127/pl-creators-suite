import type {
  CommandContext,
  CommandExecutionResult,
  RegisteredCommand,
  CommandDefinition,
} from "./types";

import type {
  CommandRegistry,
} from "./registry";

export const COMMAND_API_SERVICE_ID =
  "core.command";

export class CommandApi {
  constructor(
    private readonly registry:
      CommandRegistry,
  ) {}

  register<
    TInput = unknown,
    TOutput = unknown,
  >(
    definition:
      CommandDefinition<
        TInput,
        TOutput
      >,
  ) {
    return this.registry.register(
      definition,
    );
  }

  unregister(
    commandId: string,
  ) {
    return this.registry.unregister(
      commandId,
    );
  }

  get(
    commandId: string,
  ) {
    return this.registry.get(
      commandId,
    );
  }

  list():
    RegisteredCommand[] {
    return this.registry.list();
  }

  search(
    query: string,
  ):
    RegisteredCommand[] {
    return this.registry.search(
      query,
    );
  }

  execute<
    TInput = unknown,
    TOutput = unknown,
  >(
    commandId: string,
    input: TInput,
    context:
      CommandContext,
  ):
    Promise<
      CommandExecutionResult<TOutput>
    > {
    return this.registry.execute<
      TInput,
      TOutput
    >(
      commandId,
      input,
      context,
    );
  }
}
