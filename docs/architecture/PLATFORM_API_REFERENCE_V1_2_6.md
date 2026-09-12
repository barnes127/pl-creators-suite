# PL Creators Suite — Internal Platform API Reference v1.2.6

## Purpose

v1.2.6 establishes stable internal API boundaries for shared suite services.

These APIs are internal platform contracts. They do not constitute the later public extension runtime or marketplace SDK.

## Project API

Service ID: `core.project`

Responsibilities:

- project metadata access
- project recent access
- project tree access

Current v1.2.6 scope is primarily read-oriented.

Future metadata mutation must preserve permission, history, recovery, and non-destructive-write boundaries.

## File API

Service ID: `core.file`

Responsibilities:

- controlled project-relative reads
- controlled project-relative writes
- directory listing
- file stat access
- project-root containment

Safety rules:

- no silent overwrite
- explicit overwrite required
- lexical traversal rejected
- symlink escape rejected
- writes remain inside the project boundary

## Settings API

Service ID: `core.settings`

Responsibilities:

- scoped settings reads
- scoped settings writes
- bulk writes
- deletion
- scope clearing
- deterministic resolution

## Notification API

Service ID: `core.notification`

Responsibilities:

- application/project notification creation
- severity/category metadata
- dismissal
- removal
- filtering
- local in-memory lifecycle

Persistence is not promised by v1.2.6.

## Command API

Service ID: `core.command`

Responsibilities:

- register/unregister commands
- command discovery
- search
- permission-aware execution

## Search API

Service ID: `core.search`

Responsibilities:

- provider registration
- provider removal
- result-kind filtering
- cancellation-aware search aggregation

## Event API

Service ID: `core.event`

Responsibilities:

- typed subscription
- one-shot subscription
- typed event emission
- listener diagnostics

## Task API

Service ID: `core.task`

Responsibilities:

- task creation
- cancellation
- lookup
- listing

Desktop execution remains backed by the existing desktop task manager.

## Workflow API

Service ID: `core.workflow`

Responsibilities:

- list/create/read/save/delete workflow documents
- shared `workflow.run` task contract

v1.2.6 does not move renderer workflow execution into a new desktop engine.

## UI API

Service ID: `core.ui`

Contribution kinds:

- panel
- menu
- toolbar

UI contributions are declarative metadata.

Arbitrary DOM, HTML, React component, or JavaScript injection is not part of v1.2.6.

## Theme API

Service ID: `core.theme`

Responsibilities:

- declarative theme registration
- theme discovery
- token storage
- permission/capability filtering

Theme contributions are data, not executable code.

## Template API

Service ID: `core.template`

Responsibilities:

- project/document/code/model/movie/game/spreadsheet/workflow template registration
- template discovery
- permission/capability filtering

Template payloads remain declarative data.

## Service Discovery

Services declare:

- category
- stability
- required permissions
- required capabilities
- metadata

Discovery enforces both permissions and declared capabilities.

## Reserved Future APIs

The service taxonomy reserves:

- `data-source`
- `query`

These categories exist only so future architecture does not require breaking service taxonomy changes.

v1.2.6 does not implement SQLite, PostgreSQL, network database providers, or general query runtime.

## Consumer Model

Initial consumer proof uses the real Code and Docs slice identities.

The proof validates that the same platform runtime can serve multiple slices without copied per-slice registries.

Further runtime adoption occurs incrementally as later slice work replaces legacy direct access.
