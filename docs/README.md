# PL Creators Suite Documentation

This directory contains architecture, specifications, capability tracking, development guidance, and release validation for PL Creators Suite.

Not every document has the same authority. Older documents may remain in the repository for historical reference.

## Documentation Order

When documents appear to conflict, use this general priority:

1. Current approved master roadmap / blueprint
2. Current architecture and governance documents
3. Current capability registry and traceability records
4. Current technical specifications
5. Current milestone implementation and validation documents
6. Historical release documentation
7. Archived early-development documents

Explicit approved deviations override the document they intentionally replace.

## Main Documentation Areas

### `architecture/`

Current system architecture, boundaries, security, failure isolation, API references, and architectural closeout records.

Start with:

- `ARCHITECTURE_GUARDRAILS.md`
- `TRUST_BOUNDARIES.md`
- `FAILURE_ISOLATION.md`
- `RENDERER_ARCHITECTURE.md`

### `capabilities/`

Capability registry and requirement traceability.

These documents track whether roadmap requirements are:

- planned
- implemented
- validated
- missing
- deferred

### `spec/`

Technical specifications for formats, protocols, and other implementation contracts.

### `development/`

Development environment and contributor-oriented technical guidance.

### `releases/`

Validation records, compatibility reports, performance baselines, audits, and milestone closeout documentation.

These files are intentionally retained as engineering history.

A release document describes the state of the project at that point in time and should not automatically be treated as current architecture.

### `archive/`

Early or superseded documents retained for historical context.

Archived documents are not current sources of truth.

## AI-Assisted Development

`AI_RULES.md` documents how ChatGPT is used during PL Creators Suite development and the boundaries of AI-assisted work.

## Keeping Documentation Current

When architecture or behavior changes:

- update the current authoritative document
- preserve useful historical validation records
- move superseded general guidance to `archive/` instead of leaving conflicting instructions in the active documentation tree
- avoid documenting planned behavior as already implemented
- record known limitations rather than hiding them
