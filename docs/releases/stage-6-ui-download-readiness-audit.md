# Stage 6 — UI Polish, Branding, and Download Readiness Audit

## Status

Planning / ready for Stage 6 implementation.

## Stage 6 Purpose

Stage 6 prepares PL Creators Suite for a public v1 beta download.

The goal is to move the app from a build-testing interface into a professional, branded creator platform that matches the Praecursor Labs identity and can be published on the Praecursor Labs website and GitHub.

Stage 6 is not a major feature-expansion stage.

## Product Identity

PL Creators Suite should feel like:

- a serious local-first creator platform
- an independent R&D-built software suite
- a dark creative workstation
- a practical offline tool for makers, writers, coders, game creators, and worldbuilders
- a Praecursor Labs product, not a generic Electron app

## Brand References

Praecursor Labs public positioning:

- local-first
- creator-focused
- independent
- practical releases now, larger builds over time
- software tools, PL Creators Suite, and Pyros ecosystem development
- offline-first desktop creator workflows
- integrated local AI assistant planned

## Desired App Feel

The app should feel:

- polished
- technical
- calm
- creator-focused
- dark
- modern
- organized
- beta-ready
- independent but professional

The app should not feel:

- like a raw dev test UI
- like unrelated panels stacked together
- like a generic admin dashboard
- like a game launcher
- like a corporate office suite clone
- like a final commercial app pretending all features are finished

## Visual Direction

### Base Theme

Use a dark graphite / near-black base.

Suggested direction:

- app background: deep black/graphite
- panels: dark slate
- cards: slightly lighter dark slate
- borders: subtle gray/cyan
- primary accent: Praecursor cyan/teal
- secondary accent: soft purple/magenta
- warning accent: amber
- danger accent: red
- success accent: green

### Branding Tone

Suggested header wording:

```text
PL Creators Suite
by Praecursor Labs
v1 Beta · Offline-first

Top App Bar
- Current project actions
- App-level actions
- Maybe project status

Left Sidebar
- Brand block
- Slice navigation
- Project summary
- Utility panel shortcuts/status

Main Workspace
- Current slice
- Slice list column
- Editor/viewport/timeline/grid/document area
- Optional inspector area

Bottom Drawer
- Copilot
- Physics/Simulation
- Advanced diagnostics

Slice Header
- Slice title
- Project path or project status
- New / Open / Export actions

Resource List Column
- documents, sheets, code files, games, movies, model scenes

Main Editor Area
- selected file/scene/sheet/game/model/timeline

Context Actions
- save, close, delete, preview, run, etc.

Per-Slice Polish Targets
Code IDE
Improve empty state.
Make code file list cleaner.
Make editor area feel more like a code editor.
Improve saved/dirty status.
Keep current basic create/open/save flow.
Docs
Improve empty state.
Make document editor feel more intentional.
Use better document card/list styling.
Keep simple markdown/text foundation.
Sheets
Improve sheet grid styling.
Make grid scroll behavior clean.
Improve row/column controls.
Keep current basic editable grid foundation.
Game Studio
Clean Runtime Preview styling.
Rename/debug-soften Runtime Debug area.
Improve forms for scenes/entities.
Improve scene graph visual hierarchy.
Keep game runtime foundations visible but not overwhelming.
Movie Studio
Clean timeline preview area.
Improve clip list/timeline card styling.
Rename engine/debug labels where needed.
Make playback controls feel more polished.
Modeling Studio
Clean viewport controls.
Improve transform inspector layout.
Rename Viewport Stub to Viewport if still present.
Make Modeling Engine diagnostics less visually dominant.
Keep Three.js viewport as the core visual focus.
Utility Panel Polish Targets
Local AI
Show as a clean status card.
Use Available / Not configured / Error states.
Keep provider/model/host visible but less cramped.
System Status
Show as compact health/status summary.
Plugin System / Installed Plugins / Local AI / Cloud Sync can be status chips.
Assets
Simplify asset import form.
Make asset count and registry status clear.
Use cleaner import buttons.
Workflows
Template list should not overwhelm sidebar.
Consider a compact workflow summary in sidebar and expanded workflow manager later.
Keep delete action with confirmation.
Make run results readable.
Plugins
Show plugin count and enabled state.
Hide noisy details unless expanded.
Branding Requirements

Before v1 beta, add:

stronger app title block
Praecursor Labs attribution
offline-first beta badge
consistent accent color
branded empty states
branded About/status text
possibly logo/icon placement if available
Download Readiness Requirements

Before public beta download:

renderer production build passes
desktop launches from packaged build
Linux package works
Windows build works in VM
project create/open/import/export works
each slice create/open/save works
workflow create/open/save/delete/run works
local AI unavailable/available states do not crash
plugins missing registry error is fixed or handled gracefully
release notes exist
known limitations doc exists
website download copy exists
GitHub release copy exists
Known Current Release Blockers
UI still appears too developer/test oriented.
Sidebar is overloaded.
Some panels are cramped.
Plugin registry temp rename error appears in status.
Packaging path needs audit.
Windows VM test has not been done yet.
Download instructions are not finalized.
What Can Wait Until After v1 Beta
full workflow graph editor
real automatic onSave/onExport workflow execution
cloud workflow execution
plugin marketplace install flow
extension marketplace
final mesh editing tools
full game renderer/input/scripting systems
final movie export/render pipeline
advanced spreadsheet formulas
full docs formatting system
final AI assistant intelligence polish

Stage 6 Proposed Waves
Wave 33 — UI/branding/download audit

Create this audit and lock the v1 beta direction.

Wave 34 — Global design tokens + branded theme foundation

Add theme variables, brand colors, spacing, card styles, button styles, and reusable visual patterns.

Wave 35 — App shell + sidebar polish

Improve brand block, sidebar navigation, project info, status cards, and panel grouping.

Wave 36 — Shared UI elements polish

Improve buttons, inputs, cards, empty states, headers, badges, chips, and scroll regions.

Wave 37 — Slice polish pass 1

Polish Code IDE, Docs, and Sheets.

Wave 38 — Slice polish pass 2

Polish Game Studio, Movie Studio, and Modeling Studio.

Wave 39 — Utility/advanced panels polish

Polish Local AI, System Status, Assets, Workflows, Plugins, Copilot, Physics, and diagnostics.

Wave 40 — Packaging/download readiness audit

Inspect package scripts and choose Linux/Windows packaging path.

Wave 41 — Linux downloadable build

Create and test Linux build artifact.

Wave 42 — GitHub + website download prep

Prepare release notes, website text, GitHub release copy, and known limitations.

Wave 43 — Windows VM test pass

Build/test on Windows VM and fix OS-specific issues.

Wave 44 — v1 beta readiness validation

Final validation doc before public download.

Stage 6 Definition of Done

Stage 6 is complete when:

the app looks like a branded Praecursor Labs creator platform
the app is usable at normal laptop/desktop sizes
core slice workflows still work
project create/open/import/export works
workflow foundations still work
Linux build is downloadable
Windows VM test passes or has documented blockers
website/GitHub download materials are ready
v1 beta readiness validation is complete
Final Direction

Stage 6 should make PL Creators Suite feel like a real v1 beta product.

The priority is professional presentation, brand consistency, usability, packaging, and download readiness.
