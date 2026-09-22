# AI-Assisted Development Guide — PL Creators Suite

PL Creators Suite is developed with help from ChatGPT, but it is not autonomously built by AI.

This document explains how AI is used during development, what decisions remain human-controlled, and the workflow used when AI assists with implementation.

It is mainly here for future development sessions, AI assistants reviewing the repository, and anyone else contributing to or reviewing the project.

---

## How AI Is Used

ChatGPT is used as an interactive development copilot.

It helps with things like:

- planning implementation work
- discussing architecture
- inspecting repository structure and source files
- generating boilerplate
- generating complete new files
- debugging compiler, test, and runtime failures
- suggesting targeted edits to existing files
- writing tests and validation scripts
- reviewing logs and test output
- documenting systems and releases
- checking work against roadmaps and requirements

AI is used to speed up development and reduce repetitive work, not to replace ownership of the codebase.

---

## Who Makes the Decisions

The human developer remains responsible for the project.

That includes:

- product direction
- architecture
- roadmap decisions
- deciding what systems should exist
- approving new dependencies
- reviewing implementation changes
- integrating code
- running builds and tests
- manually testing application behavior
- security decisions
- release decisions

AI can suggest changes, including architectural changes, but a suggestion is not automatically an approved project decision.

If an AI suggestion conflicts with an approved roadmap, architecture document, validation record, or explicit developer decision, the approved project source wins.

---

## New Files vs Existing Files

The workflow is intentionally different for new and existing files.

### New files

For a new blank file, ChatGPT may generate the complete file when that file is already part of an approved task, batch, wave, or implementation plan.

The generated file is still reviewed before it becomes part of the project.

### Existing files

Existing files are normally edited manually by the developer.

Instead of replacing an entire existing file, ChatGPT should give targeted instructions such as:

- find this section
- add this block
- remove this line
- change this expression
- insert this code after a specific section

If the current contents of a file are uncertain, ChatGPT should ask to inspect the relevant section rather than guessing.

Whole-file replacement of an existing source file should only happen when explicitly requested.

---

## Why Existing Files Are Edited Manually

This is intentional.

Manually integrating changes helps maintain understanding of:

- syntax
- naming
- scope
- file structure
- architecture
- data flow
- how different systems connect

AI should make development faster without making the developer dependent on generated code that they do not understand.

---

## Architecture and Scope

AI may identify problems and propose:

- new systems
- abstractions
- refactors
- alternative implementations
- architecture changes
- dependency replacements
- roadmap adjustments

Those are proposals until they are approved.

AI should not silently:

- redefine architecture
- introduce systems outside the approved scope
- change directory structure
- add dependencies
- change persistence formats
- change public contracts
- bypass security or compatibility rules
- remove roadmap requirements
- claim work has been validated when it has not

Large implementation work should be checked against the relevant roadmap and source-of-truth documents before development begins.

---

## Dependency Policy

PL Creators Suite follows this rule:

> Do not add a new third-party dependency when the required capability is small enough for PL to reasonably own and maintain.

AI should not recommend a package simply because it is convenient.

Before adding a dependency, the project should consider:

- how difficult the capability would be to build internally
- long-term maintenance
- security surface
- performance
- portability
- offline behavior
- how difficult the dependency would be to replace later

Large specialized dependencies are acceptable when they provide meaningful production capability and are kept behind PL-owned interfaces where practical.

---

## Development Workflow

A typical AI-assisted development cycle looks like this:

1. The developer chooses the roadmap item, feature, bug, or task.
2. The relevant source code and project documentation are reviewed.
3. ChatGPT helps break the work into a reasonable implementation plan.
4. The developer approves the direction.
5. New files may be generated when needed.
6. Existing files are normally changed manually using targeted edit instructions.
7. The developer runs the application, compiler, builds, and tests locally.
8. Logs, errors, or observed behavior are brought back into the development chat.
9. ChatGPT helps identify the first meaningful failure or next required change.
10. The developer applies the fix and validates again.
11. The developer decides when the work is complete and ready to commit.

This process repeats until the capability meets its roadmap and validation requirements.

---

## Debugging

When something fails, the normal approach is to fix the narrowest confirmed problem first.

ChatGPT should:

- identify the first meaningful failure
- inspect the relevant source before guessing
- ask for the relevant code section when necessary
- avoid unrelated rewrites
- preserve known-good behavior
- rerun the failed validation before expanding the investigation

Several independent obvious problems may be fixed together when doing so will not hide the root cause.

---

## Testing and Validation

AI can help write tests and interpret results, but AI does not decide that something works simply because code was generated.

A feature is not considered complete only because:

- the code compiles
- a type exists
- an RPC method exists
- a structural test passes
- a UI element appears
- a placeholder or stub exists

Depending on the feature, validation may include:

- unit tests
- structural tests
- compatibility tests
- migration tests
- persistence tests
- production builds
- manual application testing
- restart and reload testing
- realistic project data
- failure and recovery testing
- end-to-end workflows
- regression checks

The developer runs the local validation and confirms the actual behavior.

If the application behaves incorrectly during manual testing, that takes priority over an automated test claiming the feature is correct.

---

## UI and Behavioral Testing

UI work should be tested as actual behavior, not just code.

Things worth checking include:

- controls that exist in code but are not visible
- controls that appear but do not work
- state that does not persist
- layout problems
- inaccessible controls
- keyboard navigation
- incorrect empty states
- broken recovery behavior
- workflows that behave differently depending on how they were entered

A rendered interface is not automatically a completed interface.

---

## Refactoring

Refactoring should have a reason.

Good reasons include:

- correctness
- maintainability
- performance
- security
- testing
- clearer architecture boundaries
- dependency isolation
- migration support
- removing proven duplication

Working code should not be rewritten only to make it look more conventional or more stylistically polished.

The existing local style should be preserved when it remains readable and correct.

---

## Documentation and Roadmaps

ChatGPT may help create or update:

- implementation plans
- architecture notes
- roadmap documents
- validation records
- migration notes
- release notes
- compatibility documentation
- capability checklists
- known limitations

Documentation should describe the system that actually exists.

Planned functionality should not be written as if it is already implemented.

Known limitations should be recorded rather than hidden.

The project roadmap remains human-controlled.

AI may help organize or analyze it, but should not silently remove, reorder, or replace approved requirements.

---

## What "AI-Assisted" Means for This Project

PL Creators Suite is not an AI-generated project in the sense of handing a repository to an autonomous coding system and accepting whatever it produces.

The project is built through an interactive development process.

ChatGPT helps with analysis, implementation, debugging, testing, and documentation.

The developer remains responsible for understanding the system, integrating changes, validating behavior, and deciding what belongs in the product.

AI is part of the toolset used to build PL Creators Suite.

It is not the owner, architect, or final authority.

---

## Final Principle

Use AI to move faster without giving up understanding or ownership of the codebase.

The goal is not to avoid AI-generated work.

The goal is to make sure that generated work is reviewed, understood, integrated intentionally, and validated before it becomes part of PL Creators Suite.
