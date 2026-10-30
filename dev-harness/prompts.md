# Reusable Codex prompts — Direct Implementation Workflow

## A. Approved batch — execute now (default)
Read root `AGENTS.md`, `dev-harness/current-batch.md`, cited blueprint sections, and relevant source. The human developer has already prepared the implementation specification. Do not produce a redundant implementation plan. Briefly verify branch, baseline, file whitelist, authorization, references and compatibility. If authorization is NO, required references are unavailable, or a material conflict exists, STOP affected work and report it. Otherwise implement the entire single approved batch directly, make focused edits, autonomously repair ordinary in-scope failures, and run approved tests. Stop before any unapproved file/architecture/API/RPC/IPC/persistence/security/dependency change. Do not commit, push, merge, deploy, or begin the next batch. Return a review-ready changed-file report, status/diff summary, exact test outcomes, manual validation steps, and **Roadmap Compliance, Deviations, and Engineering Proposals**.

## B. Read-only compatibility check (exceptional; NOT an independent planning cycle)
Read the approved batch record and relevant code. Verify that the specified interfaces, files, branch, and baseline exist and are compatible. Return only blockers, contradictions, or missing authorizations, plus evidence. Do not redesign the batch, edit files, install packages, change Git state, or ask to reapprove routine in-scope details.

## C. Human-directed bounded repair
Read the active batch contract, current diff, test evidence, and the human's specific review feedback. Repair only within the existing authorized file list and behavior; rerun affected checks and report results. For anything requiring additional authorization, stop affected work and submit a deviation request. Do not commit or integrate.

## D. Review handoff
Provide content for `dev-harness/handoff.md` without silently editing it unless that file is in the authorized whitelist. Include baseline and branch, files changed including untracked files, requirements completed, tests with actual PASS/FAIL/BLOCKED/NOT RUN, Beta Bot status, known issues, deviations/approval references, manual checks and the exact next human action. Do not claim acceptance before explicit human approval.

## E. Read-only security triage (separate maintenance gate)
When security work is underway, inspect GitHub advisories/CodeQL evidence, relevant dependency paths, package versions, runtime exposure, and existing tests. Return a minimal proposed remediation scope for the human to approve; never silently upgrade, suppress alerts, weaken permissions, or expand Batch 2. Only the human may convert the findings into an authorized batch contract.
