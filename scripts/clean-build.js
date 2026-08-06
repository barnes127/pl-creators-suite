const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");

const targets = [
  "apps/renderer/dist",
  "release",
];

let removedCount = 0;

for (const relativePath of targets) {
  const absolutePath = path.join(repositoryRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    console.log(`SKIP    ${relativePath} does not exist`);
    continue;
  }

  fs.rmSync(absolutePath, {
    recursive: true,
    force: true,
  });

  console.log(`REMOVED ${relativePath}`);
  removedCount += 1;
}

console.log(
  `Clean complete. Removed ${removedCount} generated path(s).`,
);
