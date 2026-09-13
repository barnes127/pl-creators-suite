const fs =
  require(
    "node:fs",
  );

const path =
  require(
    "node:path",
  );


const root =
  path.resolve(
    __dirname,
    "..",
  );

const modalPath =
  path.join(
    root,
    "apps/renderer/src/components/Modal.tsx",
  );

const modal =
  fs.readFileSync(
    modalPath,
    "utf8",
  );


let passed =
  0;

let failed =
  0;


function check(
  condition,
  message,
) {
  if (
    condition
  ) {
    passed +=
      1;

    console.log(
      `PASS    ${message}`,
    );

    return;
  }

  failed +=
    1;

  console.error(
    `FAIL    ${message}`,
  );
}


check(
  modal.includes(
    'role="dialog"',
  ),
  "modal exposes dialog role",
);


check(
  modal.includes(
    'aria-modal="true"',
  ),
  "modal exposes modal semantics",
);


check(
  /event\.key\s*===\s*"Escape"/.test(
    modal,
  ),
  "Escape closes modal",
);


check(
  /event\.key\s*!==\s*"Tab"/.test(
    modal,
  ),
  "modal handles Tab navigation",
);


check(
  modal.includes(
    "previousFocus?.focus()",
  ),
  "modal restores previous focus",
);


check(
  modal.includes(
    "focusable?.focus()",
  ),
  "modal moves focus inside on open",
);


check(
  modal.includes(
    "querySelectorAll<HTMLElement>",
  ),
  "modal enumerates focusable elements for containment",
);


console.log(
  `\nModal keyboard test complete: ${passed} passed, ${failed} failed.`,
);


if (
  failed >
  0
) {
  throw new Error(
    `${failed} modal keyboard checks failed`,
  );
}
