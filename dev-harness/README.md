# PL Creators Suite — Supervised implementation harness V2

The human developer owns architecture and final approval. The human may use ChatGPT and authoritative repository/blueprint documents to write an **executable batch specification**. Codex implements, self-tests, and repairs only within that approved specification; it no longer needs to generate and re-plan the batch by default.

## Recommended sequence
1. Finish/accept/merge the prior batch or maintenance gate. Verify `main` is up to date and clean.
2. Create a dedicated branch/worktree from the accepted baseline. Set `dev-harness/current-batch.md` in **that worktree** to the specific batch, exact SHA, files, behaviors, tests, and authorization. Do not inherit approvals from an earlier batch.
3. Review the specification with ChatGPT and **explicitly mark human authorization YES** once satisfied. A generated document alone does not grant authorization.
4. Launch Codex in its approved workspace-write sandbox in that worktree; use `dev-harness/prompts.md` Prompt A. It does a short compatibility check, implements, tests and fixes in-scope defects autonomously.
5. Review all tracked and untracked changes, test evidence, security and roadmap compliance. Run independent acceptance and isolated Electron/manual tests. Use Prompt C for bounded repairs or amend the contract before extending scope.
6. Human accepts/rejects, then personally stages, commits, pushes and merges accepted work. Record actual outcomes in `batch-log.md` and `handoff.md` (do not erase prior entries).
7. Start the next batch from newly accepted `main`. Do not implement two unrelated batches in one worktree.

## Current pause
v1.3.4 Batch 1 was reported merged. SEC-2026-01 security review/remediation is the intervening gate before v1.3.4 Batch 2. The bundled `current-batch.md` is intentionally unauthorized, pending a new, specific specification.

## Git and files
Replacing files in a local repo changes only your checkout. `git status` and `git diff` show changes; `git add` stages them; `git commit` records them locally; `git push` publishes the commit. Do not commit until you review the diff. Git worktrees share repository history but have independent checked-out working files.

`AGENTS.md` is an instruction file, **not** a security or policy enforcement engine. Workspace permissions, branch protections, diff review, and human approval still matter. Worktrees do not isolate HOME, credentials, GUI sessions, or external services.
