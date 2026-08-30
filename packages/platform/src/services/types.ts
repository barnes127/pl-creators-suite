export interface ServiceDescriptor {
  id: string;

  version: string;

  description?: string;

  requiredPermissions?:
    readonly string[];

  deprecated?: boolean;

  deprecatedSince?: string;

  replacementServiceId?:
    string;
}


export interface ServiceDiscoveryContext {
  requesterId: string;

  permissions:
    ReadonlySet<string>;
}


export interface RegisteredService<
  TService = unknown,
> {
  descriptor:
    ServiceDescriptor;

  service:
    TService;
}
