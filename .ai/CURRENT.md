# CodePet Labs Current Context

Read this file at the start of every AI-assisted coding session. It is the
compact continuity layer for the repo.

## Current Shape

- CodePet Labs is an independent AI-native student software lab connected to
  the Pika ecosystem.
- The public site is static-first and content-driven.
- Projects should be Pika-adjacent prototypes, not production Pika features.
- Labs work should create learning, attribution, and portfolio value.

## Product Boundaries

- Pika core stays supervised and protected.
- Labs prototypes use mock data first.
- Do not use production student data.
- Do not introduce direct Pika production dependencies.
- Do not add a new database or real student workflow unless explicitly approved.
- WorkOS is the current lightweight membership source of truth for the optional
  member hub/admin flow.

## Repo Facts

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS, with the local visual direction in
  `docs/ui-ux-style.md`.
- Package manager: pnpm.
- Public content: `content/projects.json`, `content/updates/`, and `docs/`.
- Membership docs: `docs/member-management.md`.
- Discord setup docs: `docs/discord-setup.md`.
- Testing posture: small Vitest and Playwright harness; use `pnpm lint`,
  `pnpm test`, and `pnpm build` for code/UI changes, plus `pnpm test:e2e` for
  public routes or flows.
- Hub checkout: `$HOME/Repos/codepet-labs`.
- New named worktrees: `$HOME/.codex/worktrees/codepet-labs/<branch-slug>`.
- Branch and worktree workflow lives in `docs/dev-workflow.md`.

## Known Hazards

- Do not do feature or branch work in the hub checkout; create or open a
  dedicated worktree first.
- Do not let Labs docs imply students have unsupervised Pika core access.
- Keep copy short; this repo should not become a dense marketing site.
- Keep demo data obviously mocked.
- Avoid expanding WorkOS membership into a full LMS, CRM, or student-data
  system.
- UI changes should be checked at mobile width first.

## Normal Checks

- Docs-only: review changed Markdown and run `git diff --check`.
- Code or UI: run `pnpm lint`, `pnpm test`, and `pnpm build`.
- Public routes or flows: also run `pnpm test:e2e`.
- Behavior changes: add or update focused tests when practical; otherwise
  explain the gap and describe the manual verification.
