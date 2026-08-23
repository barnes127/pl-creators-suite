const fs = require("fs");
const path = require("path");

const {
  METHOD_CONTRACTS,
  derivePermissions,
} = require(
  "../apps/desktop/rpc/contracts",
);


const repoRoot =
  path.resolve(
    __dirname,
    "..",
  );

const outputDir =
  path.join(
    repoRoot,
    "docs",
    "architecture",
  );

const outputPath =
  path.join(
    outputDir,
    "RPC_INVENTORY.md",
  );


function yesNo(value) {
  return value
    ? "Yes"
    : "No";
}


function formatList(values) {
  if (
    !values ||
    values.length === 0
  ) {
    return "none";
  }

  return values.join(", ");
}


const methods =
  Object.entries(
    METHOD_CONTRACTS,
  )
    .sort(
      ([a], [b]) =>
        a.localeCompare(b),
    );


const rows =
  methods.map(
    ([method, contract]) => {
      const permissions =
        derivePermissions(
          contract,
        );

      return (
        `| \`${method}\` ` +
        `| ${yesNo(contract.mutates)} ` +
        `| ${yesNo(contract.retryable)} ` +
        `| ${yesNo(contract.supportsCancellation)} ` +
        `| ${yesNo(contract.maxAttempts || 1)} ` +
        `| ${formatList(contract.trust)} ` +
        `| ${formatList(permissions)} |`
      );
    },
  );


const content = [
  "# PL Creators Suite RPC Inventory",
  "",
  "Generated from `apps/desktop/rpc/contracts.js`.",
  "",
  `Total registered contracts: ${methods.length}`,
  "",
  "## Contract Rules",
  "",
  "- Every active renderer-to-main RPC method must have exactly one registered contract.",
  "- Parameters are validated before the handler executes.",
  "- Mutating operations are not automatically retryable.",
  "- Trust categories document privileged boundaries touched by a method.",
  "- Permission labels describe the authority required by that method.",
  "- A method contract describes authority; it does not itself grant authority.",
  "",
  "## Methods",
  "",
  "| Method | Mutates | Retryable | Cancellable | Attempts | Trust boundaries | Required permissions |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...rows,
  "",
  "## Current Transport",
  "",
  "- Renderer requests are sent to the Electron-owned loopback RPC server.",
  "- The server binds to `127.0.0.1`.",
  "- Requests require the per-session RPC token.",
  "- Request bodies are bounded.",
  "- RPC errors are normalized and correlated with request IDs.",
  "",
  "## Current Limitations",
  "",
  "- Cancellation and progress are standardized in the next Wave 1.1.4 batch.",
  "- Retry metadata exists, but automatic retry execution is not enabled.",
  "- The RPC session token is currently delivered to the renderer through its startup URL.",
  "- Long-running mutating calls are intentionally not protected by Promise.race timeouts because timeout alone does not cancel the underlying mutation.",
  "",
];

fs.mkdirSync(
  outputDir,
  {
    recursive: true,
  },
);

fs.writeFileSync(
  outputPath,
  `${content.join("\n")}\n`,
  "utf8",
);

console.log(
  `RPC inventory written: ${outputPath}`,
);

console.log(
  `RPC contracts documented: ${methods.length}`,
);
