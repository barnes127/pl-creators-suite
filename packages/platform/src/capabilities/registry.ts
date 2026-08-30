import {
  validateCapabilityDefinition,
} from "./validation";

import type {
  CapabilityDefinition,
  CapabilitySearchOptions,
} from "./types";


export class CapabilityRegistry {
  private readonly capabilities =
    new Map<
      string,
      CapabilityDefinition
    >();


  register(
    capability:
      CapabilityDefinition,
  ) {
    validateCapabilityDefinition(
      capability,
    );


    if (
      this.capabilities.has(
        capability.id,
      )
    ) {
      throw new Error(
        `Capability already registered: ${capability.id}`,
      );
    }


    this.capabilities.set(
      capability.id,
      {
        ...capability,

        requiredPermissions:
          capability.requiredPermissions ??
          [],
      },
    );


    return () => {
      this.unregister(
        capability.id,
      );
    };
  }


  registerMany(
    capabilities:
      readonly CapabilityDefinition[],
  ) {
    const unregisterCallbacks =
      capabilities.map(
        (
          capability,
        ) =>
          this.register(
            capability,
          ),
      );


    return () => {
      for (
        const unregister
        of unregisterCallbacks.reverse()
      ) {
        unregister();
      }
    };
  }


  unregister(
    capabilityId: string,
  ) {
    return this.capabilities.delete(
      capabilityId,
    );
  }


  has(
    capabilityId: string,
  ) {
    return this.capabilities.has(
      capabilityId,
    );
  }


  get(
    capabilityId: string,
  ) {
    return this.capabilities.get(
      capabilityId,
    );
  }


  list() {
    return Array
      .from(
        this.capabilities.values(),
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.name.localeCompare(
            right.name,
          ),
      );
  }


  search(
    options:
      CapabilitySearchOptions =
        {},
  ) {
    const query =
      options.query
        ?.trim()
        .toLowerCase();


    return this
      .list()
      .filter(
        (
          capability,
        ) => {
          if (
            !options.includeDeprecated &&
            capability.status ===
              "deprecated"
          ) {
            return false;
          }


          if (
            options.slice &&
            capability.slice !==
              options.slice
          ) {
            return false;
          }


          if (
            options.area &&
            capability.area !==
              options.area
          ) {
            return false;
          }


          if (
            options.status &&
            capability.status !==
              options.status
          ) {
            return false;
          }


          if (
            !query
          ) {
            return true;
          }


          const haystack = [
            capability.id,
            capability.name,
            capability.description ??
              "",
            capability.slice ??
              "",
            capability.area ??
              "",
          ]
            .join(
              " ",
            )
            .toLowerCase();


          return haystack.includes(
            query,
          );
        },
      );
  }
}
