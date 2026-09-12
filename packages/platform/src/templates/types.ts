export type TemplateKind =
  | "project"
  | "document"
  | "code"
  | "model"
  | "movie"
  | "game"
  | "spreadsheet"
  | "workflow"
  | "other";

export interface TemplateContribution {
  id: string;

  name: string;

  kind:
    TemplateKind;

  sourceId: string;

  description?: string;

  payload:
    Readonly<
      Record<
        string,
        unknown
      >
    >;

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
}
