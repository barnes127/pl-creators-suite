const fs = require("fs/promises");
const path = require("path");

const DEFAULT_EXTENSION = ".txt";

const EXTENSION_LANGUAGE_MAP = {
  ".js": "JavaScript",
  ".jsx": "JavaScript React",
  ".ts": "TypeScript",
  ".tsx": "TypeScript React",
  ".py": "Python",
  ".json": "JSON",
  ".md": "Markdown",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".c": "C",
  ".cpp": "C++",
  ".h": "C/C++ Header",
  ".hpp": "C++ Header",
  ".rs": "Rust",
  ".go": "Go",
  ".java": "Java",
  ".cs": "C#",
  ".sh": "Shell",
  ".yml": "YAML",
  ".yaml": "YAML",
  ".toml": "TOML",
};

function cleanProjectRoot(projectRoot) {
  const root = String(projectRoot || "").trim();
  if (!root) throw new Error("projectRoot is required");
  return root;
}

function getCodeDir(projectRoot) {
  return path.join(cleanProjectRoot(projectRoot), "code");
}

function safeCodeFileName(name) {
  const clean = String(name || "").trim();

  if (!clean) throw new Error("Code file name is required");

  if (clean.includes("..") || clean.includes("/") || clean.includes("\\")) {
    throw new Error("Code file name must be a simple filename");
  }

  return path.extname(clean) ? clean : `${clean}${DEFAULT_EXTENSION}`;
}

function detectLanguage(fileName) {
  const ext = path.extname(String(fileName || "").toLowerCase());
  return EXTENSION_LANGUAGE_MAP[ext] || "Plain Text";
}

function getDefaultContent(fileName) {
  const language = detectLanguage(fileName);

  if (language === "Python") {
    return `def main():\n    print("Hello from ${fileName}")\n\n\nif __name__ == "__main__":\n    main()\n`;
  }

  if (language === "JavaScript" || language === "TypeScript") {
    return `console.log("Hello from ${fileName}");\n`;
  }

  if (language === "JSON") {
    return `{\n  "name": "${fileName}"\n}\n`;
  }

  if (language === "Markdown") {
    return `# ${fileName.replace(/\.md$/, "")}\n\nStart writing here.\n`;
  }

  if (language === "HTML") {
    return `<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <title>${fileName}</title>\n  </head>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>\n`;
  }

  return "";
}

async function ensureCodeStorage(projectRoot) {
  const codeDir = getCodeDir(projectRoot);
  await fs.mkdir(codeDir, { recursive: true });

  return { codeDir };
}

async function listCodeFiles(params) {
  const codeDir = getCodeDir(params?.projectRoot);
  await ensureCodeStorage(params?.projectRoot);

  const entries = await fs.readdir(codeDir, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      name: entry.name,
      path: path.join(codeDir, entry.name),
      language: detectLanguage(entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { files };
}

async function createCodeFile(params) {
  const codeDir = getCodeDir(params?.projectRoot);
  await ensureCodeStorage(params?.projectRoot);

  const name = safeCodeFileName(params?.name || "untitled.txt");
  const filePath = path.join(codeDir, name);
  const content = getDefaultContent(name);

  try {
    await fs.writeFile(filePath, content, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Code file already exists: ${name}`);
    }

    throw error;
  }

  return {
    name,
    path: filePath,
    language: detectLanguage(name),
    content,
  };
}

async function readCodeFile(params) {
  const codeDir = getCodeDir(params?.projectRoot);
  const name = safeCodeFileName(params?.name);
  const filePath = path.join(codeDir, name);

  const content = await fs.readFile(filePath, "utf8");

  return {
    name,
    path: filePath,
    language: detectLanguage(name),
    content,
  };
}

async function saveCodeFile(params) {
  const codeDir = getCodeDir(params?.projectRoot);
  await ensureCodeStorage(params?.projectRoot);

  const name = safeCodeFileName(params?.name);
  const content = String(params?.content || "");

  const filePath = path.join(codeDir, name);
  const tmpPath = `${filePath}.tmp`;

  await fs.writeFile(tmpPath, content, "utf8");
  await fs.rename(tmpPath, filePath);

  return {
    name,
    path: filePath,
    language: detectLanguage(name),
    content,
  };
}

module.exports = {
  getCodeDir,
  ensureCodeStorage,
  listCodeFiles,
  createCodeFile,
  readCodeFile,
  saveCodeFile,
  detectLanguage,
};
