# Stage 6 — Wave 39.5 Beta UI Fix Pass

## Purpose

Wave 39.5 fixes the final obvious beta UI layout issues before App.tsx splitting and packaging.

This pass intentionally avoids new features and avoids redesigning the bottom drawers.

## Scope

Completed items:

- stabilized shell layout
- made sidebar independently scrollable
- kept topbar stable
- kept main workspace as the primary scroll region
- removed duplicate workspace header project action buttons
- updated beta-facing slice subtitles
- changed app title from renderer to PL Creators Suite Beta
- collapsed Game and Modeling diagnostics by default

## Files

Expected touched files:

- `apps/renderer/src/app.css`
- `apps/renderer/src/App.tsx`
- `apps/renderer/index.html`
- `apps/desktop/main.js`
- `docs/releases/stage-6-beta-ui-fix-pass.md`

## Validation Checklist

- Sidebar stays usable while long Game/Movie/Modeling content scrolls.
- Sidebar can scroll independently when tool panels are open.
- Topbar stays visible.
- Main workspace scrolls as one full workspace.
- Bottom drawers still look the same as before this pass.
- Workspace header no longer duplicates New/Open/Export actions.
- Slice subtitles no longer use “later” wording.
- Window title no longer says renderer.
- Game diagnostics are collapsed by default.
- Modeling diagnostics are collapsed by default.
- Code, Docs, Sheets still create/open/save/close.
- Game, Movie, Modeling still create/open/save/close.
- Local Copilot and Simulation Tools still open.

## Result

Wave 39.5 makes the beta layout more stable and presentable before the App.tsx component split and packaging work.
