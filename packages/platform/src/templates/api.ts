import type {
  ContributionAccessContext,
} from "../ui";

import type {
  TemplateContribution,
  TemplateKind,
} from "./types";

import type {
  TemplateRegistry,
} from "./registry";

export const TEMPLATE_API_SERVICE_ID =
  "core.template";

export class TemplateApi {
  constructor(
    private readonly registry:
      TemplateRegistry,
  ) {}

  register(
    template:
      TemplateContribution,
  ) {
    return this.registry.register(
      template,
    );
  }

  unregister(
    templateId: string,
  ) {
    return this.registry.unregister(
      templateId,
    );
  }

  get(
    templateId: string,
  ) {
    return this.registry.get(
      templateId,
    );
  }

  list(
    kind?:
      TemplateKind,
  ) {
    return this.registry.list(
      kind,
    );
  }

  discover(
    templateId: string,
    context:
      ContributionAccessContext,
  ) {
    return this.registry.discover(
      templateId,
      context,
    );
  }

  listDiscoverable(
    context:
      ContributionAccessContext,
    kind?:
      TemplateKind,
  ) {
    return this.registry
      .listDiscoverable(
        context,
        kind,
      );
  }
}
