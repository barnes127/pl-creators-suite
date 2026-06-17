const fs = require("fs/promises");
const path = require("path");

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getDocsDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "docs");
}

function safeDocName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Document name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Document name must be a simple filename");
  }

  return clean.endsWith(".md") ? clean : `${clean}.md`;
}

async function ensureDocsStorage(projectRoot) {
  const docsDir = getDocsDir(projectRoot);
  await fs.mkdir(docsDir, { recursive: true });

  return { docsDir };
}

async function listDocs(params) {
  const docsDir = getDocsDir(params?.projectRoot);
  await ensureDocsStorage(params?.projectRoot);

  const entries = await fs.readdir(docsDir, { withFileTypes: true });

  const docs = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => ({
      name: entry.name,
      path: path.join(docsDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { docs };
}

async function createDoc(params) {
  const docsDir = getDocsDir(params?.projectRoot);
  await ensureDocsStorage(params?.projectRoot);

  const name = safeDocName(params?.name || "untitled.md");
  const docPath = path.join(docsDir, name);

  const initialContent = `# ${name.replace(/\.md$/, "")}

Start writing here.
`;

  try {
    await fs.writeFile(docPath, initialContent, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Document already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: docPath,
    content: initialContent,
  };
}

async function readDoc(params) {
  const docsDir = getDocsDir(params?.projectRoot);
  const name = safeDocName(params?.name);
  const docPath = path.join(docsDir, name);

  const content = await fs.readFile(docPath, "utf8");

  return {
    name,
    path: docPath,
    content,
  };
}

async function saveDoc(params) {
  const docsDir = getDocsDir(params?.projectRoot);
  await ensureDocsStorage(params?.projectRoot);

  const name = safeDocName(params?.name);
  const content = String(params?.content || "");

  const docPath = path.join(docsDir, name);
  const tmpPath = `${docPath}.tmp`;

  await fs.writeFile(tmpPath, content, "utf8");
  await fs.rename(tmpPath, docPath);

  return {
    name,
    path: docPath,
    content,
  };
}

module.exports = {
  getDocsDir,
  ensureDocsStorage,
  listDocs,
  createDoc,
  readDoc,
  saveDoc,
};
