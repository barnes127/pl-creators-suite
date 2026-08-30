import {
  DuplicateServiceError,
  ServicePermissionError,
  UnknownServiceError,
} from "./errors";

import type {
  RegisteredService,
  ServiceDescriptor,
  ServiceDiscoveryContext,
} from "./types";


export class ServiceRegistry {
  private readonly services =
    new Map<
      string,
      RegisteredService<unknown>
    >();


  register<
    TService,
  >(
    descriptor:
      ServiceDescriptor,
    service:
      TService,
  ) {
    if (
      descriptor.id.trim().length ===
      0
    ) {
      throw new Error(
        "Service ID cannot be empty.",
      );
    }


    if (
      descriptor.version.trim().length ===
      0
    ) {
      throw new Error(
        `Service ${descriptor.id} requires a version.`,
      );
    }


    if (
      descriptor.replacementServiceId ===
      descriptor.id
    ) {
      throw new Error(
        `Service ${descriptor.id} cannot replace itself.`,
      );
    }


    if (
      this.services.has(
        descriptor.id,
      )
    ) {
      throw new DuplicateServiceError(
        descriptor.id,
      );
    }


    this.services.set(
      descriptor.id,
      {
        descriptor: {
          ...descriptor,

          requiredPermissions:
            descriptor.requiredPermissions ??
            [],
        },

        service,
      },
    );


    return () => {
      this.unregister(
        descriptor.id,
      );
    };
  }


  unregister(
    serviceId: string,
  ) {
    return this.services.delete(
      serviceId,
    );
  }


  has(
    serviceId: string,
  ) {
    return this.services.has(
      serviceId,
    );
  }


  describe(
    serviceId: string,
  ) {
    return this.services.get(
      serviceId,
    )?.descriptor;
  }


  list() {
    return Array
      .from(
        this.services.values(),
      )
      .map(
        (
          entry,
        ) =>
          entry.descriptor,
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.id.localeCompare(
            right.id,
          ),
      );
  }


  discover<
    TService,
  >(
    serviceId: string,
    context:
      ServiceDiscoveryContext,
  ): TService {
    const registered =
      this.services.get(
        serviceId,
      );


    if (
      !registered
    ) {
      throw new UnknownServiceError(
        serviceId,
      );
    }


    for (
      const permission
      of registered
        .descriptor
        .requiredPermissions ??
      []
    ) {
      if (
        !context.permissions.has(
          permission,
        )
      ) {
        throw new ServicePermissionError(
          serviceId,
          permission,
        );
      }
    }


    return registered.service as
      TService;
  }


  canDiscover(
    serviceId: string,
    context:
      ServiceDiscoveryContext,
  ) {
    try {
      this.discover(
        serviceId,
        context,
      );

      return true;
    } catch {
      return false;
    }
  }
}
