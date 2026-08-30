export type CommandId =
  string;


export type CommandStatus =
  | "active"
  | "deprecated";


export type CommandPermission =
  string;


export interface CommandContext {
  source:
    | "ui"
    | "shortcut"
    | "workflow"
    | "cli"
    | "extension"
    | "ai"
    | "system";

  permissions?: ReadonlySet<CommandPermission>;

  metadata?: Record<
    string,
    unknown
  >;
}


export interface CommandExecutionResult<
  TOutput = unknown,
> {
  ok: boolean;

  value?: TOutput;

  error?: string;
}


export interface CommandDefinition<
  TInput = unknown,
  TOutput = unknown,
> {
  id: CommandId;

  title: string;

  description?: string;

  category?: string;

  version: string;

  status?: CommandStatus;

  deprecatedSince?: string;

  replacementCommandId?: CommandId;

  requiredPermissions?: readonly CommandPermission[];

  keywords?: readonly string[];

  execute: (
    input: TInput,
    context: CommandContext,
  ) =>
    | CommandExecutionResult<TOutput>
    | Promise<
        CommandExecutionResult<TOutput>
      >;
}


export interface RegisteredCommand {
  id: CommandId;

  title: string;

  description?: string;

  category?: string;

  version: string;

  status: CommandStatus;

  deprecatedSince?: string;

  replacementCommandId?: CommandId;

  requiredPermissions: readonly CommandPermission[];

  keywords: readonly string[];
}
