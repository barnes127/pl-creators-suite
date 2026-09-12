export type UiContributionKind =
  | "panel"
  | "menu"
  | "toolbar";

export type UiContributionLocation =
  | "primary"
  | "secondary"
  | "sidebar"
  | "status"
  | "context"
  | "slice";

export interface UiContribution {
  id: string;

  kind:
    UiContributionKind;

  title: string;

  sourceId: string;

  location?:
    UiContributionLocation;

  order?: number;

  commandId?: string;

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
