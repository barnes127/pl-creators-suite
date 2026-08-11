# PL Creators Suite Capability Registry

The capability registry is the source of truth for tracking implementation
progress from the current beta through Dev v2 / Official Version 1.

Each documented Official Version 1 requirement must have a capability ID.

## Capability statuses

- `complete` — requirement works end to end with real project data
- `partial` — functional implementation exists but does not satisfy the full requirement
- `missing` — implementation does not yet exist
- `blocked` — implementation cannot proceed because another dependency is incomplete
- `deferred` — capability has been formally moved to a later milestone

A visible UI control or placeholder does not qualify as complete.

## Capability ID format

Capability IDs use:

`PL-<SLICE>-<AREA>-<NUMBER>`

Examples:

- `PL-DOC-EDIT-001`
- `PL-SHEET-FORMULA-001`
- `PL-CODE-EDITOR-001`
- `PL-MODEL-MESH-001`
- `PL-ANIM-TIMELINE-001`
- `PL-GAME-SCENE-001`
- `PL-CORE-PROJECT-001`

## Slice codes

- `CORE` — shared platform systems
- `DOC` — PL Docs
- `SHEET` — PL Spreadsheets
- `CODE` — PL Code IDE
- `MODEL` — PL Modeling/Design Studio
- `ANIM` — PL Movie/Animation Studio
- `GAME` — PL Game Dev Studio

## Registry fields

Each capability entry contains:

- `id`
- `name`
- `description`
- `slice`
- `area`
- `status`
- `targetMilestone`
- `source`
- `implementation`
- `validation`
- `notes`
- `blockedBy`
- `deferralReason`

Fields that do not currently apply should use `null` or an empty array rather
than being omitted.

## Registry rules

1. Capability IDs must be globally unique.
2. Every Official Version 1 requirement must eventually have an ID.
3. `complete` means the requirement works with real project data.
4. Partial implementations must remain `partial`.
5. Blocked capabilities must identify their blocking capability or subsystem.
6. Deferred capabilities must include a reason and future target.
7. Roadmap waves and validation tests should reference capability IDs.
8. Capability IDs should remain stable after creation whenever possible.
