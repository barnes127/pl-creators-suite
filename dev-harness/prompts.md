# Reusable Codex prompts

## A. Read-only preflight and implementation proposal
Read the root AGENTS.md and dev-harness/current-batch.md. Identify and inspect the referenced version/wave/batch blueprint sections and the existing repository implementation. Stay read-only: do not edit files, install packages, or alter Git state. Produce: (1) exact batch objective interpretation grounded in documents, (2) existing components and interfaces reused, (3) proposed touched files and step sequence, (4) cross-workspace impacts, (5) commands and Beta Bot availability, (6) risks and ambiguities, (7) any required deviation approvals. If requirements are missing or conflicting, report and STOP. Wait for explicit approval before any implementation.

## B. Authorized whole-batch implementation
Verify that the active batch record explicitly authorizes implementation and identifies the approved plan. If either is missing, stop and request authorization. Otherwise, implement the single approved batch within its established scope. Impliment this ONE batch only within approved bounds in the dedicated agent worktree. You may complete all planned in-scope implementation steps and in-scope repairs without intermediate approval. If ANY deviation is needed, HALT affected work immediately and submit a proposal; do not implement substitutions or workarounds. Do not commit, merge, push, or start the next batch. Run only approved checks and the verified Beta Bot UI runner if available. Record results as PASS/FAIL/BLOCKED/NOT RUN; preserve relevant artifacts. Stop and provide a review-ready report with diff summary, architecture impact, exact test commands/results, known failures, and human boot-test steps.

## C. Review/repair after human feedback
Read the active batch contract, prior plan approval, current diff, test evidence, and my feedback. Make only the explicitly requested in-scope repairs. If a repair requires scope or architecture change, STOP and propose it for approval. Retest affected checks and return a revised change/test report. Do not commit or integrate.

## D. Handoff
Summarize observed state for dev-harness/handoff.md: baseline SHA, current branch, completed/incomplete objectives, touched files, decisions and approvals, exact test commands and results, Beta Bot artifacts, known issues, and the next authorized step. Do not claim the batch is accepted unless I have accepted it.
