# Renderer Architecture

## Purpose

The renderer is responsible for PL Creators Suite user-interface orchestration and local creator-engine interaction.

The renderer must not directly expose privileged operating-system capabilities.

Privileged operations cross the desktop RPC boundary.

## Layers

### App Shell

`apps/renderer/src/App.tsx`

Responsibilities:

- application-level state
- project orchestration
- RPC-facing handlers
- global drawers and utilities
- workspace routing
- engine orchestration shared with workspace UI

`App.tsx` should not contain the full presentation markup for individual creator workspaces.

## Workspace Components

Located in:

`apps/renderer/src/components/workspaces/`

Current workspaces:

- CodeWorkspace
- DocsWorkspace
- SheetsWorkspace
- MovieWorkspace
- ModelingWorkspace
- GameWorkspace

Workspace components primarily own presentation and interaction wiring.

They receive state and callbacks through props.

They must not directly import the renderer RPC client.

## Workspace Failure Isolation

`WorkspaceErrorBoundary` isolates React render failures inside the active workspace.

A workspace render failure should produce a visible error state without crashing the entire renderer.

This is UI-level failure isolation only.

It does not provide process isolation for engines, workers, Electron, or backend services.

## Engine Boundary

Creator engines live under:

`apps/renderer/src/engines/`

Current major engine areas include:

- shared
- physics
- movie
- modeling
- game
- workflows

Engine state and mutation may remain in the workspace orchestration layer where needed.

Workspace UI components receive derived engine state and callbacks rather than constructing privileged backend operations themselves.

## RPC Boundary

Renderer RPC access is centralized through:

`apps/renderer/src/rpc.ts`

Workspace presentation components must not call RPC directly.

Application orchestration invokes RPC and passes resulting state or callbacks downward.

## Navigation

Navigation configuration is defined in:

`apps/renderer/src/config/navigation.ts`

## Shared Application Types

Shared renderer application types are defined in:

`apps/renderer/src/types/app.ts`

## Current Architecture Rule

The intended dependency direction is:

App orchestration
→ workspace presentation
→ reusable UI

and:

App / workspace orchestration
→ creator engines

and:

App orchestration
→ renderer RPC client
→ desktop RPC boundary
→ desktop services

Privileged desktop services must not be imported into renderer code.

## Known Remaining Work

- continue reducing orchestration debt in `App.tsx` only when useful
- improve bundle splitting and lazy loading later
- strengthen engine and worker failure isolation in later architecture phases
- maintain renderer architecture tests as new workspaces and platform surfaces are added
