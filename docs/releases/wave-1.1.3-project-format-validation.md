# Wave 1.1.3 — Project Format, Migration, and Data Safety Validation

## Status

Validated.

## Scope

Wave 1.1.3 establishes the persistence and compatibility contract for PL Creators Suite project data.

Implemented areas:

- versioned `.plproj` project manifests
- explicit project schema version
- future-version rejection
- migration registry and migration boundary
- atomic manifest writes
- pre-migration manifest backups
- corrupted manifest detection
- transactional `.plproj` import using staging
- failed-import cleanup
- project resource-state vocabulary
- versioned envelopes for slice, asset, extension, workflow, and cloud-sync state
- SHA-256 integrity records
- checksum validation
- project integrity inspection
- project journal primitive
- repair entry points
- manifest backup restoration
- automated project-format fixtures and tests

## Project Format Contract

Current project schema version:

- `1`

Current project manifest:

- `pl-project.json`

Current archive extension:

- `.plproj`

A project from a schema newer than the running build is rejected instead of being opened or modified.

## Resource States

The baseline persistence contract recognizes:

- embedded
- linked
- external
- generated
- cached
- stale
- missing
- shared
- derived

These states define the shared vocabulary used by later project, asset, dependency, extension, workflow, and cloud systems.

## Versioned Subsystem Data

Versioned envelopes are defined for:

- slice state
- asset metadata
- extension state
- workflow state
- cloud-sync metadata

Wave 1.1.3 defines their persistence contracts only. Their full runtime services are implemented in later roadmap milestones.

## Migration Policy

Project loading passes through a migration boundary.

Behavior:

- valid current schemas load normally
- future schemas are rejected
- older supported schemas must migrate sequentially
- missing migration steps fail visibly
- migrated manifests are validated
- existing manifests can be backed up before replacement
- writes use atomic replacement

Schema version 1 is the first formal project schema baseline, so there is currently no historical version requiring a real migration implementation.

## Integrity and Recovery

Implemented baseline integrity primitives:

- SHA-256 checksum records
- checksum mismatch detection
- missing checksum detection
- corrupted manifest detection
- integrity inspection
- project journal entries
- manifest backup restoration
- checksum rebuild repair action

These are low-level recovery primitives. Full shared autosave, crash recovery, snapshots, retention policies, and recovery UI remain part of later shared-platform work.

## Import Safety

`.plproj` import now:

1. validates the archive path list
2. rejects obvious traversal paths
3. extracts into a temporary staging directory
4. validates the project manifest
5. performs supported migration if required
6. installs the project only after validation succeeds
7. removes staging data when import fails

The final project directory is not created from partially validated project contents.

## Automated Validation

Project format test suite:

- valid schema manifest
- future schema rejection
- migration future-schema rejection
- corrupt JSON detection
- atomic manifest persistence
- backup creation
- export/import round trip
- missing-manifest import cleanup
- future-schema import cleanup
- official resource states
- invalid resource-state rejection
- subsystem envelope validation
- future subsystem-schema rejection
- asset metadata state validation
- valid checksum verification
- checksum mismatch detection
- journal persistence
- healthy integrity inspection
- backup-based repair

Expected result:

`19 passed, 0 failed`

Repository smoke test expected result:

`23 passed, 0 failed`

## Known Boundaries

- Integrity checks currently protect the authoritative project manifest; broader per-file checksum coverage expands as shared project and asset services mature.
- Full autosave, snapshots, crash journals, retention, and recovery UI are not implemented in this wave.
- Schema version 1 is the first formal schema baseline, so no historical migration fixture exists yet.
- Archive path traversal preflight is implemented; deeper generalized archive handling will later belong to the shared import/export framework.
- The current atomic JSON helper uses the existing repository persistence implementation and may receive broader concurrency hardening during shared platform work.

## Capability Mapping

- `PL-CORE-PROJECT-001`
- `PL-CORE-MIGRATION-001`

## Validation Gate

Wave 1.1.3 is accepted when:

- project-format tests pass
- repository smoke tests pass
- renderer build passes
- capability registry validation passes
- dependency audit passes
- `git diff --check` passes
- no known project-format data-loss issue remains untriaged
