const constants =
  require(
    "./constants",
  );


const paths =
  require(
    "./paths",
  );


const storage =
  require(
    "./storage",
  );


const autosave =
  require(
    "./autosave",
  );


const journal =
  require(
    "./journal",
  );


const session =
  require(
    "./session",
  );


const status =
  require(
    "./status",
  );


const snapshots =
  require(
    "./snapshots",
  );


const compare =
  require(
    "./compare",
  );


const restore =
  require(
    "./restore",
  );


const retention =
  require(
    "./retention",
  );

const errors =
  require(
    "./errors",
  );


const backup =
  require(
    "./backup",
  );

module.exports = {
  ...constants,
  ...paths,
  ...storage,
  ...autosave,
  ...journal,
  ...session,
  ...status,
  ...snapshots,
  ...compare,
  ...restore,
  ...retention,
  ...errors,
  ...backup,
};
