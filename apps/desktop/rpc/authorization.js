const {
  RpcPermissionError,
} = require("./errors");

const {
  PERMISSION,
  derivePermissions,
  getMethodContract,
} = require("./contracts");


const DEFAULT_DESKTOP_PERMISSIONS =
  Object.freeze([
    PERMISSION.FILESYSTEM_READ,
    PERMISSION.FILESYSTEM_WRITE,
    PERMISSION.DIALOG,
    PERMISSION.SHELL_EXECUTE,
    PERMISSION.LOCAL_NETWORK,
    PERMISSION.AI_ACCESS,
    PERMISSION.EXTENSION_READ,
    PERMISSION.EXTENSION_MANAGE,
    PERMISSION.UPDATER,
  ]);


function createRpcAuthorizer({
  allowedPermissions =
    DEFAULT_DESKTOP_PERMISSIONS,
} = {}) {
  const allowed =
    new Set(allowedPermissions);


  function authorize(
    method,
    contract = null,
  ) {
    const resolvedContract =
      contract ||
      getMethodContract(method);

    const required =
      derivePermissions(
        resolvedContract,
      );

    const denied =
      required.filter(
        (permission) =>
          !allowed.has(permission),
      );

    if (denied.length > 0) {
      throw new RpcPermissionError(
        `RPC method "${method}" is not permitted`,
        {
          method,
          requiredPermissions:
            required,
          deniedPermissions:
            denied,
        },
      );
    }

    return {
      allowed: true,
      method,
      requiredPermissions:
        required,
    };
  }


  function snapshot() {
    return {
      allowedPermissions:
        [...allowed].sort(),
    };
  }


  return {
    authorize,
    snapshot,
  };
}


module.exports = {
  DEFAULT_DESKTOP_PERMISSIONS,
  createRpcAuthorizer,
};
