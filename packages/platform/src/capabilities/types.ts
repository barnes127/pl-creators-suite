export type CapabilityStatus =
  | "planned"
  | "partial"
  | "complete"
  | "deprecated";


export interface CapabilityDefinition {
  id: string;

  name: string;

  description?: string;

  slice?: string;

  area?: string;

  version?: string;

  status: CapabilityStatus;

  deprecatedSince?: string;

  replacementCapabilityId?: string;

  requiredPermissions?: readonly string[];

  metadata?: Record<
    string,
    unknown
  >;
}


export interface CapabilitySearchOptions {
  query?: string;

  slice?: string;

  area?: string;

  status?: CapabilityStatus;

  includeDeprecated?: boolean;
}
