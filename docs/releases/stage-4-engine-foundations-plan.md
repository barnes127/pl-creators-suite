# Stage 4 Engine Foundations Plan

## Status

Stage 4 begins the core engine-building phase for PL Creators Suite.

Stage 3 established the six primary app slices as project-local data editors. Stage 4 upgrades those slices into early functional engines that can preview, evaluate, simulate, render, or run their data.

## Stage 4 Goal

Build foundational v1 engines for:

- Docs
- Spreadsheets
- Code IDE
- Movie / Animation Studio
- Modeling Studio
- Game Studio
- Physics / Simulation

The goal is not to fully match mature professional software yet. The goal is to build real internal engine foundations that point in that direction.

## Stage 4 Engine Reference Matrix

| PL Engine / Slice | Reference Apps | What to Match for v1 Core Functionality | What Not to Chase Yet |
| --- | --- | --- | --- |
| Docs Engine | Google Docs, Microsoft Word, Obsidian | clean writing, headings, lists, tables/images foundation, document stats, export contract, structure model | full live collaboration, complete revision history |
| Spreadsheets Engine | Google Sheets, Microsoft Excel, LibreOffice Calc | grid editing, formulas foundation, cell references, CSV import/export, sheets/tabs foundation, sorting/filtering foundation | macros, Power Query-level tooling, enterprise analytics |
| Code IDE Engine | VS Code, JetBrains Lite, Zed | file tree, editor tabs, syntax highlighting, search, terminal/task bridge, run task contract | full JetBrains-level intelligence for every language |
| Movie / Animation Engine | DaVinci Resolve, Premiere Pro, Blender timeline | media bin foundation, timeline engine, tracks, clips, trimming data, keyframes, play/pause/stop, scrubber, preview-state engine, export contract | full VFX, compositing, color grading studio |
| Modeling Engine | Blender, SketchUp, Shapr3D/Fusion feel | viewport, primitives, transforms, object hierarchy, selection, camera/view state, material stubs, import/export foundation | sculpting, simulations, full CAD solver, photoreal rendering |
| Game Studio Engine | Godot, Unity, Construct/GameMaker | scene graph, entities/nodes, inspector, component model, play/test mode, simple runtime loop, script hooks, asset hooks, export contract | Unreal/Unity-scale production pipeline |
| Physics / Simulation Engine | Wolfram, Mathematica-style computation, game physics foundations | vectors, units, expressions, kinematics, forces, gravity, collision foundation, simulation stepping, reusable solver helpers | full Wolfram replacement, advanced symbolic math, finite element simulation |

## Core Stage 4 Principle

Stage 4 should not add fake buttons.

Every major engine feature should have a real internal function behind it.

Examples:

- A Movie play button should advance timeline time and calculate active clips.
- A Modeling object should render visually in a viewport, not only exist as JSON.
- A Game play mode should run a basic update loop.
- Physics should provide reusable computation helpers, not only be listed as a future idea.

## Current Stage 3 Foundation

Stage 3 produced project-local formats and workflows:

- Docs: `.md`
- Code IDE: project-local code files
- Spreadsheets: `.plsheet.json`
- Movie / Animation Studio: `.plmovie.json`
- Modeling Studio: `.plmodel.json`
- Game Studio: `.plgame.json`

Stage 4 engines should consume and operate on those existing formats instead of replacing them.

## Proposed Engine Folder Structure

```text
apps/renderer/src/engines/
  shared/
    engineTypes.ts
    ids.ts
    time.ts
    vectors.ts

  physics/
    vector2.ts
    vector3.ts
    units.ts
    kinematics.ts
    forces.ts
    collision2d.ts
    simulationStep.ts
    expressions.ts

  movie/
    timelineEngine.ts
    playback.ts
    keyframes.ts

  modeling/
    primitives.ts
    transforms.ts
    sceneProjection.ts
    viewportState.ts

  game/
    components.ts
    entityRuntime.ts
    sceneRuntime.ts
    runtime.ts

  docs/
    documentStats.ts
    documentStructure.ts

  sheets/
    cellRefs.ts
    formulaEngine.ts
    sheetModel.ts

  code/
    codeMetadata.ts
    taskContracts.ts
