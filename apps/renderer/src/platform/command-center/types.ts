export type DashboardLayoutMode =
  | "grid"
  | "list";


export type DashboardWidgetSourceKind =
  | "first-party"
  | "extension";


export interface DashboardWidgetSource {
  kind:
    DashboardWidgetSourceKind;

  id:
    string;
}


export interface DashboardWidgetSize {
  columns:
    number;

  rows:
    number;
}


export interface DashboardWidgetSizeBounds {
  min:
    DashboardWidgetSize;

  max:
    DashboardWidgetSize;
}


export interface DashboardWidgetDefinition {
  id:
    string;

  contractVersion:
    number;

  version:
    string;

  title:
    string;

  description?:
    string;

  source:
    DashboardWidgetSource;

  defaultSize:
    DashboardWidgetSize;

  sizeBounds?:
    DashboardWidgetSizeBounds;

  defaultPinned?:
    boolean;

  defaultHidden?:
    boolean;

  defaultGroupId?:
    string;

  order?:
    number;

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


export interface DashboardWidgetPosition {
  column:
    number;

  row:
    number;

  order:
    number;
}


export interface DashboardWidgetInstance {
  instanceId:
    string;

  widgetId:
    string;

  widgetVersion:
    string;

  position:
    DashboardWidgetPosition;

  size:
    DashboardWidgetSize;

  pinned:
    boolean;

  hidden:
    boolean;

  groupId?:
    string;
}


export interface DashboardProfileState {
  schemaVersion:
    number;

  profileId:
    string;

  layoutMode:
    DashboardLayoutMode;

  widgets:
    readonly DashboardWidgetInstance[];
}


export interface DashboardWidgetRegistration {
  definition:
    DashboardWidgetDefinition;
}
