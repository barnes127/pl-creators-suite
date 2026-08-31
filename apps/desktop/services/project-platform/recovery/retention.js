const {
  DEFAULT_MAX_SNAPSHOTS,
} = require(
  "./constants",
);


const {
  listProjectSnapshots,
  deleteProjectSnapshot,
} = require(
  "./snapshots",
);


async function applySnapshotRetention(
  projectRoot,
  policy = {},
) {
  const maxSnapshots =
    Number.isInteger(
      policy.maxSnapshots,
    ) &&
    policy.maxSnapshots >=
      0
      ? policy.maxSnapshots
      : DEFAULT_MAX_SNAPSHOTS;


  const keepCheckpoints =
    policy.keepCheckpoints !==
      false;


  const snapshots =
    await listProjectSnapshots(
      projectRoot,
    );


  const automatic =
    snapshots.filter(
      (
        snapshot,
      ) =>
        snapshot.kind !==
        "checkpoint",
    );


  const checkpoints =
    snapshots.filter(
      (
        snapshot,
      ) =>
        snapshot.kind ===
        "checkpoint",
    );


  const removals =
    automatic.slice(
      maxSnapshots,
    );


  if (
    !keepCheckpoints
  ) {
    const allowedCheckpointCount =
      Math.max(
        0,
        maxSnapshots -
        automatic.length,
      );


    removals.push(
      ...checkpoints.slice(
        allowedCheckpointCount,
      ),
    );
  }


  const uniqueRemovals =
    [
      ...new Map(
        removals.map(
          (
            snapshot,
          ) => [
            snapshot.id,
            snapshot,
          ],
        ),
      ).values(),
    ];


  for (
    const snapshot
    of uniqueRemovals
  ) {
    await deleteProjectSnapshot(
      projectRoot,
      snapshot.id,
    );
  }


  return {
    retained:
      (
        await listProjectSnapshots(
          projectRoot,
        )
      ).map(
        (
          snapshot,
        ) =>
          snapshot.id,
      ),

    removed:
      uniqueRemovals.map(
        (
          snapshot,
        ) =>
          snapshot.id,
      ),
  };
}


module.exports = {
  applySnapshotRetention,
};
