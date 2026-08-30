import type {
  CapabilityDefinition,
} from "./types";


export function validateCapabilityDefinition(
  capability: CapabilityDefinition,
) {
  if (
    capability.id.trim().length ===
    0
  ) {
    throw new Error(
      "Capability ID cannot be empty.",
    );
  }


  if (
    capability.name.trim().length ===
    0
  ) {
    throw new Error(
      `Capability ${capability.id} requires a name.`,
    );
  }


  if (
    capability.status ===
      "deprecated" &&
    !capability.deprecatedSince
  ) {
    throw new Error(
      `Deprecated capability ${capability.id} requires deprecatedSince.`,
    );
  }


  if (
    capability.replacementCapabilityId ===
    capability.id
  ) {
    throw new Error(
      `Capability ${capability.id} cannot replace itself.`,
    );
  }
}
