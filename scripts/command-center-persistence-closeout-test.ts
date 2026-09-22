declare const process: {exitCode?: number};
const storage =
  new Map<
    string,
    string
  >();


(globalThis as any).window = {
  localStorage: {
    getItem(
      key:
        string,
    ) {
      return storage.get(
        key,
      ) ??
        null;
    },

    setItem(
      key:
        string,
      value:
        string,
    ) {
      storage.set(
        key,
        value,
      );
    },

    removeItem(
      key:
        string,
    ) {
      storage.delete(
        key,
      );
    },
  },
};


import {
  loadDashboardState,
  saveDashboardState,
} from "../apps/renderer/src/platform/command-center/storage";


let passed =
  0;

let failed =
  0;


function check(
  name:
    string,
  condition:
    boolean,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS ${passed}: ${name}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL: ${name}`,
  );
}


const profileA =
  "batch5-profile-a";

const profileB =
  "batch5-profile-b";


const initialA =
  loadDashboardState(
    profileA,
  );


check(
  "new profile receives starter dashboard",
  initialA.widgets.length >
    0,
);


saveDashboardState({
  ...initialA,
  widgets: [],
});


const emptyA =
  loadDashboardState(
    profileA,
  );


check(
  "intentional schema-v2 empty dashboard survives reload",
  emptyA.widgets.length ===
    0,
);


const initialB =
  loadDashboardState(
    profileB,
  );


const customizedB = {
  ...initialB,
  layoutMode:
    "list" as const,
  widgets:
    initialB.widgets.map(
      (
        widget,
        index,
      ) => ({
        ...widget,
        hidden:
          index ===
          0,
      }),
    ),
};


saveDashboardState(
  customizedB,
);


const reloadedB =
  loadDashboardState(
    profileB,
  );


check(
  "second profile retains its own layout mode",
  reloadedB.layoutMode ===
    "list",
);


check(
  "second profile retains hidden widget state",
  reloadedB.widgets[0]
    ?.hidden ===
    true,
);


check(
  "profile A remains independent from profile B",
  loadDashboardState(
    profileA,
  ).widgets.length ===
    0,
);


const keys =
  Array.from(
    storage.keys(),
  );


const profileBKey =
  keys.find(
    (key) => {
      const value =
        storage.get(
          key,
        );

      return value?.includes(
        `"profileId":"${profileB}"`,
      );
    },
  );


check(
  "profile B persistence key can be located",
  Boolean(
    profileBKey,
  ),
);


if (
  profileBKey
) {
  storage.set(
    profileBKey,
    "{broken-json",
  );
}


const recoveredB =
  loadDashboardState(
    profileB,
  );


check(
  "corrupt persisted state falls back to starter dashboard",
  recoveredB.widgets.length >
    0,
);


console.log(
  `\nCommand Center persistence closeout test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exitCode =
    1;
}
