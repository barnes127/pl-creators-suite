# PL Creators Suite — Supervised Development Rules (template)

## Authority and sources
- Human developer owns architecture, technologies, interfaces, priorities, and acceptance.
- Follow the approved version → wave → batch roadmap and the currently approved `dev-harness/current-batch.md`.
- Inspect the live codebase and relevant source blueprints before proposing changes. When sources conflict or are missing, report and halt the affected work. Do not invent batch requirements.
- Optimize within platform-wide shared service and interoperability constraints; never silently optimize one workspace at the expense of the platform.

## One-batch authorization
- A run is authorized for exactly one approved batch, not the entire wave.
- Propose the batch implementation plan in a read-only phase first. Do not edit code before human approval.
- After approval, you may implement all routine in-scope steps, debug your own in-scope changes, and run the approved checks.
- Use focused edits; preserve existing files, conventions, and working behavior. Never advance automatically to the next batch.

## Hard deviation gate — HALT and request approval
If work would require ANY change outside the approved scope or approach—including dependency substitution/addition, architecture or service boundaries, APIs, IPC, persistence, permissions/security, extension contracts, significant design changes, or unrelated code changes—STOP affected implementation immediately.
1. Leave completed in-scope work intact; do not work around the restriction.
2. Report what conflicts, evidence, affected files/services, alternatives, tradeoffs, and a recommendation.
3. Ask for explicit human decision. No response is not approval.
4. Resume only after the approved batch record is updated to reflect authorization.
Do not quietly implement a “better” architecture or make presumptive approval decisions.
Routine implementation decisions that remain fully within the approved plan, architecture, interfaces, and scope do not require additional approval. Any proposed departure from those constraints must be approved before implementation.

## Safety and repository operations
- Work only in the dedicated agent worktree and approved writable paths.
- Do not commit, merge, push, publish, deploy, run migrations against real data, change external services, or use production credentials without separate explicit authorization.
- Do not overwrite unrelated project files or run destructive commands.
- Git isolation is not OS/process isolation; warn if UI testing or commands need access outside the sandbox.

## Testing and evidence
- Run approved, relevant typechecks, lint, unit/integration/regression checks and builds, then Beta Bot UI scenarios only when a documented, approved command and environment are available.
- Beta Bot is an independent testing tool, not a guarantee of correctness. Preserve logs/artifacts for review. Never claim a command passed unless executed; classify PASS / FAIL / BLOCKED / NOT RUN.
- Make only in-scope repairs after test failures; otherwise halt and report the issue.
- Report exactly what was run, results, changed files, objective coverage, risks, unresolved work, and manual boot-test steps.
- Stop after the current batch is ready for human acceptance. Human developer reviews diffs, artifacts, and app behavior, then controls integration and closeout.
