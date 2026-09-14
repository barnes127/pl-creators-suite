const fs =
  require(
    "fs",
  );

const path =
  require(
    "path",
  );


const registryDir =
  path.resolve(
    __dirname,
    "../../docs/capabilities/registry",
  );


const requestedMilestone =
  process.argv[2] ||
  "v1.2";


function parseMilestone(
  value,
) {
  const match =
    /^v(\d+)\.(\d+)(?:\.(\d+))?$/
      .exec(
        String(
          value || "",
        ).trim(),
      );


  if (
    !match
  ) {
    return null;
  }


  return [
    Number(
      match[1],
    ),
    Number(
      match[2],
    ),
    Number(
      match[3] || 0,
    ),
  ];
}


function compareMilestones(
  left,
  right,
) {
  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    if (
      left[index] !==
      right[index]
    ) {
      return (
        left[index] -
        right[index]
      );
    }
  }


  return 0;
}


const gateVersion =
  parseMilestone(
    requestedMilestone,
  );


if (
  !gateVersion
) {
  throw new Error(
    `Invalid milestone: ${requestedMilestone}`,
  );
}


const files =
  fs
    .readdirSync(
      registryDir,
    )
    .filter(
      (
        file,
      ) =>
        file.endsWith(
          ".json",
        ),
    )
    .sort();


const failures = [];
let checked = 0;


for (
  const file
  of files
) {
  const fullPath =
    path.join(
      registryDir,
      file,
    );

  const registry =
    JSON.parse(
      fs.readFileSync(
        fullPath,
        "utf8",
      ),
    );


  for (
    const capability
    of registry.capabilities
  ) {
    const milestone =
      parseMilestone(
        capability.targetMilestone,
      );


    if (
      !milestone ||
      compareMilestones(
        milestone,
        gateVersion,
      ) > 0
    ) {
      continue;
    }


    checked += 1;


    if (
      capability.id !==
      capability.id.trim()
    ) {
      failures.push(
        `${capability.id}: capability ID contains surrounding whitespace`,
      );
    }


    if (
      capability.status !==
      "complete"
    ) {
      failures.push(
        `${capability.id}: target ${capability.targetMilestone} is ${capability.status}`,
      );
    }


    if (
      !Array.isArray(
        capability.implementation,
      ) ||
      capability.implementation.length ===
        0
    ) {
      failures.push(
        `${capability.id}: missing implementation evidence`,
      );
    }


    if (
      !Array.isArray(
        capability.validation,
      ) ||
      capability.validation.length ===
        0
    ) {
      failures.push(
        `${capability.id}: missing validation evidence`,
      );
    }
  }
}


if (
  failures.length >
  0
) {
  console.error(
    `Capability milestone gate failed for ${requestedMilestone}:`,
  );


  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    );
  }


  process.exit(
    1,
  );
}


console.log(
  `Capability milestone gate passed for ${requestedMilestone}: ${checked} capability entries verified.`,
);
