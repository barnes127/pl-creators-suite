const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const {
  fileExists,
  writeJsonFileAtomic,
} = require("../../util/fs");

const {
  PROJECT_MANIFEST_NAME,
  ProjectFormatError,
} = require("./contract");

const {
  readProjectManifest,
  writeProjectManifest,
} = require("./persistence");

const JOURNAL_NAME = "pl-project.journal.json";
const CHECKSUM_NAME = "pl-project.checksums.json";

const {
  createPreDestructiveBackup,
} = require(
  "../project-platform/recovery/backup",
);

function sha256(data) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

async function checksumFile(filePath) {
  const data = await fs.readFile(filePath);
  return sha256(data);
}

async function writeProjectChecksums(projectRoot) {
  const manifestPath = path.join(
    projectRoot,
    PROJECT_MANIFEST_NAME,
  );

  if (!(await fileExists(manifestPath))) {
    throw new ProjectFormatError(
      "Cannot checksum project without manifest",
      "MISSING_MANIFEST",
    );
  }

  const checksumRecord = {
    schemaVersion: 1,
    algorithm: "sha256",
    generatedAt: new Date().toISOString(),
    files: {
      [PROJECT_MANIFEST_NAME]:
        await checksumFile(manifestPath),
    },
  };

  const checksumPath = path.join(
    projectRoot,
    CHECKSUM_NAME,
  );

  await writeJsonFileAtomic(
    checksumPath,
    checksumRecord,
  );

  return {
    checksumPath,
    checksumRecord,
  };
}

async function validateProjectChecksums(projectRoot) {
  const checksumPath = path.join(
    projectRoot,
    CHECKSUM_NAME,
  );

  if (!(await fileExists(checksumPath))) {
    return {
      valid: false,
      reason: "CHECKSUM_RECORD_MISSING",
      mismatches: [],
    };
  }

  let checksumRecord;

  try {
    checksumRecord = JSON.parse(
      await fs.readFile(
        checksumPath,
        "utf8",
      ),
    );
  } catch {
    throw new ProjectFormatError(
      "Project checksum record contains invalid JSON",
      "CORRUPT_CHECKSUM_RECORD",
    );
  }

  if (
    checksumRecord.algorithm !== "sha256" ||
    !checksumRecord.files ||
    typeof checksumRecord.files !== "object"
  ) {
    throw new ProjectFormatError(
      "Project checksum record is invalid",
      "INVALID_CHECKSUM_RECORD",
    );
  }

  const mismatches = [];

  for (const [relativePath, expected] of Object.entries(
    checksumRecord.files,
  )) {
    const targetPath = path.join(
      projectRoot,
      relativePath,
    );

    if (!(await fileExists(targetPath))) {
      mismatches.push({
        path: relativePath,
        reason: "MISSING_FILE",
      });

      continue;
    }

    const actual = await checksumFile(
      targetPath,
    );

    if (actual !== expected) {
      mismatches.push({
        path: relativePath,
        reason: "CHECKSUM_MISMATCH",
        expected,
        actual,
      });
    }
  }

  return {
    valid: mismatches.length === 0,
    reason:
      mismatches.length === 0
        ? null
        : "CHECKSUM_VALIDATION_FAILED",
    mismatches,
  };
}

async function writeProjectJournal(
  projectRoot,
  entry,
) {
  const journalPath = path.join(
    projectRoot,
    JOURNAL_NAME,
  );

  let journal = {
    schemaVersion: 1,
    entries: [],
  };

  if (await fileExists(journalPath)) {
    try {
      journal = JSON.parse(
        await fs.readFile(
          journalPath,
          "utf8",
        ),
      );
    } catch {
      throw new ProjectFormatError(
        "Project journal contains invalid JSON",
        "CORRUPT_JOURNAL",
      );
    }
  }

  if (!Array.isArray(journal.entries)) {
    throw new ProjectFormatError(
      "Project journal has invalid entries",
      "INVALID_JOURNAL",
    );
  }

  journal.entries.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  });

  await writeJsonFileAtomic(
    journalPath,
    journal,
  );

  return {
    journalPath,
    journal,
  };
}

async function inspectProjectIntegrity(projectRoot) {
  const manifestPath = path.join(
    projectRoot,
    PROJECT_MANIFEST_NAME,
  );

  const issues = [];

  if (!(await fileExists(manifestPath))) {
    issues.push({
      code: "MISSING_MANIFEST",
      repairable: false,
    });

    return {
      healthy: false,
      issues,
    };
  }

  try {
    await readProjectManifest(
      manifestPath,
    );
  } catch (error) {
    issues.push({
      code:
        error.code ||
        "MANIFEST_VALIDATION_FAILED",
      repairable:
        error.code ===
        "CORRUPT_MANIFEST",
    });
  }

  const checksumResult =
    await validateProjectChecksums(
      projectRoot,
    );

  if (!checksumResult.valid) {
    issues.push({
      code:
        checksumResult.reason,
      repairable:
        checksumResult.reason ===
        "CHECKSUM_RECORD_MISSING",
      details:
        checksumResult.mismatches,
    });
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}

async function repairProject(
  projectRoot,
  {
    restoreManifestBackup = false,
    rebuildChecksums = false,
  } = {},
) {
  const actions = [];

  const manifestPath = path.join(
    projectRoot,
    PROJECT_MANIFEST_NAME,
  );

  if (restoreManifestBackup) {

    await createPreDestructiveBackup({
      projectRoot,

      operation:
        "manifest repair",

      description:
        "Automatic backup before restoring the project manifest backup.",
    });

    const backupPath =
      `${manifestPath}.bak`;

    if (!(await fileExists(backupPath))) {
      throw new ProjectFormatError(
        "Manifest backup is not available",
        "MANIFEST_BACKUP_MISSING",
      );
    }

    const raw = await fs.readFile(
      backupPath,
      "utf8",
    );

    let backupManifest;

    try {
      backupManifest = JSON.parse(raw);
    } catch {
      throw new ProjectFormatError(
        "Manifest backup is corrupt",
        "CORRUPT_MANIFEST_BACKUP",
      );
    }

    await writeProjectManifest(
      manifestPath,
      backupManifest,
    );

    actions.push(
      "RESTORED_MANIFEST_BACKUP",
    );
  }

  if (rebuildChecksums) {
    await writeProjectChecksums(
      projectRoot,
    );

    actions.push(
      "REBUILT_CHECKSUMS",
    );
  }

  return {
    repaired: actions.length > 0,
    actions,
  };
}

module.exports = {
  JOURNAL_NAME,
  CHECKSUM_NAME,
  sha256,
  checksumFile,
  writeProjectChecksums,
  validateProjectChecksums,
  writeProjectJournal,
  inspectProjectIntegrity,
  repairProject,
};
