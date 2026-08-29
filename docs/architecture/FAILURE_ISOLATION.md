# Failure Isolation

## Purpose

Wave 1.1.4 establishes explicit failure boundaries so one failed operation does not unnecessarily terminate unrelated PL Creators Suite functionality.

## Renderer Workspace Boundary

Each active creator workspace is wrapped by `WorkspaceErrorBoundary`.

React render and lifecycle failures inside the active workspace are contained to that workspace surface.

Switching workspaces remounts the keyed boundary.

This does not catch asynchronous callback, event-handler, backend, worker, or process failures.

## RPC Boundary

RPC requests are isolated through:

- typed RPC errors
- request validation
- method contracts
- runtime authorization
- correlation identifiers
- bounded retry behavior
- timeout behavior
- cooperative cancellation where supported
- structured logging

An RPC failure returns a structured failure response rather than terminating the desktop process.

## Service Boundary

Service exceptions are normalized at the RPC boundary.

Unexpected internal errors are exposed to the renderer only as sanitized internal RPC failures.

Internal stack traces and arbitrary exception messages are not part of the public RPC contract.

## Mutation Safety

Mutating RPC methods are non-retryable by default.

Filesystem mutations are not implicitly cancellable.

This avoids treating uncertain mutation state as safely repeatable.

## Import Boundary

Project import uses staging and validation before installation.

Failed project imports clean staging state.

Project manifest validation, future-schema rejection, backups, checksums, integrity inspection, and repair entry points are governed by the project persistence layer.

## Desktop Lifecycle Boundary

The desktop application owns one RPC server lifecycle.

Window recreation reuses the existing server instead of creating a second listener.

The server is closed during application shutdown.

## AI Boundary

Local AI is cooperatively cancellable through `AbortSignal`.

Timeout or cancellation errors remain typed RPC failures.

AI execution does not receive implicit filesystem, shell, extension, updater, or destructive authority.

## Engine Boundary

Renderer-side engines remain in-process during Wave 1.1.4.

They therefore do not yet provide process-level crash isolation.

Workspace render containment and normal exception handling reduce UI blast radius, but future worker/runtime architecture must provide stronger crash containment for long-running or unsafe engine work.

## Worker Boundary

A suite-wide worker/job system is not complete in Wave 1.1.4.

Worker crash restart, worker health supervision, job persistence, and process-level isolation remain future shared-platform work.

## Extension Boundary

Current extension discovery and management are permission-classified through RPC.

Third-party extension process isolation and complete capability sandboxing are later extension-platform work.

## Current Guarantee

Wave 1.1.4 guarantees architectural and application-level containment for the boundaries implemented here.

It does not claim that every engine, worker, extension, or future cloud provider is process-isolated.
