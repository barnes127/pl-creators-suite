const fs =
  require("fs");

const path =
  require("path");


const root =
  path.resolve(
    __dirname,
    "..",
  );

const cssPath =
  path.join(
    root,
    "apps",
    "renderer",
    "src",
    "app.css",
  );


let passed = 0;
let failed = 0;


function check(
  condition,
  message,
) {
  if (condition) {
    passed += 1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }

  failed += 1;

  console.error(
    `FAIL    ${message}`,
  );
}


const css =
  fs.readFileSync(
    cssPath,
    "utf8",
  );


console.log(
  "\nPL Creators Suite — Shell Accessibility Test\n",
);


check(
  css.includes(
    ":focus-visible",
  ),
  "visible keyboard focus styling exists",
);


check(
  css.includes(
    'data-theme="high-contrast"',
  ),
  "high-contrast theme styling exists",
);


check(
  css.includes(
    "prefers-reduced-motion",
  ),
  "reduced-motion preference is respected",
);


check(
  css.includes(
    ":disabled",
  ),
  "disabled control styling exists",
);


check(
  css.includes(
    "outline:",
  ),
  "keyboard focus uses a visible outline",
);


check(
  css.includes(
    ".topbarLeft",
  ),
  "shell accessibility controls have layout styling",
);


console.log(
  `\nShell accessibility test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed > 0
) {
  process.exit(1);
}
