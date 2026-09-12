import type {
  ContributionAccessContext,
} from "./access";

import type {
  UiContribution,
  UiContributionKind,
} from "./types";

import type {
  UiContributionRegistry,
} from "./registry";

export const UI_API_SERVICE_ID =
  "core.ui";

export class UiApi {
  constructor(
    private readonly registry:
      UiContributionRegistry,
  ) {}

  register(
    contribution:
      UiContribution,
  ) {
    return this.registry.register(
      contribution,
    );
  }

  unregister(
    contributionId: string,
  ) {
    return this.registry.unregister(
      contributionId,
    );
  }

  get(
    contributionId: string,
  ) {
    return this.registry.get(
      contributionId,
    );
  }

  list(
    kind?:
      UiContributionKind,
  ) {
    return this.registry.list(
      kind,
    );
  }

  discover(
    contributionId: string,
    context:
      ContributionAccessContext,
  ) {
    return this.registry.discover(
      contributionId,
      context,
    );
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
    kind?:
      UiContributionKind,
  ) {
    return this.registry
      .listDiscoverable(
        context,
        kind,
      );
  }
}
