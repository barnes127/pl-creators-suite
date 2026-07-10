import {
  BUILT_IN_WORKFLOW_TEMPLATES,
  getWorkflowTemplateById,
  type WorkflowTemplate,
  type WorkflowTemplateCategory,
} from "./templates";

export type WorkflowPackKind =
  | "core"
  | "slice"
  | "multi-slice"
  | "marketplace"
  | "custom";

export type WorkflowPackPricingKind = "free" | "paid" | "subscription";

export type WorkflowPack = {
  id: string;
  name: string;
  description: string;
  kind: WorkflowPackKind;
  pricingKind: WorkflowPackPricingKind;
  version: number;
  categories: WorkflowTemplateCategory[];
  templateIds: string[];
  tags: string[];
  author: string;
  marketplaceReady: boolean;
};

export type WorkflowPackWithTemplates = WorkflowPack & {
  templates: WorkflowTemplate[];
};

export const BUILT_IN_WORKFLOW_PACKS: WorkflowPack[] = [
  {
    id: "core-workflow-starters",
    name: "Core Workflow Starters",
    description:
      "Free starter workflows for manual checks, save checks, and export checks.",
    kind: "core",
    pricingKind: "free",
    version: 1,
    categories: ["project", "quality", "export"],
    templateIds: [
      "manual-project-check",
      "on-save-quality-check",
      "on-export-package-check",
    ],
    tags: ["free", "starter", "core"],
    author: "Praecursor Labs",
    marketplaceReady: true,
  },
  {
    id: "creator-slice-workflows",
    name: "Creator Slice Workflows",
    description:
      "Starter workflows for Docs, Games, and Assets slices with room to expand into workflow packs.",
    kind: "multi-slice",
    pricingKind: "free",
    version: 1,
    categories: ["docs", "games", "assets"],
    templateIds: [
      "docs-save-log",
      "game-preview-preflight",
      "asset-organization-pass",
    ],
    tags: ["free", "multi-slice", "creator"],
    author: "Praecursor Labs",
    marketplaceReady: true,
  },
];

export function getWorkflowPackById(
  packId: string,
  packs = BUILT_IN_WORKFLOW_PACKS
): WorkflowPack | null {
  return packs.find((pack) => pack.id === packId) ?? null;
}

export function getWorkflowPackTemplates(
  pack: WorkflowPack,
  templates = BUILT_IN_WORKFLOW_TEMPLATES
): WorkflowTemplate[] {
  return pack.templateIds
    .map((templateId) => getWorkflowTemplateById(templateId, templates))
    .filter((template): template is WorkflowTemplate => Boolean(template));
}

export function hydrateWorkflowPack(
  pack: WorkflowPack,
  templates = BUILT_IN_WORKFLOW_TEMPLATES
): WorkflowPackWithTemplates {
  return {
    ...pack,
    templates: getWorkflowPackTemplates(pack, templates),
  };
}

export function listWorkflowPacksByKind(
  kind: WorkflowPackKind,
  packs = BUILT_IN_WORKFLOW_PACKS
): WorkflowPack[] {
  return packs.filter((pack) => pack.kind === kind);
}

export function listMarketplaceReadyWorkflowPacks(
  packs = BUILT_IN_WORKFLOW_PACKS
): WorkflowPack[] {
  return packs.filter((pack) => pack.marketplaceReady);
}

export function searchWorkflowPacks(
  query: string,
  packs = BUILT_IN_WORKFLOW_PACKS
): WorkflowPack[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return packs;
  }

  return packs.filter((pack) => {
    const haystack = [
      pack.id,
      pack.name,
      pack.description,
      pack.kind,
      pack.pricingKind,
      pack.author,
      ...pack.categories,
      ...pack.tags,
      ...pack.templateIds,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
