## Current batch — v1.3.4 Batch 1: Inventory and Unified Contracts
## Identification and status
- Version: v1.3 — Creator Command Center
- Wave: v1.3.4 — Unified Jobs, Queues, Tasks & Notifications
- Batch: 1 — Inventory and Contracts (inventory completed; source-level contract foundation pending)
- Original accepted v1.3.3 baseline SHA: c785cfecb46c05f52378408c81cb9834943405a0
- Agent branch: agent/v1.3.4-b1
- Agent worktree: ~/dev/pl-cs-v134-b1
- Normal checkout: ~/dev/pl-creators-suite
- Last human-reported agent HEAD: 21df300 (verify full SHA with git rev-parse HEAD immediately before execution)
- Status: REVISED IMPLEMENTATION PLAN REVIEWED — AWAITING EXPLICIT HUMAN AUTHORIZATION
- Earlier documentation-only authorization is superseded only when the human expressly approves this revised record. No automatic approval is implied by this template.

## Source authority and references
1. Primary authority: references/PL_Creators_Suite_Official_V1_Master_Blueprint_LIBRE_SAFE.odt — v1.3 Creator Command Center, Wave 1.3.4: Jobs, Queues, Tasks & Notifications. Requirements: common queue model and controls where supported, coordinated tasks/milestones and notifications. Never promote suggested implementation details into master-blueprint requirements.
2. Approved architecture companion: references/PL_Creators_Suite_Integrated_Systems_Architecture_Companion.docx — §§3–4, 10, 15: shared boundaries, explicit trust, failure containment, extensible execution fabric. It supports but does not supersede the master blueprint.
3. Wave planning reference: references/v1.3.4.pdf, page 1 — Batch 1 Inventory and Contracts; later batches handle queue execution, events/notifications, UI and closeout.
4. Existing implementation inventory: docs/architecture/V1_3_4_JOB_TASK_OWNERSHIP.md — observed behavior and deferred decisions. This is not a replacement for approved roadmap architecture.
5. Repository guardrails: docs/architecture/ARCHITECTURE_GUARDRAILS.md, TRUST_BOUNDARIES.md, FAILURE_ISOLATION.md, PLATFORM_API_BOUNDARIES_V1_2_6.md, PLATFORM_API_REFERENCE_V1_2_6.md.
6. Accepted prior release evidence: docs/releases/v1.3.3-validation.md.
7. Relevant code for read-only inspection: packages/platform/src/tasks/, packages/platform/src/notifications/, packages/platform/src/events/, apps/desktop/services/tasks/, apps/desktop/services/diagnostics/, apps/desktop/services/project-platform/indexing/, apps/desktop/services/runtime.js, apps/desktop/services/operations.js, apps/desktop/rpc/contracts.js, apps/desktop/rpc/registry.js.
8. Future compatibility only: the approved Copilot/Agentic Task System and UI evolution references, where present. Do not implement future agent, cloud, or UI features.

If any referenced blueprint is absent or unreadable in the agent environment, or a material conflict arises, halt affected work and report it. Do not invent missing requirements.

## Original objective and Batch 1 deliverable
Review existing task, queue, job, and notification APIs; define and implement the minimum unified state and ownership foundation. Preserve the existing desktop task and diagnostic systems. The documentation inventory is complete; the remaining scope is the seven-file source-level implementation below.

## Approved design direction (subject to authorization gate below)
- desktopRuntime.taskManager is the canonical process-local owner for live tasks submitted through that desktop runtime; it is not the universal owner of future LAN/cloud/agent/worker execution.
- Preserve existing TaskStatus values and transition semantics, including cooperative cancellation; do not add scheduling semantics to the current brief queued state.
- Existing task.id links live and diagnostic snapshots only within the local runtime/diagnostic scope, with no global-uniqueness claim.
- Diagnostic jobs.jsonl snapshots are historical evidence, not executable tasks; historical-only records must be read-only.
- A privacy-allowlisted internal overview reconciles records by local ID, prefers live records, and degrades to live-only visibility if history reads fail.
- Existing public TaskApi, RPC method names/response shapes, RPC trust/authorization, notification/event contracts, diagnostics storage format and lifecycle remain unchanged.

## EXACT source-file modification allowlist — seven files
1. apps/desktop/services/tasks/index.js — make exported desktopTaskManager a lazy reference to desktopRuntime.taskManager, without fallback manager creation; preserve createDesktopTaskManager() for isolated instances. This is an expressly proposed exported-instance behavior change.
2. apps/desktop/services/project-platform/indexing/jobs.js — resolve the default manager at constructor time, preserve optional injected manager and legacy completed → complete mapping and start/get/list/cancel shapes.
3. apps/desktop/services/tasks/overview.js (new) — implement internal summary projection merging live manager .list() with diagnostics .getLatestJobs(); return { tasks, historyAvailable }. Dedupe by local ID, live wins. Successful empty history is historyAvailable: true; history read failure is false, with live summaries still returned. Skip malformed records and unsupported statuses. Summaries may contain only id, kind, title, status, finite numeric progress percent, timestamps, failureCode, warning count, and source (live or history). Do not expose raw inputs, results, metadata, paths, credentials, progress message/currentItem, raw errors, or detailed failure/warning payloads. Historical-only summaries confer no cancellation/execution authority.
4. apps/desktop/services/runtime.js — add internal listUnifiedTaskStates() using that runtime's manager and diagnostics instance. Preserve other runtime members, initialization, interruption handling, and diagnostic bridge. This is an expressly proposed internal service-interface addition.
5. scripts/project-indexing-service-test.js — inject isolated manager for fixture execution; test default manager identity, factory isolation, legacy status/cancellation and both facade/canonical cancellation behavior. Test alternate CommonJS import orders in subprocesses with isolated HOME and verify imports do not write to the default diagnostics directory.
6. scripts/desktop-operational-rpc-test.js — add temporary-diagnostics-root tests for live/history ID collision, history-only state, interrupted history, successful empty history, malformed/unknown status handling, safe allowlist, failure fallback and unchanged existing operational RPC results.
7. docs/architecture/V1_3_4_JOB_TASK_OWNERSHIP.md — update observed implementation and its evidence, explaining process-local identity and ownership, read-only history, limitations, compatibility, privacy and future proposals. Maintain a dedicated Roadmap Compliance, Deviations, and Engineering Proposals section distinguishing official requirements, verified facts, approved decisions and unapproved ideas.

Clarification: The seven-file allowlist does not authorize modification of dev-harness/current-batch.md by Codex. The human updates this worksheet before implementation; agents may read it but not rewrite scope or authorization. For any legitimate need to modify an eighth file, stop and request approval.

## Approved scope amendment — contract test

- Additional authorized file:
  scripts/project-indexing-contract-test.js
- Reason:
  Existing test falsely requires a literal ".tmp" string,
  although storage constructs the suffix dynamically.
- Authorized work:
  Replace the brittle assertion with behavior-based
  temporary-write and rename validation.
- Forbidden:
  Changes to storage.js, persistence semantics,
  dependencies, or unrelated tests.
- Approval:
  Human-approved test-only scope amendment.

## Strict exclusions and mandatory deviation gate
- No new scheduler, worker placement, concurrency limits, priority enforcement, pause/retry, event fanout, notification UI, Command Center UI, cloud/LAN/agent execution, unrelated refactors or dependency changes.
- No public/shared type change, new RPC method or response shape, altered trust/permissions, changed persisted schema, migrations, new service singleton, or unapproved user-data writes.
- No commit, push, merge, deploy, or transition into Batch 2 by Codex.
- If import-cycle resolution, existing consumers, security requirements or test findings require a change outside the exact plan, HALT affected work. Report evidence, affected files/contracts, alternatives/tradeoffs and recommendation; await explicit human approval and an amended batch record. Do not silently substitute another implementation.
- Keep test data and diagnostic storage isolated from real ~/.plcs user state.
Verification and acceptance criteria
- Default indexing facade, exported default manager, operational RPC, health collector and diagnostic bridge refer to the same process-local live manager; independently created managers remain isolated.
- Module loading works tasks-first, indexing-first, runtime-first, without circular initialization faults or unintended filesystem writes. Lazy alias is stable and synchronous.
- Legacy indexing start/get/list/cancel, progress mapping, complete status and cooperative cancellation remain compatible; cancellation via legacy facade and canonical manager targets the same live job.
- Overview uses only allowed summary fields and valid statuses; live wins duplicate ID; historical records remain read-only; no invented execution/retry/recovery state.
- Successful empty history returns historyAvailable: true. Failed diagnostics read returns false, retains live tasks, and does not leak raw errors.
- Existing platform lifecycle, RPC contracts/permissions and diagnostics persistence remain unchanged.
- No unexpected files modified. Human reviews actual diff and final local boot/GUI test before acceptance.

## Approved test commands (run from agent worktree, after dependency/environment checks)
- pnpm test:project-indexing-service
- pnpm test:project-indexing-contract
- pnpm test:desktop-tasks
- pnpm test:desktop-task-api
- pnpm test:desktop-diagnostics
- pnpm test:desktop-operations
- pnpm test:platform-task-formats
- pnpm test:platform-types
- pnpm test:rpc
- pnpm test:rpc-authorization
- git diff --check (also check untracked new file explicitly before staging; check staged diff once staged)
For every check record PASS / FAIL / BLOCKED / NOT RUN with exact command and evidence. The prior Codex session reported a Node 20.20.2 environment against a Node 22.12.0 requirement; record/resolve environment mismatch before relying on results. Do not silently install or switch tooling without existing approved procedures.

Beta Bot: NOT CONFIGURED — no verified command or approved scenario. Do not invent runner results.

Human validation: Review status and complete diff, test actual local Electron boot and relevant workflows using isolated fixtures, inspect security/privacy effects, and accept/reject the batch. Runtime and UI tests are not satisfied by agent claims alone.

## Approval gate — human-owned, never self-authorized by Codex
- Read-only planning: ALLOWED
- Revised seven-file plan reviewed: YES
- The exported default-manager behavior change (tasks/index.js) has human approval: YES
- The internal listUnifiedTaskStates() addition (runtime.js) has human approval: YES
- Implementation of this exact seven-file batch: YES
- Integration into main: NO
- Batch 2 start: NO
Codex must confirm the three implementation approvals are YES in the current on-disk worksheet before beginning any write. An instruction prompt alone does not override an unapproved worksheet. After authorized implementation, stop and present the diff/test evidence for final human acceptance.
