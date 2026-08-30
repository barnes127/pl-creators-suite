import {
  createHistoryAdapter,
  createHistoryTransaction,
  HistoryManager,
} from "../packages/platform/src/history/index";

function assertEqual(
  actual: unknown,
  expected: unknown,
  message:
    string,
) {
  if (
    actual !==
    expected
  ) {
    throw new Error(
      `${message}: expected ${String(expected)}, received ${String(actual)}`,
    );
  }
}

async function main() {
  let state =
    0;


  const history =
    new HistoryManager(
      createHistoryAdapter(
        () =>
          state,

        (
          nextState:
            number,
        ) => {
          state =
            nextState;
        },
      ),
    );


  state =
    1;


  history.push(
    createHistoryTransaction({
      label:
        "Set 1",

      before:
        0,

      after:
        1,
    }),
  );


  state =
    2;


  history.push(
    createHistoryTransaction({
      label:
        "Set 2",

      before:
        1,

      after:
        2,
    }),
  );


  assertEqual(
    history.canUndo(),
    true,
    "history can undo",
  );


  await history.undo();


  assertEqual(
    state,
    1,
    "undo restores previous state",
  );


  assertEqual(
    history.canRedo(),
    true,
    "history can redo",
  );


  await history.redo();


  assertEqual(
    state,
    2,
    "redo restores next state",
  );


  await history.undo();


  state =
    3;


  history.push(
    createHistoryTransaction({
      label:
        "Branch edit",

      before:
        1,

      after:
        3,
    }),
  );


  assertEqual(
    history.canRedo(),
    false,
    "branch edit discards redo history",
  );


  assertEqual(
    history
      .getState()
      .branchWarning,
    true,
    "branch edit exposes warning",
  );


  history.clear();


  assertEqual(
    history
      .getState()
      .length,
    0,
    "history clear removes transactions",
  );


  console.log(
    "PASS    shared history undo/redo behavior",
  );

  console.log(
    "PASS    branch edit discards redo history",
  );

  console.log(
    "PASS    branch warning is exposed",
  );

  console.log(
    "PASS    history clear resets state",
  );
}


main().catch(
  (
    error,
  ) => {
    console.error(
      error,
    );

    throw error;
  },
);
