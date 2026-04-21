# Agent Rules

This file defines the default working rules for agents operating in this repository.

## Core Rules

1. Do not bypass Git hooks. Never use `git commit --no-verify` or `git push --no-verify`.
2. Do not bypass the repository's verification flow. Respect local hooks and CI checks instead of skipping them.
3. Do not revert or overwrite user-authored changes unless the user explicitly asks for that.
4. Run the minimum relevant verification for the files you changed. If you cannot run it, say so clearly in your final handoff.
5. Use the repository scripts for formatting and verification whenever possible.

## Verification Baseline

- Pre-commit hook runs `yarn lint-staged`.
- Pre-push hook runs `yarn typecheck`.
- CI runs `yarn lint`, `yarn format:check`, `yarn typecheck`, and Playwright E2E.

## Common Commands

- `yarn lint`
- `yarn format:check`
- `yarn typecheck`
- `yarn test:e2e`

Prefer the smallest command set that still validates the change you made.
