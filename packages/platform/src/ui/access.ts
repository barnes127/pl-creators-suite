export interface ContributionAccessContext {
  requesterId: string;

  permissions:
    ReadonlySet<string>;

  capabilities?:
    ReadonlySet<string>;
}

export interface ContributionRequirements {
  requiredPermissions?:
    readonly string[];

  requiredCapabilities?:
    readonly string[];
}

export class ContributionPermissionError
  extends Error {
  readonly code =
    "CONTRIBUTION_PERMISSION_REQUIRED";

  constructor(
    contributionId: string,
    permission: string,
  ) {
    super(
      `Contribution ${contributionId} requires permission: ${permission}`,
    );

    this.name =
      "ContributionPermissionError";
  }
}

export class ContributionCapabilityError
  extends Error {
  readonly code =
    "CONTRIBUTION_CAPABILITY_REQUIRED";

  constructor(
    contributionId: string,
    capability: string,
  ) {
    super(
      `Contribution ${contributionId} requires capability: ${capability}`,
    );

    this.name =
      "ContributionCapabilityError";
  }
}

export function assertContributionAccess(
  contributionId: string,
  requirements:
    ContributionRequirements,
  context:
    ContributionAccessContext,
) {
  for (
    const permission
    of requirements
      .requiredPermissions ??
    []
  ) {
    if (
      !context.permissions.has(
        permission,
      )
    ) {
      throw new ContributionPermissionError(
        contributionId,
        permission,
      );
    }
  }

  for (
    const capability
    of requirements
      .requiredCapabilities ??
    []
  ) {
    if (
      !context
        .capabilities
        ?.has(
          capability,
        )
    ) {
      throw new ContributionCapabilityError(
        contributionId,
        capability,
      );
    }
  }
}
