export class ServiceRegistryError
  extends Error {
  constructor(
    message: string,
  ) {
    super(
      message,
    );

    this.name =
      "ServiceRegistryError";
  }
}


export class DuplicateServiceError
  extends ServiceRegistryError {
  constructor(
    serviceId: string,
  ) {
    super(
      `Service already registered: ${serviceId}`,
    );

    this.name =
      "DuplicateServiceError";
  }
}


export class UnknownServiceError
  extends ServiceRegistryError {
  constructor(
    serviceId: string,
  ) {
    super(
      `Unknown service: ${serviceId}`,
    );

    this.name =
      "UnknownServiceError";
  }
}


export class ServicePermissionError
  extends ServiceRegistryError {
  constructor(
    serviceId: string,
    permission: string,
  ) {
    super(
      `Service ${serviceId} requires permission: ${permission}`,
    );

    this.name =
      "ServicePermissionError";
  }
}
