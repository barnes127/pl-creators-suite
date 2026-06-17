# Stage 2 Validation — v0.1.0-alpha

## Stage 2 Scope

Stage 2 focused on making PL Creators Suite extensible, shippable, and AI-ready.

## Plugin Platform

- [x] Plugin registry exists
- [x] Plugin manifest schema exists
- [x] Plugin discovery works
- [x] Invalid manifests can be rejected
- [x] Plugin enable/disable state works
- [x] Plugin status appears in UI
- [x] Sample plugin fixture is discoverable

## Entitlements / Feature Flags

- [x] Feature flag service exists
- [x] System status appears in UI
- [x] Plugin system status is visible
- [x] Local AI runtime status is visible
- [x] Cloud sync is clearly disabled for now

## Packaging / Release

- [x] Renderer production build works
- [x] Linux AppImage build works
- [x] AppImage launches
- [x] Packaged renderer loads correctly
- [x] App metadata/version appears in UI
- [x] App icon is configured
- [x] Manual release workflow exists
- [x] Release checklist exists

## Local AI

- [x] Local AI service exists
- [x] Ollama provider detection works
- [x] Model list/status works
- [x] AI chat RPC works
- [x] Copilot UI can send prompts
- [x] Copilot response displays in app
- [x] Project context is gated behind explicit permission

## Workspace Layout Foundation

- [x] Sidebar panels are collapsible
- [x] System status labels are clear
- [x] Copilot moved to bottom drawer
- [x] Copilot drawer opens/closes
- [x] Layout state persists between launches

## Project Lifecycle Regression

- [x] App boots
- [x] Create Project works
- [x] Open Project works
- [x] Recent Projects works
- [x] Export .plproj works
- [x] Import .plproj works
- [x] Export Logs works
- [x] Native menus work
- [x] Keyboard shortcuts work
- [x] Window state persists

## Known Limitations

- Plugin execution is not enabled yet.
- Sample plugin is a fixture and not a production plugin.
- Local AI depends on Ollama or another local runner being available.
- Project context permission exists, but file reading/project summarization is not implemented yet.
- Cloud sync is disabled.
- Linux AppImage is the only packaged release target for now.
- Workspace layout is foundational, not a full docking system.

## Result

PASS

Stage 2 is complete enough to tag as v0.1.0-alpha and begin Stage 3 app slices.
