const fs =
  require("node:fs");

const path =
  require("node:path");


const root =
  process.cwd();


function read(
  relativePath,
) {
  return fs.readFileSync(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}


const workspace =
  read(
    "apps/renderer/src/components/workspaces/CommandCenterWorkspace.tsx",
  );

const host =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetHost.tsx",
  );

const controls =
  read(
    "apps/renderer/src/components/workspaces/DashboardWidgetControls.tsx",
  );

const panel =
  read(
    "apps/renderer/src/components/workspaces/DashboardCustomizationPanel.tsx",
  );

const compatibility =
  read(
    "apps/renderer/src/platform/command-center/compatibility.ts",
  );


let passed =
  0;

let failed =
  0;


function check(
  name,
  condition,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS    ${name}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL    ${name}`,
  );
}


check(
  "saved widgets have explicit compatibility states",
  compatibility.includes(
    '"incompatible-version"',
  ) &&
    compatibility.includes(
      '"missing"',
    ),
);


check(
  "same-major widget versions have migration behavior",
  compatibility.includes(
    "reconcileDashboardStateWithDefinitions",
  ),
);


check(
  "workspace reconciles persisted widgets against active definitions",
  workspace.includes(
    "reconcileDashboardStateWithDefinitions",
  ),
);


check(
  "dashboard exposes explicit widget removal",
  workspace.includes(
    "removeDashboardWidget",
  ) &&
    panel.includes(
      "onRemove",
    ),
);


check(
  "disabled widgets have bounded unavailable state",
  workspace.includes(
    '"disabled"',
  ) &&
    panel.includes(
      "Unavailable widgets",
    ),
);


check(
  "incompatible extension registration has bounded unavailable state",
  workspace.includes(
    '"incompatible"',
  ),
);


check(
  "normal widget host exposes compatibility state",
  host.includes(
    "data-widget-compatibility",
  ),
);


check(
  "incompatible widget does not use normal renderer content",
  host.includes(
    "Incompatible widget version",
  ),
);


check(
  "widget frames are keyboard focusable",
  host.includes(
    "tabIndex={0}",
  ),
);


check(
  "widget controls expose a labelled control group",
  controls.includes(
    'role="group"',
  ),
);


check(
  "pin control exposes pressed state",
  controls.includes(
    "aria-pressed",
  ),
);


check(
  "resize controls remain keyboard-accessible inputs",
  controls.includes(
    'type="number"',
  ) &&
    controls.includes(
      "Width for",
    ) &&
    controls.includes(
      "Height for",
    ),
);


check(
  "group control is labelled",
  controls.includes(
    "Group for",
  ),
);


check(
  "reorder controls have keyboard button alternatives",
  panel.includes(
    "Move "
  ) &&
    panel.includes(
      " up"
    ) &&
    panel.includes(
      " down"
    ),
);


check(
  "remove control is labelled for assistive technology",
  panel.includes(
    "Remove "
  ) &&
    panel.includes(
      "from dashboard",
    ),
);


check(
  "customize mode exposes toggle state",
  workspace.includes(
    "aria-pressed"
  ),
);


check(
  "compatibility layer contains no executable injection",
  !compatibility.includes(
    "eval("
  ) &&
    !compatibility.includes(
      "new Function"
    ),
);


console.log(
  `\nCommand Center Batch-5 closeout test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  process.exitCode =
    1;
}
