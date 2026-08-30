import {
  CommandRegistryError,
} from "./errors";

import type {
  CommandDefinition,
} from "./types";


export function validateCommandDefinition(
  command: CommandDefinition,
) {
  if (
    command.id.trim().length === 0
  ) {
    throw new CommandRegistryError(
      "Command ID cannot be empty.",
    );
  }


  if (
    command.title.trim().length === 0
  ) {
    throw new CommandRegistryError(
      `Command ${command.id} requires a title.`,
    );
  }


  if (
    command.version.trim().length === 0
  ) {
    throw new CommandRegistryError(
      `Command ${command.id} requires a version.`,
    );
  }


  if (
    command.status ===
      "deprecated" &&
    !command.deprecatedSince
  ) {
    throw new CommandRegistryError(
      `Deprecated command ${command.id} requires deprecatedSince.`,
    );
  }


  if (
    command.replacementCommandId ===
    command.id
  ) {
    throw new CommandRegistryError(
      `Command ${command.id} cannot replace itself.`,
    );
  }
}
