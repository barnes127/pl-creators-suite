# PL Creators Suite Trust Boundaries

## Purpose

This document records the current security and reliability boundaries between the renderer, Electron main process, RPC transport, local services, filesystem, shell processes, local AI, extensions, engines, workers, network access, and future updater infrastructure.

This is a Wave 1.1.4 architecture artifact.

## Renderer Boundary

The React renderer is not considered a privileged operating-system boundary.

The renderer must not directly receive unrestricted Node.js, filesystem, shell, Electron, extension, updater, or network authority.

Electron runs with context isolation enabled and Node integration disabled.

The preload surface remains intentionally narrow.

Privileged operations must cross an explicit main-process or RPC contract.

## Electron Main Boundary

The Electron main process owns application-level privileged access.

Responsibilities include:

- window lifecycle
- preload attachment
- Electron dialogs
- permission decisions
- RPC server lifecycle
- future updater ownership

Electron permission requests are deny-by-default unless explicitly approved.

Renderer compromise must not automatically imply unrestricted Electron or Node authority.

## RPC Boundary

Renderer-to-main service calls cross the PL RPC boundary.

Current protections include:

- loopback-only bind address
- per-session authentication token
- bounded request body
- request validation
- method allowlisting
- method-specific parameter validation
- structured public errors
- correlation identifiers
- timeout policy for selected safe operations
- explicit mutation/retry metadata
- trust-boundary metadata

RPC handlers are deny-by-registration: an unknown method is rejected.

Every active RPC method must have a matching method contract.

RPC parameter validation occurs before the service handler executes.

## Filesystem Boundary

Filesystem operations are privileged.

Project-scoped reads and writes must remain behind service and RPC contracts.

Mutation operations are not automatically retryable because duplicate execution can corrupt or unexpectedly modify user data.

Project paths, resource names, archive paths, and imported paths must be validated before use.

Atomic writes, backups, migrations, integrity checks, and recovery behavior are governed by the project persistence layer where implemented.

## Shell Boundary

Shell/process execution is privileged.

Current project archive export/import uses child-process execution for archive tooling.

Shell execution must remain outside the renderer.

Arguments must be constructed by trusted application code rather than arbitrary renderer command strings.

Automatic retries are prohibited for shell-backed mutation operations unless the operation is explicitly proven idempotent.

## Network Boundary

Network access is privileged and must be classified by provider and purpose.

Current local AI access communicates with the local Ollama endpoint on loopback.

Local-network access does not imply permission to contact arbitrary internet services.

Future cloud providers must receive separate network/provider policies.

## AI Boundary

AI execution is not equivalent to deterministic local application logic.

Local AI calls require an explicit AI trust classification.

Project context may only be supplied when the caller explicitly allows project context and provides a valid project root.

AI output must not directly gain filesystem, shell, extension, deployment, secret, or destructive authority.

Future agentic execution must use its separate task/permission/approval system.

## Extension Boundary

Extensions are not implicitly trusted as core application code.

Extension discovery, manifest validation, enablement, execution, filesystem access, network access, and future marketplace permissions must remain explicitly governed.

Listing or validating extensions is distinct from granting extension execution authority.

Future third-party extensions must operate under declared capabilities and permissions.

## Updater Boundary

No general updater RPC authority is currently exposed to the renderer.

Future updater functionality must remain main-process owned.

The updater must not accept arbitrary renderer URLs, binaries, scripts, or shell commands.

Package authenticity, checksums/signatures, rollback, and release validation remain release-gate requirements.

## Worker Boundary

Worker processes or worker threads must be treated as failure-isolation boundaries when introduced or expanded.

A worker failure must be reported to its caller without terminating unrelated suite functionality.

Cancellation, progress, timeout, restart, and crash behavior are standardized separately.

## Engine Boundary

Current renderer-side engines are not all isolated into independent worker processes.

Engine calls must be treated as potentially fallible.

A failed engine operation must not be allowed to terminate the full application shell.

As engines move into workers or dedicated runtimes, their RPC/job boundary must preserve the same error, progress, cancellation, permission, and crash-isolation semantics.

## Slice Boundary

The six creator slices share the application shell but must not be allowed to fail as one monolithic unit.

Slice-level errors should be containable and visibly reportable.

The renderer architecture should progressively separate slice UI and state ownership from the root App component.

Wave 1.1.4 includes controlled decomposition of the current large App.tsx frontend.

## Import Boundary

Imported project archives and external files are untrusted input.

Import operations must validate paths and formats before installation.

Unsafe archive traversal must be rejected.

A failed import must clean temporary/staging state and must not corrupt an existing project.

## Retry Policy

Retryable metadata does not mean every failure should be retried automatically.

Automatic retry is limited to operations that are safe and idempotent.

Mutating RPC operations are non-retryable by default.

## Timeout Policy

Timeouts are appropriate only where the suite can safely stop waiting without creating ambiguous mutation state.

A Promise.race timeout is not cancellation.

Mutating operations must not be declared cancelled merely because the caller stopped waiting.

True cancellation requires cooperative cancellation support.

## Cancellation

RPC cancellation uses cooperative `AbortSignal` semantics.

A method must explicitly declare cancellation support.

The caller may request cancellation through `rpc.cancel`.

Cancellation does not imply rollback.

Filesystem mutation methods remain non-cancellable unless they later implement transaction-safe cooperative cancellation.

Local AI generation is the first cancellable service and forwards cancellation to the underlying local HTTP request.

## Progress

RPC execution provides a standardized progress object:

- phase
- percent
- message

Progress is currently recorded/logged by the execution manager.

A later transport/UI layer may expose live progress events without changing service semantics.

## Retry Enforcement

A retry requires all of the following:

- the method contract is retryable
- the method is non-mutating
- the error itself is marked retryable
- the bounded attempt count has not been exhausted

Mutations are limited to one attempt by default.

## Known Wave 1.1.4 Limitations

The following remain intentionally open for the next batch:

- standardized cancellation
- standardized progress reporting
- safe retry execution policy
- stronger crash isolation
- worker/engine failure containment
- runtime integration coverage
- renderer App.tsx decomposition

The RPC session token is currently available to renderer JavaScript through renderer startup state. This is an interim authenticated loopback design, not the final possible Electron transport architecture.
