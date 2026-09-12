import {
  assertContributionAccess,
} from "../ui";

import type {
  ContributionAccessContext,
} from "../ui";

import type {
  ThemeContribution,
} from "./types";

export class ThemeRegistry {
  private readonly themes =
    new Map<
      string,
      ThemeContribution
    >();

  register(
    theme:
      ThemeContribution,
  ) {
    const id =
      theme.id.trim();

    if (!id) {
      throw new Error(
        "Theme ID is required.",
      );
    }

    if (
      this.themes.has(
        id,
      )
    ) {
      throw new Error(
        `Theme already registered: ${id}`,
      );
    }

    const normalized:
      ThemeContribution = {
        ...theme,

        id,

        requiredPermissions:
          theme.requiredPermissions ??
          [],

        requiredCapabilities:
          theme.requiredCapabilities ??
          [],
      };

    this.themes.set(
      id,
      normalized,
    );

    return () => {
      this.unregister(
        id,
      );
    };
  }

  unregister(
    themeId: string,
  ) {
    return this.themes.delete(
      themeId,
    );
  }

  get(
    themeId: string,
  ) {
    return this.themes.get(
      themeId,
    );
  }

  list() {
    return Array
      .from(
        this.themes.values(),
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

  discover(
    themeId: string,
    context:
      ContributionAccessContext,
  ) {
    const theme =
      this.themes.get(
        themeId,
      );

    if (!theme) {
      return undefined;
    }

    assertContributionAccess(
      theme.id,
      theme,
      context,
    );

    return theme;
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
  ) {
    return this
      .list()
      .filter(
        (
          theme,
        ) => {
          try {
            assertContributionAccess(
              theme.id,
              theme,
              context,
            );

            return true;
          } catch {
            return false;
          }
        },
      );
  }
}
