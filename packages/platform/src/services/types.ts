export type ServiceCategory =
  | "project"
  | "file"
  | "ui"
  | "settings"
  | "notification"
  | "command"
  | "search"
  | "event"
  | "task"
  | "workflow"
  | "theme"
  | "template"
  | "data-source"
  | "query"
  | "other";

export type ServiceStability =
  | "experimental"
  | "internal"
  | "stable"
  | "deprecated";

export interface ServiceDescriptor {
  id: string;

  version: string;

  category:
    ServiceCategory;

  stability:
    ServiceStability;

  description?: string;

  requiredPermissions?:
    readonly string[];

  requiredCapabilities?:
    readonly string[];

  metadata?:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

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
