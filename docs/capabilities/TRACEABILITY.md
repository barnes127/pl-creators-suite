# PL Creators Suite Capability Traceability Report

Generated from the authoritative capability registry under `docs/capabilities/registry/`.

This report is the Wave 1.1.2 no-omission traceability snapshot for the Official Version 1 development blueprint.

## Registry Summary

- Total capabilities: 329
- Registry files: 18

### Status

- complete: 27
- missing: 247
- partial: 55

### Milestones

- v1.1.3: 2
- v1.1.4: 1
- v1.2: 17
- v1.3: 12
- v1.3.1: 13
- v1.3.2: 5
- v1.3.3: 3
- v1.3.4: 4
- v1.3.5: 6
- v1.3.6: 6
- v1.4: 13
- v1.4.1: 8
- v1.4.2: 3
- v1.4.3: 6
- v1.4.4: 2
- v1.4.5: 5
- v1.4.6: 1
- v1.5: 15
- v1.5.1: 11
- v1.5.2: 4
- v1.5.3: 4
- v1.5.4: 2
- v1.5.5: 1
- v1.6: 11
- v1.6.1: 7
- v1.6.2: 2
- v1.6.3: 3
- v1.6.4: 3
- v1.6.5: 3
- v1.6.6: 1
- v1.7: 16
- v1.7.1: 4
- v1.7.2: 3
- v1.7.3: 2
- v1.7.4: 3
- v1.7.5: 3
- v1.7.6: 2
- v1.8: 19
- v1.8.1: 6
- v1.8.2: 5
- v1.8.3: 4
- v1.8.4: 5
- v1.8.5: 3
- v1.8.6: 1
- v1.9: 7
- v1.10: 3
- v1.11: 6
- v1.12: 6
- v1.15: 11
- v1.16: 9
- v1.17: 10
- v1.18: 8
- v1.19: 9
- v1.20: 10

### Domains

- AI: 9
- ANIM: 20
- BRIDGE: 12
- CENTER: 11
- CLOUD: 9
- CODE: 27
- COLLAB: 10
- CORE: 30
- DOC: 38
- ENG: 23
- EXT: 10
- GAME: 27
- LAB: 8
- MODEL: 22
- PHYS: 18
- SHEET: 29
- TERM: 15
- XSLICE: 11

## Capability Traceability

| Capability ID | Domain | Area | Status | Milestone | Registry | Implementation | Validation | Dependencies |
|---|---|---|---|---|---|---|---|---|
|  PL-DOC-FILE-001 | DOC | file-management | complete | v1.3.1 | docs.json | apps/desktop/services/docs/index.js<br>apps/renderer/src/App.tsx | — | — |
| PL-AI-ACTION-001 | AI | actions | missing | v1.16 | copilot.json | — | — | PL-CORE-COMMAND-001<br>PL-CORE-PERMISSION-001<br>PL-CORE-HISTORY-001 |
| PL-AI-AUDIT-001 | AI | safety | missing | v1.16 | copilot.json | — | — | PL-AI-ACTION-001<br>PL-CORE-HISTORY-001<br>PL-CORE-DIAG-001 |
| PL-AI-CONTEXT-001 | AI | context | missing | v1.16 | copilot.json | — | — | PL-CORE-PROJECT-001<br>PL-CORE-PERMISSION-001<br>PL-ENG-INDEX-001 |
| PL-AI-EVAL-001 | AI | validation | missing | v1.16 | copilot.json | — | — | PL-AI-PROVIDER-001<br>PL-AI-PRIVACY-001<br>PL-AI-ACTION-001 |
| PL-AI-MEMORY-001 | AI | memory | missing | v1.16 | copilot.json | — | — | PL-AI-CONTEXT-001<br>PL-ENG-INDEX-001 |
| PL-AI-PRIVACY-001 | AI | privacy | missing | v1.16 | copilot.json | — | — | PL-AI-CONTEXT-001<br>PL-CORE-PERMISSION-001 |
| PL-AI-PROVIDER-001 | AI | providers | partial | v1.16 | copilot.json | — | — | PL-CORE-AI-001<br>PL-CORE-RPC-001 |
| PL-AI-ROUTE-001 | AI | routing | missing | v1.16 | copilot.json | — | — | PL-AI-PROVIDER-001 |
| PL-AI-SLICE-001 | AI | integration | missing | v1.16 | copilot.json | — | — | PL-AI-ACTION-001<br>PL-CENTER-CMD-001<br>PL-TERM-AI-001<br>PL-ENG-WORKFLOW-001 |
| PL-ANIM-2D-001 | ANIM | 2d-animation | missing | v1.7.3 | animation.json | — | — | — |
| PL-ANIM-3D-001 | ANIM | 3d-animation | missing | v1.7.2 | animation.json | — | — | PL-MODEL-XFORM-001<br>PL-ANIM-KEY-001 |
| PL-ANIM-AI-001 | ANIM | ai | missing | v1.11 | animation.json | — | — | PL-CORE-AI-001 |
| PL-ANIM-ASSET-001 | ANIM | assets | missing | v1.7.6 | animation.json | — | — | PL-CORE-ASSET-001 |
| PL-ANIM-AUDIO-001 | ANIM | audio | partial | v1.7.5 | animation.json | — | docs/releases/stage-3-movie-studio-v0-validation.md | PL-CORE-MEDIA-001 |
| PL-ANIM-CAMERA-001 | ANIM | cinematics | missing | v1.7.4 | animation.json | — | — | PL-MODEL-VIEW-002 |
| PL-ANIM-CURVE-001 | ANIM | animation | missing | v1.7.2 | animation.json | — | — | PL-ANIM-KEY-001 |
| PL-ANIM-FILE-001 | ANIM | file-management | complete | v1.7.1 | animation.json | apps/renderer/src/App.tsx | docs/releases/stage-3-movie-studio-v0-validation.md | — |
| PL-ANIM-FX-001 | ANIM | effects | missing | v1.7.5 | animation.json | — | — | PL-CORE-RENDER-001 |
| PL-ANIM-KEY-001 | ANIM | animation | partial | v1.7.2 | animation.json | apps/renderer/src/engines/movie/keyframes.ts | docs/releases/stage-4-movie-animation-engine-validation.md | — |
| PL-ANIM-MOTION-001 | ANIM | motion-graphics | missing | v1.7.4 | animation.json | — | — | — |
| PL-ANIM-PLAY-001 | ANIM | playback | partial | v1.7.1 | animation.json | apps/renderer/src/engines/movie/playback.ts<br>apps/renderer/src/engines/movie/previewEngine.ts | docs/releases/stage-4-movie-animation-engine-validation.md | — |
| PL-ANIM-PROD-001 | ANIM | production | partial | v1.7.1 | animation.json | — | — | — |
| PL-ANIM-RECOVERY-001 | ANIM | recovery | missing | v1.12 | animation.json | — | — | PL-CORE-HISTORY-001 |
| PL-ANIM-RENDER-001 | ANIM | rendering | missing | v1.7.6 | animation.json | — | — | PL-CORE-RENDER-001<br>PL-CORE-TASK-001 |
| PL-ANIM-RIG-001 | ANIM | rigging | missing | v1.7.3 | animation.json | — | — | PL-MODEL-SCENE-001 |
| PL-ANIM-STORY-001 | ANIM | storyboard | missing | v1.7.4 | animation.json | — | — | — |
| PL-ANIM-TIMELINE-001 | ANIM | timeline | partial | v1.7.1 | animation.json | apps/renderer/src/engines/movie/timelineEngine.ts<br>apps/renderer/src/engines/movie/timelineLayout.ts<br>apps/renderer/src/engines/movie/timelineActivity.ts | docs/releases/stage-4-movie-animation-engine-validation.md | — |
| PL-ANIM-VIDEO-001 | ANIM | video | partial | v1.7.5 | animation.json | apps/renderer/src/engines/movie/timelineEngine.ts | — | PL-CORE-MEDIA-001 |
| PL-ANIM-XSLICE-001 | ANIM | cross-slice | missing | v1.9 | animation.json | — | — | PL-CORE-LINK-001 |
| PL-BRIDGE-CLI-001 | BRIDGE | cli | missing | v1.4 | command-bridge.json | — | — | PL-CORE-COMMAND-001 |
| PL-BRIDGE-ENGINE-001 | BRIDGE | engine-commands | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-PROJECT-001<br>PL-CORE-COMMAND-001<br>PL-CORE-DIAG-001 |
| PL-BRIDGE-EXIT-001 | BRIDGE | contracts | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-CLI-001 |
| PL-BRIDGE-EXT-001 | BRIDGE | extensions | missing | v1.4 | command-bridge.json | — | — | PL-CORE-EXT-001<br>PL-CORE-PERMISSION-001<br>PL-CORE-COMMAND-001 |
| PL-BRIDGE-JOB-001 | BRIDGE | jobs | missing | v1.4 | command-bridge.json | — | — | PL-CORE-TASK-001<br>PL-CORE-DIAG-001 |
| PL-BRIDGE-OFFLINE-001 | BRIDGE | offline | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-CLI-001<br>PL-BRIDGE-PROJECT-001 |
| PL-BRIDGE-OUTPUT-001 | BRIDGE | output | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-CLI-001 |
| PL-BRIDGE-PROJECT-001 | BRIDGE | project | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-CLI-001<br>PL-CORE-PROJECT-001 |
| PL-BRIDGE-SEC-001 | BRIDGE | security | missing | v1.4 | command-bridge.json | — | — | PL-CORE-PERMISSION-001<br>PL-CORE-DIAG-001 |
| PL-BRIDGE-SHELL-001 | BRIDGE | shell | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-CLI-001 |
| PL-BRIDGE-SLICE-001 | BRIDGE | slice-commands | missing | v1.4 | command-bridge.json | — | — | PL-BRIDGE-PROJECT-001<br>PL-CORE-COMMAND-001 |
| PL-BRIDGE-WORKFLOW-001 | BRIDGE | workflows | missing | v1.4 | command-bridge.json | — | — | PL-CORE-COMMAND-001<br>PL-CORE-TASK-001 |
| PL-CENTER-CMD-001 | CENTER | commands | missing | v1.3 | command-center.json | — | — | PL-CORE-COMMAND-001<br>PL-CORE-TASK-001 |
| PL-CENTER-DASH-001 | CENTER | dashboard | missing | v1.3 | command-center.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-PROJECT-001 |
| PL-CENTER-HEALTH-001 | CENTER | diagnostics | missing | v1.3 | command-center.json | — | — | PL-CORE-DIAG-001 |
| PL-CENTER-JOB-001 | CENTER | jobs | missing | v1.3 | command-center.json | — | — | PL-CORE-TASK-001<br>PL-CORE-DIAG-001 |
| PL-CENTER-NOTIFY-001 | CENTER | notifications | missing | v1.3 | command-center.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-DIAG-001 |
| PL-CENTER-PROFILE-001 | CENTER | workspaces | missing | v1.3 | command-center.json | — | — | PL-CORE-SHELL-001 |
| PL-CENTER-SAFE-001 | CENTER | recovery | missing | v1.3 | command-center.json | — | — | PL-CORE-DIAG-001<br>PL-CORE-HISTORY-001<br>PL-CORE-EXT-001 |
| PL-CENTER-SEARCH-001 | CENTER | search | missing | v1.3 | command-center.json | — | — | PL-CORE-PROJECT-001<br>PL-CORE-ASSET-001 |
| PL-CENTER-SESSION-001 | CENTER | session | missing | v1.3 | command-center.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-HISTORY-001<br>PL-CORE-PROJECT-001 |
| PL-CENTER-WIDGET-001 | CENTER | widgets | missing | v1.3 | command-center.json | — | — | PL-CORE-SHELL-001 |
| PL-CENTER-WORKFLOW-001 | CENTER | workflows | missing | v1.3 | command-center.json | — | — | PL-CORE-COMMAND-001<br>PL-CORE-TASK-001<br>PL-CORE-DIAG-001 |
| PL-CLOUD-BILLING-001 | CLOUD | billing | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-IDENTITY-001<br>PL-CLOUD-ENTITLE-001 |
| PL-CLOUD-COMPUTE-001 | CLOUD | compute | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-PROVIDER-001<br>PL-CLOUD-BILLING-001<br>PL-AI-PROVIDER-001<br>PL-CORE-TASK-001 |
| PL-CLOUD-ENTITLE-001 | CLOUD | entitlements | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-IDENTITY-001<br>PL-EXT-OWN-001 |
| PL-CLOUD-IDENTITY-001 | CLOUD | identity | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-PROVIDER-001 |
| PL-CLOUD-MARKET-001 | CLOUD | marketplace | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-ENTITLE-001<br>PL-CLOUD-BILLING-001<br>PL-EXT-MARKET-001<br>PL-EXT-SIGN-001 |
| PL-CLOUD-OFFLINE-001 | CLOUD | offline | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-PROVIDER-001 |
| PL-CLOUD-PROVIDER-001 | CLOUD | providers | missing | v1.19 | cloud-services.json | — | — | PL-CORE-PERMISSION-001<br>PL-CORE-RPC-001 |
| PL-CLOUD-SELFHOST-001 | CLOUD | self-hosting | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-PROVIDER-001<br>PL-CORE-DIAG-001 |
| PL-CLOUD-SYNC-001 | CLOUD | sync | missing | v1.19 | cloud-services.json | — | — | PL-CLOUD-PROVIDER-001<br>PL-CLOUD-IDENTITY-001<br>PL-CORE-HISTORY-001<br>PL-CORE-PROJECT-001 |
| PL-CODE-AI-001 | CODE | ai | missing | v1.11 | code.json | — | — | PL-CORE-AI-001<br>PL-CORE-PERMISSION-001 |
| PL-CODE-DEBUG-001 | CODE | run-debug | missing | v1.5.3 | code.json | — | — | PL-CODE-RUN-001 |
| PL-CODE-DOC-001 | CODE | documentation | missing | v1.9 | code.json | — | — | PL-CORE-LINK-001 |
| PL-CODE-EDITOR-001 | CODE | editor | partial | v1.5.1 | code.json | apps/renderer/src/App.tsx | — | — |
| PL-CODE-EDITOR-002 | CODE | editor | missing | v1.5.1 | code.json | — | — | — |
| PL-CODE-EDITOR-003 | CODE | editor | partial | v1.5.1 | code.json | apps/renderer/src/App.tsx | — | — |
| PL-CODE-EDITOR-004 | CODE | editor | missing | v1.5.1 | code.json | — | — | — |
| PL-CODE-EDITOR-005 | CODE | editor | missing | v1.5.1 | code.json | — | — | — |
| PL-CODE-EDITOR-006 | CODE | editor | missing | v1.5.1 | code.json | — | — | PL-CORE-COMMAND-001 |
| PL-CODE-EXT-001 | CODE | extensions | partial | v1.10 | code.json | — | — | PL-CORE-EXT-001 |
| PL-CODE-FILE-001 | CODE | file-management | complete | v1.5.1 | code.json | apps/desktop/services/code/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-code-ide-v0-validation.md | — |
| PL-CODE-FILE-002 | CODE | file-management | complete | v1.5.1 | code.json | apps/desktop/services/code/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-code-ide-v0-validation.md | — |
| PL-CODE-FILE-003 | CODE | file-management | complete | v1.5.1 | code.json | apps/desktop/services/code/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-code-ide-v0-validation.md | — |
| PL-CODE-FILE-004 | CODE | workspace | missing | v1.5.1 | code.json | — | — | — |
| PL-CODE-GIT-001 | CODE | source-control | missing | v1.5.4 | code.json | — | — | — |
| PL-CODE-LANG-001 | CODE | language-services | complete | v1.5.1 | code.json | apps/renderer/src/App.tsx | docs/releases/stage-3-code-ide-v0-validation.md | — |
| PL-CODE-LANG-002 | CODE | language-services | missing | v1.5.2 | code.json | — | — | — |
| PL-CODE-LANG-003 | CODE | language-services | missing | v1.5.2 | code.json | — | — | PL-CODE-LANG-002 |
| PL-CODE-LANG-004 | CODE | language-services | missing | v1.5.2 | code.json | — | — | PL-CODE-LANG-002 |
| PL-CODE-LANG-005 | CODE | language-services | missing | v1.5.2 | code.json | — | — | — |
| PL-CODE-RECOVERY-001 | CODE | recovery | missing | v1.12 | code.json | — | — | PL-CORE-HISTORY-001 |
| PL-CODE-RUN-001 | CODE | run-debug | missing | v1.5.3 | code.json | — | — | PL-CODE-TASK-001 |
| PL-CODE-TASK-001 | CODE | tasks | missing | v1.5.3 | code.json | — | — | PL-CORE-TASK-001 |
| PL-CODE-TERM-001 | CODE | terminal | missing | v1.5.3 | code.json | — | — | PL-CORE-TASK-001 |
| PL-CODE-TEST-001 | CODE | testing | missing | v1.5.4 | code.json | — | — | PL-CORE-TASK-001 |
| PL-CODE-TRUST-001 | CODE | security | missing | v1.5.5 | code.json | — | — | PL-CORE-PERMISSION-001 |
| PL-CODE-XSLICE-001 | CODE | cross-slice | missing | v1.9 | code.json | — | — | PL-CORE-LINK-001 |
| PL-COLLAB-COMMUNITY-001 | COLLAB | community | missing | v1.20 | collaboration.json | — | — | PL-CLOUD-MARKET-001<br>PL-EXT-SIGN-001<br>PL-EXT-SDK-001 |
| PL-COLLAB-CONFLICT-001 | COLLAB | conflicts | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-MODEL-001<br>PL-CORE-HISTORY-001 |
| PL-COLLAB-GIT-001 | COLLAB | integration | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-MODEL-001 |
| PL-COLLAB-LAN-001 | COLLAB | transport | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-MODEL-001<br>PL-CLOUD-PROVIDER-001 |
| PL-COLLAB-MODEL-001 | COLLAB | data-model | missing | v1.20 | collaboration.json | — | — | PL-CLOUD-SYNC-001<br>PL-CORE-PROJECT-001<br>PL-CORE-PERMISSION-001 |
| PL-COLLAB-OFFLINE-001 | COLLAB | recovery | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-CONFLICT-001<br>PL-CLOUD-SYNC-001<br>PL-CORE-HISTORY-001 |
| PL-COLLAB-RC-001 | COLLAB | release-candidate | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-TEAM-001<br>PL-COLLAB-OFFLINE-001<br>PL-COLLAB-STACKSAFE-001<br>PL-COLLAB-COMMUNITY-001<br>PL-ENG-FREEZE-001 |
| PL-COLLAB-STACK-001 | COLLAB | extension-stacking | missing | v1.20 | collaboration.json | — | — | PL-EXT-RUNTIME-001<br>PL-EXT-MANIFEST-001<br>PL-ENG-WORKFLOW-001 |
| PL-COLLAB-STACKSAFE-001 | COLLAB | extension-stacking | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-STACK-001<br>PL-EXT-SAFE-001 |
| PL-COLLAB-TEAM-001 | COLLAB | teams | missing | v1.20 | collaboration.json | — | — | PL-COLLAB-MODEL-001<br>PL-CLOUD-IDENTITY-001 |
| PL-CORE-ACCESS-001 | CORE | accessibility | partial | v1.2 | core.json | — | — | PL-CORE-SHELL-001 |
| PL-CORE-AI-001 | CORE | ai | partial | v1.11 | core.json | — | — | PL-CORE-PERMISSION-001<br>PL-CORE-RPC-001 |
| PL-CORE-ASSET-001 | CORE | assets | partial | v1.2 | core.json | apps/desktop/services/assets/index.js | — | PL-CORE-PROJECT-001 |
| PL-CORE-CALC-001 | CORE | calculation | missing | v1.4 | core.json | — | — | — |
| PL-CORE-COMMAND-001 | CORE | commands | missing | v1.2 | core.json | — | — | PL-CORE-SHELL-001 |
| PL-CORE-DIAG-001 | CORE | diagnostics | partial | v1.2 | core.json | — | — | PL-CORE-RPC-001 |
| PL-CORE-EVENT-001 | CORE | events | missing | v1.2 | core.json | — | — | PL-CORE-RPC-001 |
| PL-CORE-EXT-001 | CORE | extensions | partial | v1.10 | core.json | apps/desktop/services/plugins/registry.js | — | PL-CORE-PERMISSION-001 |
| PL-CORE-GEOMETRY-001 | CORE | geometry | partial | v1.6 | core.json | apps/renderer/src/engines/modeling | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-CORE-HISTORY-001 | CORE | history | missing | v1.2 | core.json | — | — | PL-CORE-PROJECT-001 |
| PL-CORE-INDEX-001 | CORE | indexing | missing | v1.2 | core.json | — | — | PL-CORE-ASSET-001<br>PL-CORE-TASK-001 |
| PL-CORE-IO-001 | CORE | interchange | missing | v1.2 | core.json | — | — | PL-CORE-TASK-001 |
| PL-CORE-LINK-001 | CORE | links | missing | v1.9 | core.json | — | — | PL-CORE-ASSET-001<br>PL-CORE-PROJECT-001 |
| PL-CORE-MEDIA-001 | CORE | media | partial | v1.7 | core.json | — | — | PL-CORE-ASSET-001 |
| PL-CORE-MIGRATION-001 | CORE | project | complete | v1.1.3 | core.json | apps/desktop/services/project/migrations.js<br>apps/desktop/services/project/persistence.js<br>apps/desktop/services/project/integrity.js | scripts/project-format-test.js<br>docs/releases/wave-1.1.3-project-format-validation.md | — |
| PL-CORE-NOTIFY-001 | CORE | notifications | missing | v1.2 | core.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-EVENT-001 |
| PL-CORE-PERMISSION-001 | CORE | security | partial | v1.10 | core.json | — | — | — |
| PL-CORE-PHYSICS-001 | CORE | physics | partial | v1.8 | core.json | — | docs/releases/stage-4-physics-simulation-engine-validation.md | — |
| PL-CORE-PROJECT-001 | CORE | project | complete | v1.1.3 | core.json | apps/desktop/services/project/contract.js<br>apps/desktop/services/project/schemas.js<br>apps/desktop/services/project/persistence.js<br>apps/desktop/services/project/integrity.js<br>apps/desktop/services/projects.js | scripts/project-format-test.js<br>docs/releases/wave-1.1.3-project-format-validation.md | — |
| PL-CORE-RENDER-001 | CORE | rendering | partial | v1.7 | core.json | — | — | PL-CORE-TASK-001 |
| PL-CORE-RPC-001 | CORE | rpc | complete | v1.1.4 | core.json | apps/desktop/backend.js<br>apps/desktop/rpc/protocol.js<br>apps/desktop/rpc/errors.js<br>apps/desktop/rpc/contracts.js<br>apps/desktop/rpc/registry.js<br>apps/desktop/rpc/execution.js<br>apps/desktop/rpc/authorization.js<br>apps/desktop/rpc/logging.js<br>apps/renderer/src/rpc.ts | scripts/rpc-contract-test.js<br>scripts/rpc-execution-test.js<br>scripts/rpc-authorization-test.js<br>scripts/rpc-backend-integration-test.js<br>scripts/desktop-lifecycle-test.js<br>scripts/rpc-logging-test.js<br>docs/architecture/TRUST_BOUNDARIES.md<br>docs/architecture/FAILURE_ISOLATION.md | — |
| PL-CORE-SEARCH-001 | CORE | search | missing | v1.2 | core.json | — | — | PL-CORE-INDEX-001<br>PL-CORE-PROJECT-001 |
| PL-CORE-SERVICE-001 | CORE | services | missing | v1.2 | core.json | — | — | PL-CORE-PERMISSION-001<br>PL-CORE-RPC-001 |
| PL-CORE-SETTINGS-001 | CORE | settings | missing | v1.2 | core.json | — | — | PL-CORE-PROJECT-001 |
| PL-CORE-SHELL-001 | CORE | shell | partial | v1.2 | core.json | apps/renderer/src/App.tsx | — | — |
| PL-CORE-TASK-001 | CORE | tasks | partial | v1.2 | core.json | — | — | PL-CORE-RPC-001 |
| PL-CORE-TELEMETRY-001 | CORE | telemetry | missing | v1.2 | core.json | — | — | PL-CORE-DIAG-001<br>PL-CORE-PERMISSION-001 |
| PL-CORE-TEMPLATE-001 | CORE | templates | missing | v1.2 | core.json | — | — | PL-CORE-PROJECT-001<br>PL-CORE-IO-001 |
| PL-CORE-THEME-001 | CORE | ui-platform | missing | v1.2 | core.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-ACCESS-001 |
| PL-CORE-TIMELINE-001 | CORE | timeline | partial | v1.7 | core.json | apps/renderer/src/engines/movie/timelineEngine.ts<br>apps/renderer/src/engines/movie/keyframes.ts<br>apps/renderer/src/engines/movie/playback.ts | docs/releases/stage-4-movie-animation-engine-validation.md | — |
| PL-DOC-AI-001 | DOC | ai | missing | v1.3.6 | docs.json | — | — | PL-CORE-AI-001 |
| PL-DOC-COLLAB-001 | DOC | collaboration | missing | v1.3 | docs.json | — | — | — |
| PL-DOC-EDIT-001 | DOC | editor | complete | v1.3.1 | docs.json | apps/renderer/src/App.tsx | docs/releases/stage-3-docs-v0-validation.md | — |
| PL-DOC-EDIT-002 | DOC | editor | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-EDIT-003 | DOC | editor | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-EDIT-004 | DOC | editor | partial | v1.3.1 | docs.json | — | — | — |
| PL-DOC-EDIT-005 | DOC | editor | partial | v1.3.1 | docs.json | — | — | — |
| PL-DOC-EDIT-006 | DOC | editor | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-FILE-002 | DOC | file-management | complete | v1.3.1 | docs.json | apps/desktop/services/docs/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-docs-v0-validation.md | — |
| PL-DOC-FILE-003 | DOC | file-management | complete | v1.3.1 | docs.json | apps/desktop/services/docs/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-docs-v0-validation.md | — |
| PL-DOC-FILE-004 | DOC | file-management | complete | v1.3.1 | docs.json | apps/renderer/src/App.tsx | docs/releases/stage-3-docs-v0-validation.md | — |
| PL-DOC-FILE-005 | DOC | file-management | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-FILE-006 | DOC | file-management | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-FILE-007 | DOC | file-management | missing | v1.3.1 | docs.json | — | — | — |
| PL-DOC-FILE-008 | DOC | file-management | partial | v1.3.5 | docs.json | — | — | PL-CORE-HISTORY-001 |
| PL-DOC-HISTORY-001 | DOC | history | missing | v1.3.5 | docs.json | — | — | PL-CORE-HISTORY-001 |
| PL-DOC-IO-001 | DOC | interchange | partial | v1.3.6 | docs.json | — | — | — |
| PL-DOC-IO-002 | DOC | interchange | partial | v1.3.6 | docs.json | — | — | — |
| PL-DOC-LAYOUT-001 | DOC | layout | missing | v1.3.2 | docs.json | — | — | — |
| PL-DOC-LAYOUT-002 | DOC | layout | partial | v1.3.2 | docs.json | — | — | — |
| PL-DOC-LAYOUT-003 | DOC | layout | missing | v1.3.2 | docs.json | — | — | — |
| PL-DOC-LAYOUT-004 | DOC | layout | missing | v1.3.2 | docs.json | — | — | — |
| PL-DOC-LAYOUT-005 | DOC | layout | missing | v1.3.2 | docs.json | — | — | — |
| PL-DOC-OBJECT-001 | DOC | objects | partial | v1.3.3 | docs.json | — | — | — |
| PL-DOC-OBJECT-002 | DOC | objects | partial | v1.3.3 | docs.json | — | — | — |
| PL-DOC-OBJECT-003 | DOC | objects | missing | v1.3.3 | docs.json | — | — | — |
| PL-DOC-PRINT-001 | DOC | printing | missing | v1.3.6 | docs.json | — | — | — |
| PL-DOC-PROJECT-001 | DOC | project-integration | missing | v1.3.6 | docs.json | — | — | PL-CORE-ASSET-001 |
| PL-DOC-REF-001 | DOC | references | partial | v1.3.4 | docs.json | — | — | — |
| PL-DOC-REF-002 | DOC | references | missing | v1.3.4 | docs.json | — | — | — |
| PL-DOC-REF-003 | DOC | references | missing | v1.3.4 | docs.json | — | — | — |
| PL-DOC-REF-004 | DOC | references | missing | v1.3.4 | docs.json | — | — | — |
| PL-DOC-REVIEW-001 | DOC | review | missing | v1.3.5 | docs.json | — | — | — |
| PL-DOC-REVIEW-002 | DOC | review | missing | v1.3.5 | docs.json | — | — | — |
| PL-DOC-REVIEW-003 | DOC | review | missing | v1.3.5 | docs.json | — | — | — |
| PL-DOC-TEMPLATE-001 | DOC | templates | missing | v1.3.5 | docs.json | — | — | — |
| PL-DOC-XSLICE-001 | DOC | cross-slice | missing | v1.3.6 | docs.json | — | — | PL-CORE-LINK-001 |
| PL-ENG-BENCH-001 | ENG | benchmarks | missing | v1.6 | engines.json | — | — | PL-ENG-GOV-001<br>PL-CORE-TASK-001<br>PL-CORE-DIAG-001 |
| PL-ENG-CACHE-001 | ENG | resources | missing | v1.6 | engines.json | — | — | PL-ENG-RESOURCE-001 |
| PL-ENG-CALC-001 | ENG | calculation | missing | v1.7 | engines.json | — | — | PL-ENG-EXEC-001<br>PL-CORE-CALC-001 |
| PL-ENG-CODE-001 | ENG | code-runtime | missing | v1.7 | engines.json | — | — | PL-CORE-TASK-001<br>PL-CORE-COMMAND-001<br>PL-CORE-DIAG-001 |
| PL-ENG-CONTRACT-001 | ENG | contracts | missing | v1.6 | engines.json | — | — | PL-ENG-GOV-001<br>PL-CORE-RPC-001 |
| PL-ENG-DOC-001 | ENG | document-layout | missing | v1.7 | engines.json | — | — | PL-ENG-EXEC-001<br>PL-CORE-PROJECT-001 |
| PL-ENG-EXEC-001 | ENG | execution | missing | v1.6 | engines.json | — | — | PL-ENG-CONTRACT-001<br>PL-CORE-TASK-001 |
| PL-ENG-FAULT-001 | ENG | reliability | missing | v1.6 | engines.json | — | — | PL-ENG-CONTRACT-001<br>PL-CORE-DIAG-001 |
| PL-ENG-FREEZE-001 | ENG | contracts | missing | v1.7 | engines.json | — | — | PL-ENG-INTEGRATION-001<br>PL-ENG-CONTRACT-001 |
| PL-ENG-GAME-001 | ENG | game-runtime | partial | v1.7 | engines.json | apps/renderer/src/engines/game/ | docs/releases/stage-4-game-runtime-engine-validation.md | PL-ENG-SCENE-001<br>PL-ENG-EXEC-001<br>PL-ENG-RENDER-001 |
| PL-ENG-GEOMETRY-001 | ENG | geometry | partial | v1.7 | engines.json | apps/renderer/src/engines/modeling/ | docs/releases/stage-4-modeling-engine-validation.md | PL-ENG-SCENE-001<br>PL-ENG-EXEC-001<br>PL-CORE-GEOMETRY-001 |
| PL-ENG-GOV-001 | ENG | governance | missing | v1.6 | engines.json | — | — | PL-CORE-RPC-001 |
| PL-ENG-INDEX-001 | ENG | indexing | missing | v1.7 | engines.json | — | — | PL-ENG-RESOURCE-001<br>PL-CORE-PROJECT-001 |
| PL-ENG-INTEGRATION-001 | ENG | integration | missing | v1.7 | engines.json | — | — | PL-ENG-BENCH-001<br>PL-ENG-PROFILE-001<br>PL-ENG-GEOMETRY-001<br>PL-ENG-RENDER-001<br>PL-ENG-TIMELINE-001<br>PL-ENG-MEDIA-001<br>PL-ENG-GAME-001<br>PL-ENG-DOC-001<br>PL-ENG-CALC-001<br>PL-ENG-CODE-001<br>PL-ENG-WORKFLOW-001<br>PL-ENG-INDEX-001 |
| PL-ENG-MEDIA-001 | ENG | media | partial | v1.7 | engines.json | apps/renderer/src/engines/movie/ | docs/releases/stage-4-movie-animation-engine-validation.md | PL-ENG-TIMELINE-001<br>PL-CORE-MEDIA-001<br>PL-CORE-TASK-001 |
| PL-ENG-PLUGIN-001 | ENG | plugins | missing | v1.7 | engines.json | — | — | PL-ENG-CONTRACT-001<br>PL-CORE-EXT-001<br>PL-CORE-PERMISSION-001 |
| PL-ENG-PROFILE-001 | ENG | profiling | missing | v1.6 | engines.json | — | — | PL-ENG-BENCH-001<br>PL-CORE-DIAG-001 |
| PL-ENG-RECOVERY-001 | ENG | reliability | missing | v1.6 | engines.json | — | — | PL-ENG-FAULT-001<br>PL-CORE-HISTORY-001<br>PL-CENTER-HEALTH-001 |
| PL-ENG-RENDER-001 | ENG | rendering | partial | v1.7 | engines.json | apps/renderer/src/engines/modeling/ | docs/releases/stage-4-modeling-engine-validation.md | PL-ENG-SCENE-001<br>PL-ENG-EXEC-001<br>PL-CORE-RENDER-001 |
| PL-ENG-RESOURCE-001 | ENG | resources | partial | v1.6 | engines.json | apps/desktop/services/assets/index.js | — | PL-CORE-ASSET-001<br>PL-CORE-PROJECT-001 |
| PL-ENG-SCENE-001 | ENG | scene | partial | v1.6 | engines.json | apps/renderer/src/engines/modeling/ | docs/releases/stage-4-modeling-engine-validation.md | PL-ENG-RESOURCE-001<br>PL-CORE-PROJECT-001 |
| PL-ENG-TIMELINE-001 | ENG | timeline | partial | v1.7 | engines.json | apps/renderer/src/engines/movie/ | docs/releases/stage-4-movie-animation-engine-validation.md | PL-ENG-EXEC-001<br>PL-CORE-TIMELINE-001 |
| PL-ENG-WORKFLOW-001 | ENG | workflow | missing | v1.7 | engines.json | — | — | PL-CORE-COMMAND-001<br>PL-CORE-TASK-001 |
| PL-EXT-CATALOG-001 | EXT | catalog | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-MARKET-001<br>PL-EXT-OWN-001<br>PL-EXT-SDK-001 |
| PL-EXT-MANIFEST-001 | EXT | packages | partial | v1.17 | extensions-marketplace.json | — | — | PL-CORE-EXT-001 |
| PL-EXT-MARKET-001 | EXT | marketplace | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-REGISTRY-001<br>PL-EXT-SIGN-001 |
| PL-EXT-OWN-001 | EXT | ownership | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-REGISTRY-001 |
| PL-EXT-PERM-001 | EXT | permissions | partial | v1.17 | extensions-marketplace.json | — | — | PL-CORE-PERMISSION-001 |
| PL-EXT-REGISTRY-001 | EXT | registry | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-RUNTIME-001 |
| PL-EXT-RUNTIME-001 | EXT | runtime | partial | v1.17 | extensions-marketplace.json | — | — | PL-EXT-MANIFEST-001<br>PL-CORE-EXT-001<br>PL-ENG-PLUGIN-001 |
| PL-EXT-SAFE-001 | EXT | recovery | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-RUNTIME-001<br>PL-CORE-DIAG-001<br>PL-CORE-HISTORY-001 |
| PL-EXT-SDK-001 | EXT | sdk | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-RUNTIME-001<br>PL-EXT-PERM-001<br>PL-ENG-PLUGIN-001 |
| PL-EXT-SIGN-001 | EXT | trust | missing | v1.17 | extensions-marketplace.json | — | — | PL-EXT-MANIFEST-001<br>PL-EXT-PERM-001 |
| PL-GAME-AI-001 | GAME | ai | missing | v1.11 | game.json | — | — | PL-CORE-AI-001 |
| PL-GAME-ANIM-001 | GAME | animation | missing | v1.8.4 | game.json | — | — | PL-ANIM-KEY-001 |
| PL-GAME-ASSET-001 | GAME | assets | missing | v1.8.1 | game.json | — | — | PL-CORE-ASSET-001<br>PL-CORE-IO-001 |
| PL-GAME-AUDIO-001 | GAME | audio | partial | v1.8.4 | game.json | apps/renderer/src/engines/game/components.ts | docs/releases/stage-4-game-runtime-engine-validation.md | PL-CORE-MEDIA-001 |
| PL-GAME-BUILD-001 | GAME | build | missing | v1.8.6 | game.json | — | — | PL-CORE-TASK-001<br>PL-CORE-IO-001 |
| PL-GAME-DATA-001 | GAME | data | missing | v1.8.4 | game.json | — | — | — |
| PL-GAME-DIAG-001 | GAME | diagnostics | complete | v1.8.5 | game.json | apps/renderer/src/engines/game/state.ts<br>apps/renderer/src/App.tsx | docs/releases/stage-4-game-runtime-engine-validation.md | — |
| PL-GAME-EDIT2D-001 | GAME | scene-editing | missing | v1.8.2 | game.json | — | — | — |
| PL-GAME-EDIT3D-001 | GAME | scene-editing | missing | v1.8.2 | game.json | — | — | PL-MODEL-VIEW-001 |
| PL-GAME-ENTITY-001 | GAME | entities | complete | v1.8.1 | game.json | apps/renderer/src/engines/game/entities.ts<br>apps/renderer/src/engines/game/components.ts | docs/releases/stage-4-game-runtime-engine-validation.md | — |
| PL-GAME-EVENT-001 | GAME | events | missing | v1.8.3 | game.json | — | — | — |
| PL-GAME-FILE-001 | GAME | file-management | complete | v1.8.1 | game.json | apps/desktop/services/games/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-game-studio-v0-validation.md | — |
| PL-GAME-NAV-001 | GAME | navigation | missing | v1.8.4 | game.json | — | — | — |
| PL-GAME-PHYS-001 | GAME | physics | partial | v1.8.3 | game.json | apps/renderer/src/engines/game/components.ts | docs/releases/stage-4-game-runtime-engine-validation.md | PL-CORE-PHYSICS-001 |
| PL-GAME-PLAY-001 | GAME | runtime | complete | v1.8.1 | game.json | apps/renderer/src/engines/game/preview.ts | docs/releases/stage-4-game-runtime-engine-validation.md | — |
| PL-GAME-PREFAB-001 | GAME | prefabs | missing | v1.8.2 | game.json | — | — | — |
| PL-GAME-RECOVERY-001 | GAME | recovery | missing | v1.12 | game.json | — | — | PL-CORE-HISTORY-001 |
| PL-GAME-RENDER-001 | GAME | rendering | missing | v1.8.2 | game.json | — | — | PL-CORE-RENDER-001 |
| PL-GAME-RUNTIME-001 | GAME | runtime | complete | v1.8.1 | game.json | apps/renderer/src/engines/game/runtimeEngine.ts<br>apps/renderer/src/engines/game/state.ts | docs/releases/stage-4-game-runtime-engine-validation.md | — |
| PL-GAME-SAVE-001 | GAME | persistence | missing | v1.8.5 | game.json | — | — | PL-CORE-PROJECT-001 |
| PL-GAME-SCENE-001 | GAME | scenes | partial | v1.8.1 | game.json | apps/desktop/services/games/index.js<br>apps/renderer/src/engines/game/state.ts | docs/releases/stage-3-game-studio-v0-validation.md<br>docs/releases/stage-4-game-runtime-engine-validation.md | — |
| PL-GAME-SCRIPT-001 | GAME | scripting | partial | v1.8.3 | game.json | apps/renderer/src/engines/game/components.ts | docs/releases/stage-4-game-runtime-engine-validation.md | PL-CODE-RUN-001 |
| PL-GAME-TEST-001 | GAME | quality | partial | v1.8.5 | game.json | apps/renderer/src/App.tsx | docs/releases/stage-4-game-runtime-engine-validation.md | PL-CODE-DEBUG-001<br>PL-CODE-TEST-001 |
| PL-GAME-TILE-001 | GAME | level-design | missing | v1.8.2 | game.json | — | — | — |
| PL-GAME-UI-001 | GAME | ui | missing | v1.8.4 | game.json | — | — | — |
| PL-GAME-VSCRIPT-001 | GAME | scripting | missing | v1.8.3 | game.json | — | — | — |
| PL-GAME-XSLICE-001 | GAME | cross-slice | missing | v1.9 | game.json | — | — | PL-CORE-LINK-001 |
| PL-LAB-DATA-001 | LAB | data | missing | v1.18 | research-hardware.json | — | — | PL-LAB-DEVICE-001<br>PL-PHYS-UNITS-001<br>PL-CORE-TASK-001 |
| PL-LAB-DEVICE-001 | LAB | devices | missing | v1.18 | research-hardware.json | — | — | PL-EXT-SDK-001<br>PL-EXT-PERM-001 |
| PL-LAB-FIRMWARE-001 | LAB | firmware | missing | v1.18 | research-hardware.json | — | — | PL-LAB-DEVICE-001<br>PL-BRIDGE-CLI-001<br>PL-TERM-TRUST-001<br>PL-ENG-CODE-001 |
| PL-LAB-REPORT-001 | LAB | reporting | missing | v1.18 | research-hardware.json | — | — | PL-LAB-RESEARCH-001<br>PL-PHYS-NOTEBOOK-001 |
| PL-LAB-RESEARCH-001 | LAB | research | missing | v1.18 | research-hardware.json | — | — | PL-LAB-DATA-001<br>PL-PHYS-EXPERIMENT-001<br>PL-PHYS-VIS-001 |
| PL-LAB-TRACE-001 | LAB | diagnostics | missing | v1.18 | research-hardware.json | — | — | PL-LAB-WORKFLOW-001<br>PL-CENTER-JOB-001<br>PL-CORE-DIAG-001 |
| PL-LAB-TRIGGER-001 | LAB | orchestration | missing | v1.18 | research-hardware.json | — | — | PL-LAB-WORKFLOW-001 |
| PL-LAB-WORKFLOW-001 | LAB | workflow | missing | v1.18 | research-hardware.json | — | — | PL-ENG-WORKFLOW-001<br>PL-CORE-TASK-001 |
| PL-MODEL-AI-001 | MODEL | ai | missing | v1.11 | modeler.json | — | — | PL-CORE-AI-001 |
| PL-MODEL-ANIM-001 | MODEL | animation | missing | v1.6.5 | modeler.json | — | — | PL-CORE-TIMELINE-001 |
| PL-MODEL-ASSET-001 | MODEL | assets | missing | v1.6.3 | modeler.json | — | — | PL-CORE-ASSET-001 |
| PL-MODEL-FILE-001 | MODEL | file-management | complete | v1.6.1 | modeler.json | apps/desktop/services/models/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-modeling-studio-v0-validation.md | — |
| PL-MODEL-FILE-002 | MODEL | file-management | complete | v1.6.1 | modeler.json | apps/desktop/services/models/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-modeling-studio-v0-validation.md | — |
| PL-MODEL-GEO-001 | MODEL | geometry | partial | v1.6.2 | modeler.json | apps/desktop/services/models/index.js<br>apps/renderer/src/engines/modeling/sceneEngine.ts | docs/releases/stage-3-modeling-studio-v0-validation.md<br>docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-IO-001 | MODEL | interchange | missing | v1.6.6 | modeler.json | — | — | PL-CORE-IO-001 |
| PL-MODEL-MAT-001 | MODEL | materials | missing | v1.6.4 | modeler.json | — | — | PL-CORE-RENDER-001 |
| PL-MODEL-MESH-001 | MODEL | mesh | missing | v1.6.2 | modeler.json | — | — | PL-CORE-GEOMETRY-001 |
| PL-MODEL-MOD-001 | MODEL | modifiers | missing | v1.6.3 | modeler.json | — | — | PL-CORE-GEOMETRY-001 |
| PL-MODEL-PHYS-001 | MODEL | physics | partial | v1.6.5 | modeler.json | — | — | PL-CORE-PHYSICS-001 |
| PL-MODEL-RECOVERY-001 | MODEL | recovery | missing | v1.12 | modeler.json | — | — | PL-CORE-HISTORY-001 |
| PL-MODEL-RENDER-001 | MODEL | rendering | missing | v1.6.4 | modeler.json | — | — | PL-CORE-RENDER-001<br>PL-CORE-TASK-001 |
| PL-MODEL-SCENE-001 | MODEL | scene | partial | v1.6.3 | modeler.json | apps/renderer/src/engines/modeling/sceneEngine.ts | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-SELECT-001 | MODEL | selection | partial | v1.6.1 | modeler.json | apps/renderer/src/engines/modeling/sceneEngine.ts | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-UV-001 | MODEL | uv | missing | v1.6.4 | modeler.json | — | — | PL-MODEL-MESH-001 |
| PL-MODEL-VALIDATE-001 | MODEL | validation | missing | v1.6.5 | modeler.json | — | — | — |
| PL-MODEL-VIEW-001 | MODEL | viewport | complete | v1.6.1 | modeler.json | apps/renderer/src/engines/modeling/viewportEngine.ts<br>apps/renderer/src/engines/modeling/sceneEngine.ts | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-VIEW-002 | MODEL | viewport | partial | v1.6.1 | modeler.json | apps/renderer/src/engines/modeling/camera.ts | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-XFORM-001 | MODEL | transforms | complete | v1.6.1 | modeler.json | apps/renderer/src/engines/modeling/transforms.ts | docs/releases/stage-4-modeling-engine-validation.md | — |
| PL-MODEL-XFORM-002 | MODEL | transforms | partial | v1.6.1 | modeler.json | apps/renderer/src/engines/modeling/transforms.ts | — | — |
| PL-MODEL-XSLICE-001 | MODEL | cross-slice | missing | v1.9 | modeler.json | — | — | PL-CORE-LINK-001 |
| PL-PHYS-API-001 | PHYS | physics-core | partial | v1.8 | physics-research.json | — | docs/releases/stage-4-physics-simulation-engine-validation.md | PL-ENG-CONTRACT-001<br>PL-ENG-SCENE-001<br>PL-CORE-PHYSICS-001 |
| PL-PHYS-BACKEND-001 | PHYS | backends | missing | v1.8 | physics-research.json | — | — | PL-PHYS-API-001<br>PL-PHYS-MODE-001 |
| PL-PHYS-CONFORM-001 | PHYS | validation | missing | v1.8 | physics-research.json | — | — | PL-PHYS-RIGID-001<br>PL-PHYS-QUERY-001<br>PL-ENG-BENCH-001 |
| PL-PHYS-DIAG-001 | PHYS | diagnostics | missing | v1.8 | physics-research.json | — | — | PL-PHYS-RIGID-001<br>PL-CORE-DIAG-001 |
| PL-PHYS-EQUATION-001 | PHYS | computation | missing | v1.8 | physics-research.json | — | — | PL-PHYS-UNITS-001<br>PL-ENG-CALC-001 |
| PL-PHYS-ERROR-001 | PHYS | numerical-validation | missing | v1.8 | physics-research.json | — | — | PL-PHYS-NUMERIC-001<br>PL-CORE-DIAG-001 |
| PL-PHYS-EXPERIMENT-001 | PHYS | experiments | missing | v1.8 | physics-research.json | — | — | PL-PHYS-EQUATION-001<br>PL-PHYS-NUMERIC-001<br>PL-CORE-PROJECT-001 |
| PL-PHYS-MODE-001 | PHYS | execution-modes | missing | v1.8 | physics-research.json | — | — | PL-PHYS-API-001<br>PL-ENG-CONTRACT-001 |
| PL-PHYS-MODULE-001 | PHYS | research-modules | missing | v1.8 | physics-research.json | — | — | PL-PHYS-API-001<br>PL-PHYS-EXPERIMENT-001<br>PL-ENG-PLUGIN-001 |
| PL-PHYS-NATIVE-001 | PHYS | research-solvers | missing | v1.8 | physics-research.json | — | — | PL-PHYS-BACKEND-001<br>PL-PHYS-MODULE-001 |
| PL-PHYS-NOTEBOOK-001 | PHYS | research-workspace | missing | v1.8 | physics-research.json | — | — | PL-PHYS-EXPERIMENT-001<br>PL-PHYS-VIS-001 |
| PL-PHYS-NUMERIC-001 | PHYS | numerical-methods | missing | v1.8 | physics-research.json | — | — | PL-PHYS-EQUATION-001 |
| PL-PHYS-QUERY-001 | PHYS | rigid-body | missing | v1.8 | physics-research.json | — | — | PL-PHYS-RIGID-001 |
| PL-PHYS-RIGID-001 | PHYS | rigid-body | missing | v1.8 | physics-research.json | — | — | PL-PHYS-API-001<br>PL-ENG-EXEC-001 |
| PL-PHYS-SWEEP-001 | PHYS | experiments | missing | v1.8 | physics-research.json | — | — | PL-PHYS-EXPERIMENT-001<br>PL-ENG-WORKFLOW-001<br>PL-CORE-TASK-001 |
| PL-PHYS-UNITS-001 | PHYS | units | missing | v1.8 | physics-research.json | — | — | PL-ENG-CALC-001 |
| PL-PHYS-VALIDATE-001 | PHYS | validation | missing | v1.8 | physics-research.json | — | — | PL-PHYS-NUMERIC-001<br>PL-PHYS-ERROR-001<br>PL-ENG-BENCH-001 |
| PL-PHYS-VIS-001 | PHYS | visualization | missing | v1.8 | physics-research.json | — | — | PL-PHYS-EXPERIMENT-001<br>PL-ENG-RENDER-001 |
| PL-SHEET-AI-001 | SHEET | ai | missing | v1.11 | spreadsheets.json | — | — | PL-CORE-AI-001 |
| PL-SHEET-CHART-001 | SHEET | charts | missing | v1.4.4 | spreadsheets.json | — | — | — |
| PL-SHEET-DATA-001 | SHEET | data | missing | v1.4.3 | spreadsheets.json | — | — | — |
| PL-SHEET-DATA-002 | SHEET | data | missing | v1.4.3 | spreadsheets.json | — | — | — |
| PL-SHEET-DATA-003 | SHEET | data | missing | v1.4.3 | spreadsheets.json | — | — | — |
| PL-SHEET-FILE-001 | SHEET | file-management | complete | v1.4.1 | spreadsheets.json | apps/desktop/services/sheets/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-FILE-002 | SHEET | file-management | complete | v1.4.1 | spreadsheets.json | apps/desktop/services/sheets/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-FILE-003 | SHEET | file-management | complete | v1.4.1 | spreadsheets.json | apps/desktop/services/sheets/index.js<br>apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-FILE-004 | SHEET | file-management | complete | v1.4.1 | spreadsheets.json | apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-FORMAT-001 | SHEET | formatting | missing | v1.4.3 | spreadsheets.json | — | — | — |
| PL-SHEET-FORMAT-002 | SHEET | formatting | missing | v1.4.3 | spreadsheets.json | — | — | PL-SHEET-FORMULA-001 |
| PL-SHEET-FORMULA-001 | SHEET | formulas | missing | v1.4.2 | spreadsheets.json | — | — | PL-CORE-CALC-001 |
| PL-SHEET-FORMULA-002 | SHEET | formulas | missing | v1.4.2 | spreadsheets.json | — | — | PL-SHEET-FORMULA-001 |
| PL-SHEET-FORMULA-003 | SHEET | formulas | missing | v1.4.2 | spreadsheets.json | — | — | PL-SHEET-FORMULA-001 |
| PL-SHEET-GRID-001 | SHEET | grid | complete | v1.4.1 | spreadsheets.json | apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-GRID-002 | SHEET | grid | partial | v1.4.1 | spreadsheets.json | apps/renderer/src/App.tsx | docs/releases/stage-3-sheets-v0-validation.md | — |
| PL-SHEET-GRID-003 | SHEET | grid | missing | v1.4.1 | spreadsheets.json | — | — | — |
| PL-SHEET-GRID-004 | SHEET | grid | missing | v1.4.1 | spreadsheets.json | — | — | — |
| PL-SHEET-HISTORY-001 | SHEET | history | missing | v1.4.5 | spreadsheets.json | — | — | PL-CORE-HISTORY-001 |
| PL-SHEET-IO-001 | SHEET | interchange | missing | v1.4.5 | spreadsheets.json | — | — | PL-CORE-IO-001 |
| PL-SHEET-IO-002 | SHEET | interchange | missing | v1.4.5 | spreadsheets.json | — | — | PL-CORE-IO-001 |
| PL-SHEET-PERF-001 | SHEET | performance | missing | v1.12 | spreadsheets.json | — | — | — |
| PL-SHEET-PIVOT-001 | SHEET | analysis | missing | v1.4.4 | spreadsheets.json | — | — | — |
| PL-SHEET-PRINT-001 | SHEET | printing | missing | v1.4.5 | spreadsheets.json | — | — | — |
| PL-SHEET-PROJECT-001 | SHEET | project-integration | missing | v1.4.6 | spreadsheets.json | — | — | PL-CORE-LINK-001 |
| PL-SHEET-RECOVERY-001 | SHEET | recovery | missing | v1.12 | spreadsheets.json | — | — | PL-CORE-HISTORY-001 |
| PL-SHEET-REVIEW-001 | SHEET | review | missing | v1.4.5 | spreadsheets.json | — | — | — |
| PL-SHEET-TABLE-001 | SHEET | tables | missing | v1.4.3 | spreadsheets.json | — | — | — |
| PL-SHEET-XSLICE-001 | SHEET | cross-slice | missing | v1.9 | spreadsheets.json | — | — | PL-CORE-LINK-001 |
| PL-TERM-AI-001 | TERM | ai | missing | v1.5 | terminal-workflows.json | — | — | PL-CORE-AI-001<br>PL-TERM-TRUST-001<br>PL-TERM-AUDIT-001 |
| PL-TERM-AUDIT-001 | TERM | security | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-PROCESS-001<br>PL-CORE-DIAG-001<br>PL-CORE-PERMISSION-001 |
| PL-TERM-CONFLICT-001 | TERM | synchronization | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-WATCH-001<br>PL-CORE-HISTORY-001 |
| PL-TERM-EVENT-001 | TERM | events | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-PROCESS-001<br>PL-CORE-DIAG-001 |
| PL-TERM-EXT-001 | TERM | extensions | missing | v1.5 | terminal-workflows.json | — | — | PL-CORE-EXT-001<br>PL-CORE-PERMISSION-001<br>PL-BRIDGE-EXT-001 |
| PL-TERM-HISTORY-001 | TERM | recovery | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-HOST-001<br>PL-CORE-HISTORY-001 |
| PL-TERM-HOST-001 | TERM | terminal | missing | v1.5 | terminal-workflows.json | — | — | PL-CORE-SHELL-001<br>PL-CORE-PERMISSION-001 |
| PL-TERM-PROBLEM-001 | TERM | diagnostics | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-EVENT-001<br>PL-CORE-DIAG-001 |
| PL-TERM-PROCESS-001 | TERM | processes | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-HOST-001<br>PL-CORE-TASK-001<br>PL-CORE-DIAG-001 |
| PL-TERM-PROFILE-001 | TERM | terminal | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-HOST-001 |
| PL-TERM-TAB-001 | TERM | terminal | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-HOST-001<br>PL-CORE-SHELL-001 |
| PL-TERM-TASK-001 | TERM | tasks | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-EVENT-001<br>PL-CORE-TASK-001 |
| PL-TERM-TRUST-001 | TERM | security | missing | v1.5 | terminal-workflows.json | — | — | PL-CORE-PERMISSION-001<br>PL-BRIDGE-SEC-001 |
| PL-TERM-WATCH-001 | TERM | synchronization | missing | v1.5 | terminal-workflows.json | — | — | PL-CORE-PROJECT-001<br>PL-CORE-ASSET-001 |
| PL-TERM-WORKFLOW-001 | TERM | workflows | missing | v1.5 | terminal-workflows.json | — | — | PL-TERM-EVENT-001<br>PL-CORE-COMMAND-001<br>PL-CORE-TASK-001 |
| PL-XSLICE-CREATIVE-001 | XSLICE | creative-handoffs | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-REFRESH-001<br>PL-ENG-GEOMETRY-001<br>PL-ENG-TIMELINE-001<br>PL-ENG-GAME-001<br>PL-ENG-CODE-001 |
| PL-XSLICE-GRAPH-001 | XSLICE | relationship-graph | missing | v1.15 | cross-slice-platform.json | — | — | PL-CORE-LINK-001<br>PL-CORE-ASSET-001<br>PL-CORE-PROJECT-001 |
| PL-XSLICE-HEALTH-001 | XSLICE | project-health | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-GRAPH-001<br>PL-CENTER-HEALTH-001<br>PL-CORE-DIAG-001 |
| PL-XSLICE-LINK-001 | XSLICE | resource-links | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-GRAPH-001<br>PL-CORE-LINK-001<br>PL-CORE-HISTORY-001 |
| PL-XSLICE-NAV-001 | XSLICE | navigation | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-GRAPH-001<br>PL-CENTER-SEARCH-001<br>PL-BRIDGE-PROJECT-001 |
| PL-XSLICE-RECOVERY-001 | XSLICE | recovery | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-GRAPH-001<br>PL-CORE-HISTORY-001<br>PL-XSLICE-REPAIR-001 |
| PL-XSLICE-REFERENCE-001 | XSLICE | validation | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-RECOVERY-001<br>PL-XSLICE-WORKFLOW-001<br>PL-XSLICE-CREATIVE-001<br>PL-XSLICE-REPORT-001<br>PL-ENG-FREEZE-001 |
| PL-XSLICE-REFRESH-001 | XSLICE | updates | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-LINK-001<br>PL-CORE-HISTORY-001 |
| PL-XSLICE-REPAIR-001 | XSLICE | recovery | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-REFRESH-001<br>PL-CORE-DIAG-001 |
| PL-XSLICE-REPORT-001 | XSLICE | reporting | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-REFRESH-001<br>PL-PHYS-NOTEBOOK-001 |
| PL-XSLICE-WORKFLOW-001 | XSLICE | workflows | missing | v1.15 | cross-slice-platform.json | — | — | PL-XSLICE-GRAPH-001<br>PL-ENG-WORKFLOW-001<br>PL-CENTER-WORKFLOW-001<br>PL-CORE-TEMPLATE-001 |

## Traceability Gaps

- Capabilities without implementation links: 273
- Capabilities without validation links: 279

Missing implementation or validation links are expected for future milestone capabilities that have not entered active development yet. They must be populated as those capabilities move into implementation.

