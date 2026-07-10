# Stage 6 — CSS Consolidation Audit

## Status

Planning / audit complete before deeper slice polish.

## Purpose

The Stage 6 UI polish work added a stronger Praecursor Labs visual identity to PL Creators Suite.

However, `apps/renderer/src/app.css` has grown quickly because several UI polish waves were added as bottom-of-file override blocks. This was safe for fast development, but it can create duplicated selectors, unclear rule ownership, and harder future maintenance.

Wave 36.5 defines how CSS should be organized before continuing deeper UI polish.

## Current CSS Situation

Current CSS includes:

- base shell layout
- sidebar layout
- navigation styling
- topbar/statusbar styling
- modal styling
- shared buttons and inputs
- workspace headers
- docs/code/sheets styling
- movie styling
- modeling styling
- game styling
- physics/simulation styling
- copilot drawer styling
- Stage 6 brand theme overrides
- Stage 6 sidebar branding polish
- Stage 6 shared UI element polish

This works, but the file is becoming long and override-heavy.

## Problems To Avoid

Avoid continuing to add large bottom-of-file CSS blocks for every wave.

Potential risks:

- duplicated `.btn` rules
- duplicated `.input` rules
- duplicated `.emptyState` rules
- duplicated `.workspaceHeader` rules
- difficulty knowing which rule wins
- accidental style regressions
- harder slice-specific polish later
- harder packaging/beta stabilization later

## CSS Organization Target

Future CSS should be organized in this order:

```text
1. Theme tokens
2. Base/reset styles
3. App shell
4. Sidebar / navigation / brand
5. Shared UI elements
6. Workspace layout
7. Modals
8. Drawers / advanced tools
9. Docs slice
10. Code slice
11. Sheets slice
12. Movie slice
13. Modeling slice
14. Game slice
15. Workflows/assets/plugins/local AI utility panels
16. Responsive rules

Future Preferred File Structure

Long term, split CSS into smaller files:

apps/renderer/src/styles/theme.css
apps/renderer/src/styles/base.css
apps/renderer/src/styles/shell.css
apps/renderer/src/styles/sidebar.css
apps/renderer/src/styles/shared-ui.css
apps/renderer/src/styles/workspace.css
apps/renderer/src/styles/drawers.css
apps/renderer/src/styles/slices/docs.css
apps/renderer/src/styles/slices/code.css
apps/renderer/src/styles/slices/sheets.css
apps/renderer/src/styles/slices/movie.css
apps/renderer/src/styles/slices/modeling.css
apps/renderer/src/styles/slices/game.css
apps/renderer/src/styles/utilities.css

Then App.tsx or a central style entry can import them in order.

This should not happen immediately unless the app is already building and visually stable.

Immediate Rule For Future Waves

Starting after Wave 36.5:

Do not add giant override blocks to the bottom of app.css.
Make targeted edits inside the correct existing section.
Add only small new classes when needed.
Prefer reusable classes over one-off inline styles.
Avoid replacing entire files unless the file is brand new.
Avoid deleting large CSS sections until after visual comparison.
Selectors To Watch

These selectors are likely duplicated or overridden and should be consolidated later:

.btn
.btn-primary
.btn-ghost
.dangerBtn
.input
.emptyState
.workspaceHeader
.workspaceActions
.panelTitle
.recentItem
.recentList
.card
.sidebarFooter
.copilotDrawer
.physicsDrawer
Refactor Strategy

Use a safe multi-pass approach:

Pass 1 — Audit

Identify duplicate selectors and high-risk override areas.

Pass 2 — Section Comments

Add clearer section headers in app.css.

Pass 3 — Consolidate Shared UI

Merge repeated button/input/empty-state rules.

Pass 4 — Split CSS Files

Only after the app is visually stable, move sections into smaller CSS files.

Pass 5 — Regression Check

After each split, run:

pnpm --filter renderer build

Then visually check:

Sidebar
Topbar
Statusbar
Code
Docs
Sheets
Movie
Modeling
Game
Workflows
Assets
Local AI
Plugins
Copilot
Simulation Tools
App.tsx Relationship

The CSS consolidation should happen before or alongside splitting App.tsx.

App.tsx is large enough that it should be split before public beta packaging.

Recommended split order:

1. SidebarBrand
2. ProjectSummary
3. SidebarPanels
4. Topbar
5. CopilotDrawer
6. SimulationToolsDrawer
7. WorkflowPanel
8. AssetPanel
9. SystemStatusPanel
10. LocalAiPanel

Avoid trying to split every slice at once.

App.tsx Split Recommendation

Do not split App.tsx during Wave 36.5.

Recommended timing:

Wave 37 — Code / Docs / Sheets visual polish
Wave 38 — Game / Movie / Modeling visual polish
Wave 39 — Utility panel polish
Wave 40 — App.tsx shell/component split
Wave 41 — Packaging/download readiness audit

This keeps the split before packaging, but after the UI direction is clear.

Definition of Done For Wave 36.5

Wave 36.5 is complete when:

CSS audit doc exists.
Build passes.
Future CSS organization rules are documented.
App.tsx split strategy is documented.
No major CSS rewrite has been attempted yet.
The project has a safer path forward for UI polish.
