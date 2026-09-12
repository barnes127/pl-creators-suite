import {
  assertContributionAccess,
} from "./access";

import type {
  ContributionAccessContext,
} from "./access";

import type {
  UiContribution,
  UiContributionKind,
} from "./types";

export class UiContributionRegistry {
  private readonly contributions =
    new Map<
      string,
      UiContribution
    >();

  register(
    contribution:
      UiContribution,
  ) {
    const id =
      contribution.id.trim();

    if (!id) {
      throw new Error(
        "UI contribution ID is required.",
      );
    }

    if (
      this.contributions.has(
        id,
      )
    ) {
      throw new Error(
        `UI contribution already registered: ${id}`,
      );
    }

    const normalized:
      UiContribution = {
        ...contribution,

        id,

        requiredPermissions:
          contribution
            .requiredPermissions ??
          [],

        requiredCapabilities:
          contribution
            .requiredCapabilities ??
          [],
      };

    this.contributions.set(
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
    contributionId: string,
  ) {
    return this.contributions
      .delete(
        contributionId,
      );
  }

  get(
    contributionId: string,
  ) {
    return this.contributions
      .get(
        contributionId,
      );
  }

  list(
    kind?:
      UiContributionKind,
  ) {
    return Array
      .from(
        this.contributions
          .values(),
      )
      .filter(
        (
          contribution,
        ) =>
          !kind ||
          contribution.kind ===
            kind,
      )
      .sort(
        (
          left,
          right,
        ) =>
          (
            left.order ??
            0
          ) -
          (
            right.order ??
            0
          ) ||
          left.title.localeCompare(
            right.title,
          ),
      );
  }

  discover(
    contributionId: string,
    context:
      ContributionAccessContext,
  ) {
    const contribution =
      this.contributions.get(
        contributionId,
      );

    if (!contribution) {
      return undefined;
    }

    assertContributionAccess(
      contribution.id,
      contribution,
      context,
    );

    return contribution;
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
    kind?:
      UiContributionKind,
  ) {
    return this
      .list(
        kind,
      )
      .filter(
        (
          contribution,
        ) => {
          try {
            assertContributionAccess(
              contribution.id,
              contribution,
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
