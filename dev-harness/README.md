# Supervised Codex workflow — small starter harness

This is a **template**, not verified against your local repository. Read and adapt existing AGENTS.md rather than replacing it. Do not start code edits until the active batch and source references have been filled and approved.

1. Finish/verify/commit current manual batch; record base SHA (`git rev-parse HEAD`).
2. Create a new agent branch/worktree from that SHA.
3. Add/adapt root AGENTS.md and the dev-harness templates in the agent worktree. Confirm no conflicting existing instructions.
4. Fill current-batch.md with actual wave/batch documents and verified test commands.
5. Run Codex read-only analysis with prompt A. Review plan and update `current-batch.md` with explicit approval.
6. Run Codex with workspace-write permissions inside isolated worktree using prompt B. Do not grant broad OS/network/secret access merely to make UI tests pass.
7. Inspect git status, diff and test artifacts. Run manual boot test. Prompt C for bounded repairs if necessary.
8. Accept/reject. Integrate only accepted work yourself, retest after integration, log completion. Prompt D for handoff when switching modes.

Codex AGENTS.md is instructional, not a hard policy engine. Review diffs and apply branch protection or external policy checks to increase enforcement. Git worktree separates checkout files but does not isolate external files or services.
