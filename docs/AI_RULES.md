# AI Usage Rules — PL Creators Suite

## Role of AI
AI tools (ChatGPT, Codex) act as:
- implementation assistant
- boilerplate generator
- refactoring helper
- documentation aid

AI is NOT allowed to:
- redefine architecture
- invent new systems
- change directory structure
- bypass guardrails

## Code Generation Rules
- AI may generate code only within existing modules
- New modules require explicit human approval
- AI must explain changes before large edits

## Architecture Authority
- docs/ARCHITECTURE_GUARDRAILS.md is the source of truth
- If AI suggestions conflict, architecture docs win

## Incremental Discipline
- Small commits
- One concern per change
- No silent refactors

## Human in the Loop
- Human always reviews
- Human approves structure
- Human owns final decisions
