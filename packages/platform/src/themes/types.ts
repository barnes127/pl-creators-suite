export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type ThemeTokens =
  Readonly<
    Record<
      string,
      string
    >
  >;

export interface ThemeContribution {
  id: string;

  name: string;

  sourceId: string;

  mode?:
    ThemeMode;

  tokens:
    ThemeTokens;

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
