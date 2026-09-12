# PL Creators Suite — Platform API Boundaries v1.2.6

## Composition

The platform composition root owns shared registries and APIs.

Consumers do not create independent copies of suite-wide infrastructure unless isolation explicitly requires it.

## Runtime Shape

The platform runtime composes:

- capabilities
- commands / Command API
- events / Event API
- settings / Settings API
- notifications
- services
- assets
- asset dependencies
- search / Search API
- UI contributions / UI API
- themes / Theme API
- templates / Template API

Desktop adapters additionally connect:

- Project API
- File API
- Task API
- Workflow API

## Trust Boundary

Permissions describe whether an operation is allowed.

Capabilities describe whether a consumer is authorized to discover/use a declared platform capability.

Both may be required.

A capability declaration does not grant a permission.

A permission does not automatically grant a capability.

## Mutation Boundary

Shared mutations must not:

- silently overwrite user data
- escape the project root
- bypass permission checks
- bypass capability checks
- silently upload project data
- invoke hidden shell commands

Higher-risk destructive actions must remain previewable or recoverable according to their subsystem risk.

## Extension Boundary

v1.2.6 does not create the extension runtime.

The UI, Theme, Template, Command, Search, Project, File, Settings, Notification, Event, Task, and Workflow contracts are foundations the later extension runtime may consume through controlled adapters.

Extensions must not receive raw filesystem, database-driver, shell, cloud, or unrestricted renderer access by default.

## Data Source Boundary

Internal app storage, portable project formats, user-attached project/domain databases, and PL cloud databases are distinct layers.

`data-source` and `query` are reserved service categories only.

Database runtime begins in later roadmap milestones.
