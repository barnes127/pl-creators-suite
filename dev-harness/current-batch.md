Current batch — v1.3.4 Batch 1 (read-only planning draft)
- Version: v1.3
- Wave: v1.3.4 — Unified Jobs, Queues, Tasks & Notifications
- Batch: 1 — Inventory and Contracts
- Baseline commit (full SHA): c785cfecb46c05f52378408c81cb9834943405a0
- Agent branch: agent/v1.3.4-b1
- Agent worktree: ~/dev/pl-cs-v134-b1
- Main checkout: ~/dev/pl-creators-suite
- Status: DRAFT — READ-ONLY PLANNING ONLY; IMPLEMENTATION NOT AUTHORIZED

Authoritative source references
- Version roadmap:
  references/PL_Creators_Suite_Official_V1_Master_Blueprint_LIBRE_SAFE.odt;
  official v1.3 roadmap; exact subsection/page to be confirmed during read-only inspection.
- Wave outline:
  Same master blueprint, v1.3.4 — Unified Jobs, Queues, Tasks & Notifications;
  agent must quote/identify the precise section and distinguish authoritative requirements from proposals.
- Local wave/batch planning reference:
  references/v1.3.4.pdf;
  Batch 1 — Inventory and Contracts. This is a planning reference; check against the master blueprint before interpreting it as an approved change specification.
- Integrated architecture:
  references/PL_Creators_Suite_Integrated_Systems_Architecture_Companion.docx;
  identify exact relevant section/page for task management, service boundaries, lifecycle, events, and cross-slice integration during preflight.
- Repository architecture rules:
  docs/architecture/ARCHITECTURE_GUARDRAILS.md,
  docs/architecture/TRUST_BOUNDARIES.md,
  docs/architecture/FAILURE_ISOLATION.md,
  docs/architecture/PLATFORM_API_BOUNDARIES_V1_2_6.md,
  docs/architecture/PLATFORM_API_REFERENCE_V1_2_6.md.
- Existing code/contract sources:
  packages/platform/src/tasks/,
  packages/platform/src/notifications/,
  packages/platform/src/events/,
  apps/desktop/services/tasks/,
  apps/desktop/services/diagnostics/,
  apps/desktop/services/operations.js,
  apps/desktop/services/runtime.js,
  apps/desktop/rpc/contracts.js,
  apps/desktop/rpc/registry.js,
  docs/capabilities/registry/.
- Supporting, NOT scope-expanding:
  references/PL Creators Suite Copilot + Agentic Task System Reference.docx;
  future compatibility only. Do not implement agent orchestration, approvals, or autonomy here.
- UI reference:
  references/PL_Creators_Suite_Official_V1_UI_Design_Evolution_Blueprint.docx;
  consult only for relevant compatibility, not Batch 4 UI implementation.
- Preceding accepted evidence:
  docs/releases/v1.3.3-validation.md;
  accepted baseline SHA above. Respect its documented limitations.
- Conflict rule: Original approved master roadmap and existing architecture outrank ad hoc batch suggestions. If references conflict or a cited section is inaccessible, report the precise issue and STOP the affected proposal; do not invent requirements.

Existing baseline inventory — verify locally before proposing changes
- Platform tasks:
  packages/platform/src/tasks/types.ts defines task kinds,
  queued/running/cancelling/cancelled/completed/failed/interrupted  statuses, priorities, progress, warning/failure, resources, definition, record and service interface.
  state.ts defines allowed transitions.
  workers.ts defines worker descriptors/capabilities/request/result
  types. api.ts exports TaskApi and TASK_API_SERVICE_ID (core.task).
- Desktop execution:
  apps/desktop/services/tasks/manager.js contains a task manager with handler registration, submission, progress/warning/resource callbacks, cancellation and task snapshot/list/get.
  api.js adapts it to the platform-style task service.
  Additional formats.js and indexing.js handlers exist; inspect actual integration, not just filenames.
- Persisted diagnostic jobs:
  apps/desktop/services/diagnostics/tasks.js bridges task changes into diagnostics.job(task),and
  apps/desktop/services/runtime.js wires this to TaskManager.
  Inspect records.js, service.js, storage.js for persistence/retention/recovery and whether diagnostic job records are identical to task records (do not assume).
- Notifications:
  packages/platform/src/notifications/types.ts
  defines notification severity/category/action/record/filter contracts; center.ts provides in-memory NotificationCenter push/get/list/dismiss/remove/clear. Persistence, desktop wiring, event delivery and visible UI are NOT verified by presence of this class.
- Operations/RPC:
  apps/desktop/services/operations.js
  exposes startTask, getTask, listTasks, cancelTask, queryDiagnostics, etc.; apps/desktop/rpc/contracts.js and registry.js provide tasks.start/get/list/cancel and diagnostics method contracts/registration. Examine authorization, cancellation and errors before proposing additions.
- Events/queue/worker runtime:
  inspect packages/platform/src/events/, queue accounting in apps/desktop/services/health/system.js, and all callers. Do not assume a standalone queue scheduler, worker registry, queue persistence, task notification fanout or unified UI already exists.

Batch Objective
Inspect and reconcile the existing shared task, desktop task, queue/worker, persisted diagnostic-job, notification, event, operational and RPC interfaces. Produce an evidence-backed ownership map, lifecycle/state mapping, compatibility/gap analysis and a minimally scoped proposed foundational contract plan for v1.3.4. The current authorization permits documentation and read-only planning only. Implementation of any proposed contract change requires separate human plan approval.
Expected Behavior
- Existing task submission/execution/cancellation and diagnostic job persistence continue to work unchanged during planning.
- Agent identifies the source of truth for live task state versus durable job history, and distinguishes both from future queue and notification presentation.
- Agent identifies how supported task states and transitions map to observed backend behavior (including cancelled, failed, interrupted, and reboot/recovery cases); does not silently redefine statuses.
- Agent proposes how an eventual unified view could read/reconcile existing data without creating another conflicting task manager or inventing queue/worker values.
- Agent reports concrete interface gaps, affected consumers, compatibility and privacy consequences, and separates Batch 1 foundational changes from later lifecycle, notifications, UI and closeout batches.
Acceptance Criteria
For the read-only planning pass (current gate):
1. Confirm baseline SHA, branch, worktree and absence of unauthorized implementation changes; report discrepancies.
2. Provide a table of existing APIs and files: purpose, key exported methods/types, callers, ownership, storage/lifecycle, verified vs absent/not verified.
3. Identify exact master blueprint and companion document headings/pages for the relevant requirements; cite paths and explain any conflicts.
4. Provide a task-status transition comparison between platform contracts and desktop runtime; cover completion, failure, cancellation and interruption.
5. Describe queue/worker and notification runtime reality based on source inspection; no fabricated functionality.
6. Present a small, ordered list of proposed Batch 1 file edits, including why each is necessary, its compatibility impact, and associated tests. Any shared/public contract alteration must be flagged DEVIATION APPROVAL REQUIRED.
7. List specific files not to change; explicitly defer Batch 2–5 behavior, agentic AI, new dependencies, cloud, marketplace and unrelated UI.
8. Report which documented test commands exist and whether Beta Bot is actually launchable. Mark every unexecuted test NOT RUN rather than PASS.
9. Stop and request human review. No file edits, dependency install, Git write, commit, merge or push.
For later implementation acceptance (NOT YET AUTHORIZED): approved changes must demonstrably satisfy the human-approved plan, relevant regression checks, manual boot review, and diff inspection without unapproved deviations. Set specific new behavioral criteria after the read-only plan identifies the actual changes.
Proposed implementation scope — subject to plan approval
- Currently permitted: inspection; architecture/interface inventory; mapping existing lifecycle and data ownership; proposed minimal contract compatibility work; recommended tests and test gaps.
- Candidate source areas to inspect, NOT blanket edit permission: packages/platform/src/tasks/, packages/platform/src/notifications/, packages/platform/src/events/, apps/desktop/services/tasks/, apps/desktop/services/diagnostics/, apps/desktop/services/runtime.js, apps/desktop/services/operations.js, apps/desktop/rpc/contracts.js, apps/desktop/rpc/registry.js, and matching tests.
- Implementation whitelist: NONE until human approves the proposed file list and design in this document. Once approved, update this section explicitly before using prompt B.
Forbidden scope / frozen contracts
- No unrelated feature work, speculative redesign, second parallel task scheduler, new dependency, change of runtime technology, undocumented persistence or migration, cloud integration, AI agent autonomy, public API changes, new RPC methods, permission/trust change, or notifications/Command Center UI build in this batch without separately recorded human approval.
- Protected: packages/platform/src/tasks/types.ts, state.ts, api.ts, workers.ts; packages/platform/src/notifications/types.ts, center.ts; packages/platform/src/events/; apps/desktop/rpc/contracts.js, registry.js, authorization.js; diagnostic record formats/storage; existing task-manager and recovery semantics. These are read-only during preflight; any implementation change to shared contracts/security/persistence requires explicit deviation review.
- Do not change main, run live migrations, remove project data, commit/push, or modify files outside the agent worktree.
- Do not access actual user secrets, personal project data or production services. Fixture data only; report if a check requires privileged or out-of-worktree access.
Review and validation plan
Commands verified as existing npm/pnpm scripts in the repository package.json; execution status: NOT RUN for this batch.
- Static/types: pnpm test:platform-types; pnpm capabilities:validate; pnpm build:renderer; git diff --check.
- Task and platform contracts: pnpm test:platform-task-formats; pnpm test:platform-orchestration-apis; pnpm test:platform-core-apis; pnpm test:desktop-tasks; pnpm test:desktop-task-api.
- Diagnostics and operations: pnpm test:desktop-diagnostics; pnpm test:desktop-operations; pnpm test:command-center-system-telemetry; pnpm test:command-center-service-health.
- Events/RPC: pnpm test:platform-events; pnpm test:rpc; pnpm test:rpc-authorization; pnpm test:rpc-execution; pnpm test:rpc-backend.
- Baseline smoke where appropriate: pnpm test:command-center-health-ui and pnpm test:command-center-v133-closeout.
- Beta Bot: NOT CONFIGURED / launch command and approved UI scenarios NOT VERIFIED. Do not improvise a runner or claim automated UI evidence.
- Human manual boot AFTER approval and implementation: run verified local Electron launch (cd apps/desktop && pnpm dev), check project restore, task visibility/operations, Health Center/status bar and diagnostic export for regressions. Keep worktree and main-user-data environments isolated; avoid destructive tests on real projects.
- Privacy/security: verify no task input/results/secrets are emitted through new diagnostic/notification paths, no permission bypass in RPC, no undocumented storage, and no file output beyond approved fixtures. Mark anything not tested explicitly.
Definition of done
- [ ] Human-approved implementation plan recorded with exact file whitelist and acceptance tests
- [ ] Approved behavior implemented within scope (NOT AUTHORIZED YET)
- [ ] Exact commands/results reported, including skipped or blocked
- [ ] Beta Bot evidence supplied if verified/runnable; otherwise NOT CONFIGURED
- [ ] No unapproved deviations
- [ ] Human diff review and boot test passed
- [ ] Human explicitly accepted batch and authorized integration
Authorization
- Read-only analysis: ALLOWED
- Proposed plan approved by human: NO
- Implementation authorized by human: NO
- Integration authorized by human: NO
- Next batch authorized: NO
Codex read-only preflight request
Follow root AGENTS.md and dev-harness/prompts.md Prompt A. Use only the above-authorized sources and inspect exact path/heading references first. If the agent worktree has an incorrect SHA, inaccessible references, a contradictory architecture requirement, or a necessary public-contract change, report it and stop the affected work. Return the proposed ordered plan, exact touched-file list, tests and deviations for human approval. Do not edit any files or Git state.
