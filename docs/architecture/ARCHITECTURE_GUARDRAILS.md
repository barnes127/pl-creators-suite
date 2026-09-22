# PL Creators Suite — Architecture Guardrails

These guardrails define the architectural rules that should remain stable as PL Creators Suite grows.

They are not a complete architecture specification. Detailed implementation decisions live in the relevant architecture, capability, roadmap, and validation documents.

## Core Principles

### Offline-first

Core creator functionality must remain usable without an internet connection.

Cloud services may extend the Suite, but they should not become a hidden requirement for local creation workflows unless a feature is explicitly cloud-dependent.

### User-owned data

Local projects and their persisted project data remain under the user's control.

Portable project formats, local files, migrations, backup, recovery, and compatibility should be treated as first-class product concerns.

### Stable boundaries

Shared systems should be exposed through stable PL-owned contracts rather than copied directly between slices.

Renderer code, backend services, engines, extensions, workflows, AI features, and future cloud systems should communicate through defined boundaries.

Third-party implementation details should not leak unnecessarily into PL-owned contracts.

### Build small capabilities when reasonable

Do not add a new third-party dependency when the required capability is small enough for PL to reasonably own and maintain.

Larger specialized dependencies may be used when they provide meaningful production capability, especially when isolated behind PL-owned interfaces so they can be replaced later.

### Prefer clear systems over clever ones

Implementation should favor understandable ownership, explicit contracts, recoverable state, and maintainable systems over unnecessary abstraction or clever shortcuts.

### Preserve replacement paths

Where PL relies on external runtimes, engines, or libraries, architecture should avoid making them impossible to replace later.

This is especially important for long-term dependency sovereignty work.

## Product Architecture

PL Creators Suite is built around six creator slices:

- Code
- Game
- Movie / Animation
- Docs
- Sheets
- Modeling

The slices are the primary product.

Shared platform systems exist to support them rather than replace them.

Examples include:

- projects and portable formats
- assets
- commands
- events
- tasks
- workflows
- diagnostics
- search and indexing
- recovery
- settings
- extensions
- AI services
- future cloud and collaboration systems

Shared functionality should live behind reusable platform contracts when practical.

## Renderer and Backend Boundary

The renderer should not directly own privileged operating-system or backend behavior.

Privileged operations should pass through the approved desktop/backend service and RPC boundaries.

New backend functionality should follow the established contract, authorization, execution, logging, and error-handling architecture rather than creating one-off communication paths.

## Extensions

Extensions must operate through defined contribution and capability boundaries.

Extension-provided functionality should not be allowed to silently bypass:

- permissions
- compatibility rules
- platform contracts
- security boundaries
- recovery behavior
- host isolation

Extension failures should degrade locally rather than taking down the Suite.

## AI

AI functionality must use approved PL-owned interfaces and permission boundaries.

AI systems should not receive unrestricted direct access to internal storage, project data, databases, extensions, workflows, or privileged application behavior.

AI-assisted development of the Suite is governed separately by `docs/AI_RULES.md`.

## Persistence and Compatibility

Persisted data should be versioned where evolution is expected.

Changes to persisted structures should consider:

- migration
- rollback
- compatibility
- corruption handling
- recovery
- user data preservation

Unknown or incompatible persisted state should degrade safely whenever possible.

## Failure Isolation

Failure in one widget, extension, slice, engine, background task, or optional service should not unnecessarily prevent unrelated parts of the Suite from opening or functioning.

See `docs/architecture/FAILURE_ISOLATION.md` for more detailed failure-isolation rules.

## Security

Security boundaries should be explicit rather than assumed.

Privileged actions, extension behavior, external content, RPC access, filesystem access, future cloud communication, and AI access should follow least-privilege principles.

See `docs/architecture/TRUST_BOUNDARIES.md` for the detailed trust model.

## Roadmap Authority

Architecture work must remain aligned with the currently approved PL Creators Suite roadmap and capability requirements.

AI suggestions, experiments, prototypes, or implementation shortcuts do not override approved roadmap or architecture decisions.

If a major architectural deviation is necessary, document:

- what is changing
- why it is changing
- what requirement or approach it replaces
- its compatibility and migration impact
- when it becomes authoritative

## Validation

A system is not considered complete because its UI, type definitions, or stubs exist.

Architecture work should be validated with the level of evidence appropriate to the capability, including combinations of:

- automated tests
- integration tests
- production builds
- realistic data
- manual behavior testing
- persistence and migration tests
- recovery testing
- compatibility testing
- fault injection
- performance testing

Actual behavior takes priority over assumptions based only on implementation structure.
