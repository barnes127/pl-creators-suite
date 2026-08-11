const fs = require("fs");
const path = require("path");

const REGISTRY_DIR = path.resolve(
  process.cwd(),
  "docs/capabilities/registry",
);

const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "docs/capabilities/TRACEABILITY.md",
);

const files = fs
  .readdirSync(REGISTRY_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort();

const capabilities = [];

for (const file of files) {
  const fullPath = path.join(REGISTRY_DIR, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  for (const capability of data.capabilities) {
    capabilities.push({
      ...capability,
      registryFile: file,
    });
  }
}

capabilities.sort((a, b) => a.id.localeCompare(b.id));

const statusCounts = {};
const milestoneCounts = {};
const domainCounts = {};

for (const capability of capabilities) {
  statusCounts[capability.status] =
    (statusCounts[capability.status] || 0) + 1;

  milestoneCounts[capability.targetMilestone] =
    (milestoneCounts[capability.targetMilestone] || 0) + 1;

  domainCounts[capability.slice] =
    (domainCounts[capability.slice] || 0) + 1;
}

const lines = [];

lines.push("# PL Creators Suite Capability Traceability Report");
lines.push("");
lines.push(
  "Generated from the authoritative capability registry under `docs/capabilities/registry/`.",
);
lines.push("");
lines.push(
  "This report is the Wave 1.1.2 no-omission traceability snapshot for the Official Version 1 development blueprint.",
);
lines.push("");
lines.push("## Registry Summary");
lines.push("");
lines.push(`- Total capabilities: ${capabilities.length}`);
lines.push(`- Registry files: ${files.length}`);
lines.push("");

lines.push("### Status");
lines.push("");

for (const key of Object.keys(statusCounts).sort()) {
  lines.push(`- ${key}: ${statusCounts[key]}`);
}

lines.push("");
lines.push("### Milestones");
lines.push("");

for (const key of Object.keys(milestoneCounts).sort((a, b) => {
  const parse = (value) => {
    const parts = value.replace(/^v/, "").split(".");
    return [
      Number(parts[0] || 0),
      Number(parts[1] || 0),
      Number(parts[2] || 0),
    ];
  };

  const av = parse(a);
  const bv = parse(b);

  for (let i = 0; i < 3; i += 1) {
    if (av[i] !== bv[i]) {
      return av[i] - bv[i];
    }
  }

  return a.localeCompare(b);
})) {
  lines.push(`- ${key}: ${milestoneCounts[key]}`);
}

lines.push("");
lines.push("### Domains");
lines.push("");

for (const key of Object.keys(domainCounts).sort()) {
  lines.push(`- ${key}: ${domainCounts[key]}`);
}

lines.push("");
lines.push("## Capability Traceability");
lines.push("");
lines.push(
  "| Capability ID | Domain | Area | Status | Milestone | Registry | Implementation | Validation | Dependencies |",
);
lines.push(
  "|---|---|---|---|---|---|---|---|---|",
);

for (const capability of capabilities) {
  const implementation =
    capability.implementation?.length > 0
      ? capability.implementation.join("<br>")
      : "—";

  const validation =
    capability.validation?.length > 0
      ? capability.validation.join("<br>")
      : "—";

  const dependencies =
    capability.blockedBy?.length > 0
      ? capability.blockedBy.join("<br>")
      : "—";

  lines.push(
    `| ${capability.id} | ${capability.slice} | ${capability.area} | ${capability.status} | ${capability.targetMilestone} | ${capability.registryFile} | ${implementation} | ${validation} | ${dependencies} |`,
  );
}

lines.push("");
lines.push("## Traceability Gaps");
lines.push("");

const missingImplementation = capabilities.filter(
  (capability) =>
    !capability.implementation ||
    capability.implementation.length === 0,
);

const missingValidation = capabilities.filter(
  (capability) =>
    !capability.validation ||
    capability.validation.length === 0,
);

lines.push(
  `- Capabilities without implementation links: ${missingImplementation.length}`,
);
lines.push(
  `- Capabilities without validation links: ${missingValidation.length}`,
);
lines.push("");
lines.push(
  "Missing implementation or validation links are expected for future milestone capabilities that have not entered active development yet. They must be populated as those capabilities move into implementation.",
);
lines.push("");

fs.writeFileSync(
  OUTPUT_FILE,
  `${lines.join("\n")}\n`,
  "utf8",
);

console.log(
  `Capability traceability report generated: ${capabilities.length} capabilities across ${files.length} registry file(s).`,
);
console.log(`Output: ${OUTPUT_FILE}`);
