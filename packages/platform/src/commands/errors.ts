export class CommandRegistryError
  extends Error {
  constructor(
    message: string,
  ) {
    super(
      message,
    );

    this.name =
      "CommandRegistryError";
  }
}


export class DuplicateCommandError
  extends CommandRegistryError {
  constructor(
    commandId: string,
  ) {
    super(
      `Command already registered: ${commandId}`,
    );

    this.name =
      "DuplicateCommandError";
  }
}


export class UnknownCommandError
  extends CommandRegistryError {
  constructor(
    commandId: string,
  ) {
    super(
      `Unknown command: ${commandId}`,
    );

    this.name =
      "UnknownCommandError";
  }
}


export class CommandPermissionError
  extends CommandRegistryError {
  constructor(
    commandId: string,
    permission: string,
  ) {
    super(
      `Command ${commandId} requires permission: ${permission}`,
    );

    this.name =
      "CommandPermissionError";
  }
}
