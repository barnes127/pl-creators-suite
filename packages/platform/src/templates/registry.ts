import {
  assertContributionAccess,
} from "../ui";

import type {
  ContributionAccessContext,
} from "../ui";

import type {
  TemplateContribution,
  TemplateKind,
} from "./types";

export class TemplateRegistry {
  private readonly templates =
    new Map<
      string,
      TemplateContribution
    >();

  register(
    template:
      TemplateContribution,
  ) {
    const id =
      template.id.trim();

    if (!id) {
      throw new Error(
        "Template ID is required.",
      );
    }

    if (
      this.templates.has(
        id,
      )
    ) {
      throw new Error(
        `Template already registered: ${id}`,
      );
    }

    const normalized:
      TemplateContribution = {
        ...template,

        id,

        requiredPermissions:
          template
            .requiredPermissions ??
          [],

        requiredCapabilities:
          template
            .requiredCapabilities ??
          [],
      };

    this.templates.set(
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
    templateId: string,
  ) {
    return this.templates.delete(
      templateId,
    );
  }

  get(
    templateId: string,
  ) {
    return this.templates.get(
      templateId,
    );
  }

  list(
    kind?:
      TemplateKind,
  ) {
    return Array
      .from(
        this.templates.values(),
      )
      .filter(
        (
          template,
        ) =>
          !kind ||
          template.kind ===
            kind,
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
    templateId: string,
    context:
      ContributionAccessContext,
  ) {
    const template =
      this.templates.get(
        templateId,
      );

    if (!template) {
      return undefined;
    }

    assertContributionAccess(
      template.id,
      template,
      context,
    );

    return template;
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
    kind?:
      TemplateKind,
  ) {
    return this
      .list(
        kind,
      )
      .filter(
        (
          template,
        ) => {
          try {
            assertContributionAccess(
              template.id,
              template,
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
