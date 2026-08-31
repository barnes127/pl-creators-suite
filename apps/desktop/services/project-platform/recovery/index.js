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


module.exports = {
  ...constants,
  ...paths,
  ...storage,
  ...autosave,
  ...journal,
  ...session,
  ...status,
};
