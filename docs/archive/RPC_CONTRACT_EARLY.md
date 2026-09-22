# JSON-RPC Contract (v1)
Protocol: JSON-RPC 2.0
Transport (dev): localhost HTTP (later could be WebSocket)

## Methods (v1)
-project.create
-project.open
-project.save
-project.getInfo
-logs.export

## Example request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "project.create",
  "params": {"name": "Test", "path": "/home/user/PLProjects/Test" }
}
## Example response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "projectPath": "...", "manifestPath": "..." }
}
