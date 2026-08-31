const {
  createProjectSnapshot,
} = require(
  "./snapshots",
);


const {
  applySnapshotRetention,
} = require(
  "./retention",
);


async function createPreDestructiveBackup(
  params = {},
) {
  const projectRoot =
    String(
      params.projectRoot ||
      "",
    ).trim();


  const operation =
    String(
      params.operation ||
      "operation",
    ).trim();


  if (
    !projectRoot
  ) {
    throw new Error(
      "projectRoot is required",
    );
  }


  const backup =
    await createProjectSnapshot({
      projectRoot,

      kind:
        "snapshot",

      name:
        `Pre-operation backup: ${operation}`,

      description:
        params.description ??
        `Automatic safety backup before ${operation}.`,
    });


  await applySnapshotRetention(
    projectRoot,
  );


  return backup;
}


async function runPreDestructiveOperation(
  params,
  operation,
) {
  if (
    typeof operation !==
    "function"
  ) {
    throw new Error(
      "operation callback is required",
    );
  }


  const backup =
    await createPreDestructiveBackup(
      params,
    );


  try {
    const result =
      await operation(
        backup,
      );


    return {
      backup,
      result,
    };
  } catch (
    error
  ) {
    error.preDestructiveBackupId =
      backup.id;


    throw error;
  }
}


module.exports = {
  createPreDestructiveBackup,
  runPreDestructiveOperation,
};
