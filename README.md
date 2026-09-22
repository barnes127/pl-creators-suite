# PL Creators Suite

PL Creators Suite is an offline-first desktop creation platform developed by Praecursor Labs.

It brings multiple creator workflows into one local-first environment while sharing common project, platform, automation, extension, and service infrastructure.

## Creator Slices

The Suite contains six primary creator slices:

- Code
- Game
- Movie / Animation
- Docs
- Sheets
- Modeling

The slices are the primary product. Shared systems support them without replacing their specialized workflows.

## Development Status

PL Creators Suite is currently under active beta development toward the official v1 release.

Development is milestone-driven and completion-gated rather than date-gated.

Current work focuses on expanding the Suite from its original beta foundation into the full official-v1 architecture and capability set.

## Core Principles

- offline-first core functionality
- user-owned local project data
- portable project formats
- Windows and Linux support
- shared systems behind PL-owned contracts
- safe extension boundaries
- recoverability and compatibility
- incremental replacement paths for external dependencies
- cloud services as augmentation rather than a requirement for local creation

## Technology

Current desktop development uses:

- Electron
- React
- TypeScript
- Vite
- Node.js
- pnpm

Some specialized capabilities may use additional production libraries behind PL-owned boundaries.

## Documentation

Repository documentation lives under [`docs/`](docs/).

Start with:

- [`docs/README.md`](docs/README.md) — documentation map and authority
- [`docs/architecture/ARCHITECTURE_GUARDRAILS.md`](docs/architecture/ARCHITECTURE_GUARDRAILS.md) — core architecture rules
- [`docs/AI_RULES.md`](docs/AI_RULES.md) — AI-assisted development workflow
- [`docs/capabilities/`](docs/capabilities/) — capability tracking and traceability
- [`docs/releases/`](docs/releases/) — validation and release history

## Project Philosophy

PL Creators Suite is designed as a long-lived creator platform rather than a collection of disconnected tools.

Features are expected to evolve over time, but core workflows should remain understandable, recoverable, portable, and usable locally.
