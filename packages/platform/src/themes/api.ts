import type {
  ContributionAccessContext,
} from "../ui";

import type {
  ThemeContribution,
} from "./types";

import type {
  ThemeRegistry,
} from "./registry";

export const THEME_API_SERVICE_ID =
  "core.theme";

export class ThemeApi {
  constructor(
    private readonly registry:
      ThemeRegistry,
  ) {}

  register(
    theme:
      ThemeContribution,
  ) {
    return this.registry.register(
      theme,
    );
  }

  unregister(
    themeId: string,
  ) {
    return this.registry.unregister(
      themeId,
    );
  }

  get(
    themeId: string,
  ) {
    return this.registry.get(
      themeId,
    );
  }

  list() {
    return this.registry.list();
  }

  discover(
    themeId: string,
    context:
      ContributionAccessContext,
  ) {
    return this.registry.discover(
      themeId,
      context,
    );
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
  ) {
    return this.registry
      .listDiscoverable(
        context,
      );
  }
}
