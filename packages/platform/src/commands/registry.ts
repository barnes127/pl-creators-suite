import {
  CommandPermissionError,
  DuplicateCommandError,
  UnknownCommandError,
} from "./errors";

import type {
  CommandContext,
  CommandDefinition,
  CommandExecutionResult,
  RegisteredCommand,
} from "./types";

import {
  validateCommandDefinition,
} from "./validation";


export class CommandRegistry {
  private readonly commands =
    new Map<
      string,
      CommandDefinition<
        unknown,
        unknown
      >
    >();


  register<
    TInput = unknown,
    TOutput = unknown,
  >(
    definition: CommandDefinition<
      TInput,
      TOutput
    >,
  ) {
    validateCommandDefinition(
      definition,
    );

    if (
      this.commands.has(
        definition.id,
      )
    ) {
      throw new DuplicateCommandError(
        definition.id,
      );
    }


    this.commands.set(
      definition.id,
      definition as CommandDefinition<
        unknown,
        unknown
      >,
    );


    return () => {
      this.unregister(
        definition.id,
      );
    };
  }


  unregister(
    commandId: string,
  ) {
    return this.commands.delete(
      commandId,
    );
  }


  has(
    commandId: string,
  ) {
    return this.commands.has(
      commandId,
    );
  }


  get(
    commandId: string,
  ): RegisteredCommand | undefined {
    const command =
      this.commands.get(
        commandId,
      );

    if (
      !command
    ) {
      return undefined;
    }


    return this.toPublicCommand(
      command,
    );
  }


  list(): RegisteredCommand[] {
    return Array
      .from(
        this.commands.values(),
      )
      .map(
        (command) =>
          this.toPublicCommand(
            command,
          ),
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.title.localeCompare(
            right.title,
          ),
      );
  }


  search(
    query: string,
  ): RegisteredCommand[] {
    const normalized =
      query
        .trim()
        .toLowerCase();


    if (
      normalized.length === 0
    ) {
      return this.list();
    }


    return this
      .list()
      .filter(
        (command) => {
          const haystack = [
            command.id,
            command.title,
            command.description ??
              "",
            command.category ??
              "",
            ...command.keywords,
          ]
            .join(
              " ",
            )
            .toLowerCase();


          return haystack.includes(
            normalized,
          );
        },
      );
  }


  async execute<
    TInput = unknown,
    TOutput = unknown,
  >(
    commandId: string,
    input: TInput,
    context: CommandContext,
  ): Promise<
    CommandExecutionResult<TOutput>
  > {
    const command =
      this.commands.get(
        commandId,
      );


    if (
      !command
    ) {
      throw new UnknownCommandError(
        commandId,
      );
    }


    for (
      const permission
      of command.requiredPermissions ??
      []
    ) {
      if (
        !context.permissions?.has(
          permission,
        )
      ) {
        throw new CommandPermissionError(
          commandId,
          permission,
        );
      }
    }


    return await command.execute(
      input,
      context,
    ) as CommandExecutionResult<
      TOutput
    >;
  }


  private toPublicCommand(
    command: CommandDefinition<
      unknown,
      unknown
    >,
  ): RegisteredCommand {
    return {
      id:
        command.id,

      title:
        command.title,

      description:
        command.description,

      category:
        command.category,

      version:
        command.version,

      status:
        command.status ??
        "active",

      deprecatedSince:
        command.deprecatedSince,

      replacementCommandId:
        command.replacementCommandId,

      requiredPermissions:
        command.requiredPermissions ??
        [],

      keywords:
        command.keywords ??
        [],
    };
  }
}
