const fs =
  require("fs/promises");


const {
  ensureDir,
  writeJsonFileAtomic,
} = require(
  "../../../util/fs",
);


const {
  RECOVERY_SCHEMA_VERSION,
} = require(
  "./constants",
);


const {
  getAutosaveDir,
  getAutosavePath,
} = require(
  "./paths",
);


const {
  RecoveryDataError,
} = require(
  "./errors",
);

function createAutosaveId(
  resourceId,
) {
  return [
    "autosave",
    resourceId,
    Date.now(),
  ].join(
    "-",
  );
}


async function writeAutosave(
  params = {},
) {
  const projectRoot =
    String(
      params.projectRoot ||
      "",
    ).trim();


  const resourceId =
    String(
      params.resourceId ||
      "",
    ).trim();


  if (
    !projectRoot
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  if (
    !resourceId
  ) {
    throw new Error(
      "resourceId is required",
    );
  }


  const autosavePath =
    getAutosavePath(
      projectRoot,
      resourceId,
    );


  await ensureDir(
    getAutosaveDir(
      projectRoot,
    ),
  );


  let createdAt =
    new Date()
      .toISOString();


  try {
    const existing =
      JSON.parse(
        await fs.readFile(
          autosavePath,
          "utf8",
        ),
      );


    if (
      existing.createdAt
    ) {
      createdAt =
        existing.createdAt;
    }
  } catch (
    error
  ) {
    if (
      error?.code !==
      "ENOENT" &&
      !(error instanceof SyntaxError)
    ) {
      throw error;
    }
  }


  const record = {
    schemaVersion:
      RECOVERY_SCHEMA_VERSION,

    id:
      createAutosaveId(
        resourceId,
      ),

    projectRoot,

    resourceId,

    createdAt,

    updatedAt:
      new Date()
        .toISOString(),

    sourceUpdatedAt:
      params.sourceUpdatedAt ??
      null,

    payload:
      params.payload,
  };


  await writeJsonFileAtomic(
    autosavePath,
    record,
  );


  return record;
}


async function readAutosave(
  params = {},
) {
  const autosavePath =
    getAutosavePath(
      params.projectRoot,
      params.resourceId,
    );


  let raw;


  try {
    raw =
      await fs.readFile(
        autosavePath,
        "utf8",
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return null;
    }


    throw error;
  }


  try {
    return JSON.parse(
      raw,
    );
  } catch {
    throw new RecoveryDataError(
      `Autosave contains invalid JSON: ${params.resourceId}`,
      "CORRUPT_AUTOSAVE",
      {
        resourceId:
          params.resourceId,
      },
    );
  }

  return JSON.parse(
    raw,
  );
}


async function deleteAutosave(
  params = {},
) {
  const autosavePath =
    getAutosavePath(
      params.projectRoot,
      params.resourceId,
    );


  await fs.rm(
    autosavePath,
    {
      force:
        true,
    },
  );


  return true;
}


async function listAutosaves(
  projectRoot,
) {
  const directory =
    getAutosaveDir(
      projectRoot,
    );

  let names;

  try {
    names =
      await fs.readdir(
        directory,
      );
  } catch (
    error
  ) {
    if (
      error?.code ===
      "ENOENT"
    ) {
      return [];
    }

    throw error;
  }

  const records =
    [];

  for (
    const name
    of names
  ) {
    if (
      !name.endsWith(
        ".json",
      )
    ) {
      continue;
    }

    const raw =
      await fs.readFile(
        require("path").join(
          directory,
          name,
        ),
        "utf8",
      );

    let parsed;

    try {
      parsed =
        JSON.parse(
          raw,
        );
    } catch {
      throw new RecoveryDataError(
        `Autosave contains invalid JSON: ${name}`,
        "CORRUPT_AUTOSAVE",
        {
          fileName:
            name,
        },
      );
    }

    records.push(
      parsed,
    );
  }

  return records.sort(
    (
      left,
      right,
    ) =>
      String(
        right.updatedAt ||
        "",
      ).localeCompare(
        String(
          left.updatedAt ||
          "",
        ),
      ),
  );
}

module.exports = {
  createAutosaveId,
  writeAutosave,
  readAutosave,
  deleteAutosave,
  listAutosaves,
};
