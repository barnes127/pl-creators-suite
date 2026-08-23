# PL Creators Suite RPC Inventory

Generated from `apps/desktop/rpc/contracts.js`.

Total registered contracts: 61

## Contract Rules

- Every active renderer-to-main RPC method must have exactly one registered contract.
- Parameters are validated before the handler executes.
- Mutating operations are not automatically retryable.
- Trust categories document privileged boundaries touched by a method.
- Permission labels describe the authority required by that method.
- A method contract describes authority; it does not itself grant authority.

## Methods

| Method | Mutates | Retryable | Cancellable | Attempts | Trust boundaries | Required permissions |
| --- | --- | --- | --- | --- | --- | --- |
| `ai.local.chat` | No | No | Yes | Yes | ai, network | network.local, ai.access |
| `ai.local.status` | No | Yes | No | Yes | ai, network | network.local, ai.access |
| `app.metadata` | No | Yes | No | Yes | none | none |
| `assets.detectType` | No | Yes | No | Yes | filesystem | filesystem.read |
| `assets.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `assets.import` | Yes | No | No | Yes | filesystem | filesystem.write |
| `assets.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `assets.register` | Yes | No | No | Yes | filesystem | filesystem.write |
| `code.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `code.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `code.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `code.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `code.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `dialog.openAssetFile` | No | No | No | Yes | dialog, filesystem | filesystem.read, dialog |
| `dialog.openPlproj` | No | No | No | Yes | dialog, filesystem | filesystem.read, dialog |
| `dialog.openProjectFolder` | No | No | No | Yes | dialog, filesystem | filesystem.read, dialog |
| `dialog.savePlproj` | No | No | No | Yes | dialog, filesystem | filesystem.read, dialog |
| `docs.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `docs.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `docs.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `docs.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `docs.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `entitlements.flags` | No | Yes | No | Yes | none | none |
| `games.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `games.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `games.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `games.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `games.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `logs.export` | Yes | No | No | Yes | filesystem | filesystem.write |
| `models.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `models.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `models.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `models.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `models.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `movies.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `movies.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `movies.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `movies.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `movies.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `plugins.list` | No | Yes | No | Yes | extension, filesystem | filesystem.read, extension.read |
| `plugins.refreshDiscovered` | Yes | No | No | Yes | extension, filesystem | filesystem.write, extension.manage |
| `plugins.setEnabled` | Yes | No | No | Yes | extension, filesystem | filesystem.write, extension.manage |
| `plugins.validateManifest` | No | Yes | No | Yes | extension | extension.read |
| `project.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `project.export` | Yes | No | No | Yes | filesystem, shell | filesystem.write, shell.execute |
| `project.import` | Yes | No | No | Yes | filesystem, shell | filesystem.write, shell.execute |
| `project.open` | Yes | No | No | Yes | filesystem | filesystem.write |
| `recent.add` | Yes | No | No | Yes | filesystem | filesystem.write |
| `recent.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `rpc.cancel` | No | No | No | Yes | none | none |
| `sheets.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `sheets.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `sheets.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `sheets.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `sheets.save` | Yes | No | No | Yes | filesystem | filesystem.write |
| `workflows.create` | Yes | No | No | Yes | filesystem | filesystem.write |
| `workflows.delete` | Yes | No | No | Yes | filesystem | filesystem.write |
| `workflows.ensure` | Yes | No | No | Yes | filesystem | filesystem.write |
| `workflows.list` | No | Yes | No | Yes | filesystem | filesystem.read |
| `workflows.read` | No | Yes | No | Yes | filesystem | filesystem.read |
| `workflows.save` | Yes | No | No | Yes | filesystem | filesystem.write |

## Current Transport

- Renderer requests are sent to the Electron-owned loopback RPC server.
- The server binds to `127.0.0.1`.
- Requests require the per-session RPC token.
- Request bodies are bounded.
- RPC errors are normalized and correlated with request IDs.

## Current Limitations

- Cancellation and progress are standardized in the next Wave 1.1.4 batch.
- Retry metadata exists, but automatic retry execution is not enabled.
- The RPC session token is currently delivered to the renderer through its startup URL.
- Long-running mutating calls are intentionally not protected by Promise.race timeouts because timeout alone does not cancel the underlying mutation.

