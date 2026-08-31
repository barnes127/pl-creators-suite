const {
  RpcInvalidParamsError,
} = require("./errors");


const TRUST = Object.freeze({
  NONE: "none",
  FILESYSTEM: "filesystem",
  DIALOG: "dialog",
  SHELL: "shell",
  NETWORK: "network",
  AI: "ai",
  EXTENSION: "extension",
  UPDATER: "updater",
});


function invalid(message, details = undefined) {
  throw new RpcInvalidParamsError(
    message,
    details,
  );
}


function requireObject(params) {
  if (
    !params ||
    typeof params !== "object" ||
    Array.isArray(params)
  ) {
    invalid(
      "RPC params must be an object.",
    );
  }

  return params;
}


function noParams(params) {
  requireObject(params);

  if (Object.keys(params).length > 0) {
    invalid(
      "This RPC method does not accept parameters.",
    );
  }

  return params;
}


function requireString(
  params,
  field,
) {
  const value =
    params?.[field];

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    invalid(
      `${field} must be a non-empty string.`,
      { field },
    );
  }
}


function optionalString(
  params,
  field,
) {
  const value =
    params?.[field];

  if (
    value !== undefined &&
    typeof value !== "string"
  ) {
    invalid(
      `${field} must be a string when supplied.`,
      { field },
    );
  }
}


function optionalBoolean(
  params,
  field,
) {
  const value =
    params?.[field];

  if (
    value !== undefined &&
    typeof value !== "boolean"
  ) {
    invalid(
      `${field} must be a boolean when supplied.`,
      { field },
    );
  }
}


function projectRootParams(
  params,
) {
  requireObject(params);
  requireString(
    params,
    "projectRoot",
  );

  return params;
}


function projectRootAndNameParams(
  params,
) {
  projectRootParams(params);
  requireString(params, "name");

  return params;
}


function projectRootNameContentParams(
  params,
) {
  projectRootAndNameParams(params);

  if (
    params.content !== undefined &&
    typeof params.content !== "string"
  ) {
    invalid(
      "content must be a string when supplied.",
      { field: "content" },
    );
  }

  return params;
}


function projectCreateParams(
  params,
) {
  requireObject(params);
  optionalString(params, "name");
  optionalString(params, "baseDir");

  return params;
}


function projectExportParams(
  params,
) {
  projectRootParams(params);
  optionalString(params, "outPath");

  return params;
}


function projectImportParams(
  params,
) {
  requireObject(params);
  requireString(params, "filePath");
  optionalString(params, "baseDir");

  return params;
}


function recentAddParams(
  params,
) {
  projectRootParams(params);

  if (
    params.manifest !== undefined &&
    params.manifest !== null &&
    (
      typeof params.manifest !== "object" ||
      Array.isArray(params.manifest)
    )
  ) {
    invalid(
      "manifest must be an object when supplied.",
      { field: "manifest" },
    );
  }

  return params;
}


function pluginEnableParams(
  params,
) {
  requireObject(params);
  requireString(params, "pluginId");
  optionalBoolean(params, "enabled");

  if (
    typeof params.enabled !== "boolean"
  ) {
    invalid(
      "enabled must be a boolean.",
      { field: "enabled" },
    );
  }

  return params;
}


function dialogSaveParams(
  params,
) {
  requireObject(params);
  optionalString(
    params,
    "defaultName",
  );

  return params;
}


function objectParams(params) {
  return requireObject(params);
}


function requireObjectField(
  params,
  field,
) {
  const value = params?.[field];

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    invalid(
      `${field} must be an object.`,
      { field },
    );
  }
}


function logsExportParams(params) {
  return projectRootParams(params);
}


function aiChatParams(params) {
  requireObject(params);
  requireString(params, "prompt");
  optionalString(params, "model");
  optionalString(params, "projectRoot");
  optionalBoolean(
    params,
    "allowProjectContext",
  );

  if (
    params.allowProjectContext === true &&
    (
      typeof params.projectRoot !== "string" ||
      !params.projectRoot.trim()
    )
  ) {
    invalid(
      "projectRoot is required when project context is enabled.",
      {
        field: "projectRoot",
      },
    );
  }

  return params;
}


function pluginManifestParams(params) {
  requireObject(params);
  requireObjectField(
    params,
    "manifest",
  );

  return params;
}


function assetImportParams(params) {
  projectRootParams(params);
  requireString(
    params,
    "sourcePath",
  );

  optionalString(params, "name");
  optionalString(params, "type");

  return params;
}


function assetRegisterParams(params) {
  projectRootParams(params);
  requireString(params, "name");
  requireString(
    params,
    "relativePath",
  );

  optionalString(params, "type");
  optionalString(
    params,
    "sourcePath",
  );

  return params;
}


function assetDetectTypeParams(params) {
  requireObject(params);
  requireString(
    params,
    "filePath",
  );

  return params;
}


function structuredSaveParams(
  params,
  payloadField,
) {
  projectRootAndNameParams(params);

  requireObjectField(
    params,
    payloadField,
  );

  return params;
}


function docsOrCodeSaveParams(params) {
  projectRootAndNameParams(params);

  if (
    typeof params.content !== "string"
  ) {
    invalid(
      "content must be a string.",
      { field: "content" },
    );
  }

  return params;
}

function recoveryRestoreParams(
  params,
) {
  projectRootParams(
    params,
  );

  requireString(
    params,
    "snapshotId",
  );

  return params;
}

const PERMISSION =
  Object.freeze({
    FILESYSTEM_READ:
      "filesystem.read",

    FILESYSTEM_WRITE:
      "filesystem.write",

    DIALOG:
      "dialog",

    SHELL_EXECUTE:
      "shell.execute",

    LOCAL_NETWORK:
      "network.local",

    AI_ACCESS:
      "ai.access",

    EXTENSION_READ:
      "extension.read",

    EXTENSION_MANAGE:
      "extension.manage",

    UPDATER:
      "updater",
  });

const METHOD_CONTRACTS = {

    "project.create": {
      validate: projectCreateParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
      ],
    },

    "project.open": {
      validate: projectRootParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
      ],
    },

    "project.export": {
      validate: projectExportParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
        TRUST.SHELL,
      ],
    },

    "project.import": {
      validate: projectImportParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
        TRUST.SHELL,
      ],
    },

    "logs.export": {
      validate: logsExportParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
      ],
    },

    "recent.list": {
      validate: noParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.FILESYSTEM,
      ],
    },

    "recent.add": {
      validate: recentAddParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.FILESYSTEM,
      ],
    },

    "app.metadata": {
      validate: noParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.NONE,
      ],
    },

    "ai.local.status": {
      validate: noParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.AI,
        TRUST.NETWORK,
      ],
    },

    "ai.local.chat": {
      validate: aiChatParams,
      mutates: false,
      retryable: false,
      supportsCancellation: true,
      trust: [
        TRUST.AI,
        TRUST.NETWORK,
      ],
    },

    "entitlements.flags": {
      validate: noParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.NONE,
      ],
    },

    "plugins.list": {
      validate: noParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.EXTENSION,
        TRUST.FILESYSTEM,
      ],
    },

    "plugins.setEnabled": {
      validate: pluginEnableParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.EXTENSION,
        TRUST.FILESYSTEM,
      ],
    },

    "plugins.refreshDiscovered": {
      validate: noParams,
      mutates: true,
      retryable: false,
      trust: [
        TRUST.EXTENSION,
        TRUST.FILESYSTEM,
      ],
    },

    "plugins.validateManifest": {
      validate: pluginManifestParams,
      mutates: false,
      retryable: true,
      trust: [
        TRUST.EXTENSION,
      ],
    },

    "dialog.openProjectFolder": {
      validate: noParams,
      mutates: false,
      retryable: false,
      trust: [
        TRUST.DIALOG,
        TRUST.FILESYSTEM,
      ],
    },

    "dialog.openPlproj": {
      validate: noParams,
      mutates: false,
      retryable: false,
      trust: [
        TRUST.DIALOG,
        TRUST.FILESYSTEM,
      ],
    },

    "dialog.savePlproj": {
      validate: dialogSaveParams,
      mutates: false,
      retryable: false,
      trust: [
        TRUST.DIALOG,
        TRUST.FILESYSTEM,
      ],
    },

    "dialog.openAssetFile": {
      validate: noParams,
      mutates: false,
      retryable: false,
      trust: [
        TRUST.DIALOG,
        TRUST.FILESYSTEM,
      ],
    },
  };


const PROJECT_SLICE_METHODS =
  [
    "assets",
    "docs",
    "code",
    "sheets",
    "movies",
    "models",
    "games",
    "workflows",
  ];


for (
  const slice
  of PROJECT_SLICE_METHODS
) {
  METHOD_CONTRACTS[
    `${slice}.ensure`
  ] = {
    validate:
      projectRootParams,
    mutates: true,
    retryable: false,
    trust: [
      TRUST.FILESYSTEM,
    ],
  };

  METHOD_CONTRACTS[
    `${slice}.list`
  ] = {
    validate:
      projectRootParams,
    mutates: false,
    retryable: true,
    trust: [
      TRUST.FILESYSTEM,
    ],
  };
}


const NAMED_SLICE_METHODS =
  [
    "docs",
    "code",
    "sheets",
    "movies",
    "models",
    "games",
    "workflows",
  ];


for (
  const slice
  of NAMED_SLICE_METHODS
) {
  METHOD_CONTRACTS[
    `${slice}.create`
  ] = {
    validate:
      projectRootAndNameParams,
    mutates: true,
    retryable: false,
    trust: [
      TRUST.FILESYSTEM,
    ],
  };


  METHOD_CONTRACTS[
    `${slice}.read`
  ] = {
    validate:
      projectRootAndNameParams,
    mutates: false,
    retryable: true,
    trust: [
      TRUST.FILESYSTEM,
    ],
  };
}

METHOD_CONTRACTS[
  "docs.save"
] = {
  validate: docsOrCodeSaveParams,
  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "code.save"
] = {
  validate: docsOrCodeSaveParams,
  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "sheets.save"
] = {
  validate: (params) =>
    structuredSaveParams(
      params,
      "sheet",
    ),

  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "movies.save"
] = {
  validate: (params) =>
    structuredSaveParams(
      params,
      "movie",
    ),

  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "models.save"
] = {
  validate: (params) =>
    structuredSaveParams(
      params,
      "model",
    ),

  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "games.save"
] = {
  validate: (params) =>
    structuredSaveParams(
      params,
      "game",
    ),

  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "workflows.save"
] = {
  validate: (params) =>
    structuredSaveParams(
      params,
      "workflow",
    ),

  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};

METHOD_CONTRACTS[
  "workflows.delete"
] = {
  validate:
    projectRootAndNameParams,
  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};

METHOD_CONTRACTS[
  "assets.import"
] = {
  validate:
    assetImportParams,
  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "assets.register"
] = {
  validate:
    assetRegisterParams,
  mutates: true,
  retryable: false,
  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "assets.detectType"
] = {
  validate:
    assetDetectTypeParams,
  mutates: false,
  retryable: true,
  trust: [
    TRUST.FILESYSTEM,
  ],
};

METHOD_CONTRACTS[
  "rpc.cancel"
] = {
  validate: (params) => {
    requireObject(params);

    const requestId =
      params.requestId;

    if (
      typeof requestId !==
        "string" &&
      typeof requestId !==
        "number"
    ) {
      invalid(
        "requestId must be a string or number.",
        {
          field:
            "requestId",
        },
      );
    }

    return params;
  },

  mutates: false,
  retryable: false,
  supportsCancellation: false,
  trust: [
    TRUST.NONE,
  ],
};

METHOD_CONTRACTS[
  "recovery.status"
] = {
  validate:
    projectRootParams,

  mutates:
    false,

  retryable:
    true,

  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "recovery.snapshots"
] = {
  validate:
    projectRootParams,

  mutates:
    false,

  retryable:
    true,

  trust: [
    TRUST.FILESYSTEM,
  ],
};


METHOD_CONTRACTS[
  "recovery.restore"
] = {
  validate:
    recoveryRestoreParams,

  mutates:
    true,

  retryable:
    false,

  trust: [
    TRUST.FILESYSTEM,
  ],
};

function derivePermissions(
  contract,
) {
  const permissions = new Set();

  if (
    contract.trust.includes(
      TRUST.FILESYSTEM,
    )
  ) {
    permissions.add(
      contract.mutates
        ? PERMISSION.FILESYSTEM_WRITE
        : PERMISSION.FILESYSTEM_READ,
    );
  }

  if (
    contract.trust.includes(
      TRUST.DIALOG,
    )
  ) {
    permissions.add(
      PERMISSION.DIALOG,
    );
  }

  if (
    contract.trust.includes(
      TRUST.SHELL,
    )
  ) {
    permissions.add(
      PERMISSION.SHELL_EXECUTE,
    );
  }

  if (
    contract.trust.includes(
      TRUST.NETWORK,
    )
  ) {
    permissions.add(
      PERMISSION.LOCAL_NETWORK,
    );
  }

  if (
    contract.trust.includes(
      TRUST.AI,
    )
  ) {
    permissions.add(
      PERMISSION.AI_ACCESS,
    );
  }

  if (
    contract.trust.includes(
      TRUST.EXTENSION,
    )
  ) {
    permissions.add(
      contract.mutates
        ? PERMISSION.EXTENSION_MANAGE
        : PERMISSION.EXTENSION_READ,
    );
  }

  return [...permissions];
}

for (
  const contract
  of Object.values(
    METHOD_CONTRACTS,
  )
) {
  if (
    contract
      .supportsCancellation ===
    undefined
  ) {
    contract
      .supportsCancellation =
      false;
  }

  if (
    contract.maxAttempts ===
    undefined
  ) {
    contract.maxAttempts =
      contract.retryable
        ? 2
        : 1;
  }
}

Object.freeze(
  METHOD_CONTRACTS,
);

function getMethodContract(
  method,
) {
  return (
    METHOD_CONTRACTS[method] ||
    null
  );
}


function validateMethodParams(
  method,
  params,
) {
  const contract =
    getMethodContract(method);

  if (!contract) {
    throw new RpcInvalidParamsError(
      `No RPC contract is registered for method: ${method}`,
      { method },
    );
  }

  return contract.validate(params);
}


function assertMethodContractCoverage(
  methods,
) {
  if (
    !methods ||
    typeof methods !== "object"
  ) {
    throw new Error(
      "RPC method registry is required.",
    );
  }

  const methodNames =
    Object.keys(methods);

  const contractNames =
    Object.keys(
      METHOD_CONTRACTS,
    );

  const missingContracts =
    methodNames.filter(
      (method) =>
        !METHOD_CONTRACTS[method],
    );

  const orphanContracts =
    contractNames.filter(
      (method) =>
        !methods[method],
    );

  if (
    missingContracts.length ||
    orphanContracts.length
  ) {
    throw new Error(
      [
        "RPC contract coverage mismatch.",
        missingContracts.length
          ? `Missing contracts: ${missingContracts.join(", ")}`
          : "",
        orphanContracts.length
          ? `Orphan contracts: ${orphanContracts.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  return {
    methodCount:
      methodNames.length,

    contractCount:
      contractNames.length,
  };
}

module.exports = {
  TRUST,
  PERMISSION,
  METHOD_CONTRACTS,
  getMethodContract,
  validateMethodParams,
  derivePermissions,
  assertMethodContractCoverage,
};
