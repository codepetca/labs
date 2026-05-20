# AI Instructions for CodePet Labs

This file routes AI coding agents to the right project docs. Use it after
`.ai/START-HERE.md`.

CodePet Labs intentionally keeps lighter guidance than Pika core. Do not copy
Pika-only workflow, database, migration, feature-inventory, or production-access
rules into this repo unless the project explicitly adopts them.

## Default Startup Context

Read these files at the start of every session:

1. [`.ai/START-HERE.md`](../.ai/START-HERE.md)
2. [`.ai/CURRENT.md`](../.ai/CURRENT.md)
3. [`AGENTS.md`](../AGENTS.md)
4. [`README.md`](../README.md)
5. [`docs/ai-instructions.md`](./ai-instructions.md)

After that, load only the docs needed for the task.

## Task Routing

| Task | Read next |
|---|---|
| Public site UI or page copy | [`docs/ui-ux-style.md`](./ui-ux-style.md), relevant page/component |
| Project cards or showcase content | [`docs/project-ideas.md`](./project-ideas.md), `content/projects.json`, `content/updates/` |
| Labs purpose, positioning, or policy copy | [`docs/vision.md`](./vision.md), [`docs/operating-model.md`](./operating-model.md) |
| Builder onboarding or student expectations | [`docs/onboarding.md`](./onboarding.md), [`docs/student-roles.md`](./student-roles.md), [`docs/ai-guidelines.md`](./ai-guidelines.md) |
| Membership, join, hub, or admin flow | [`docs/member-management.md`](./member-management.md), `README.md` environment section |
| Discord setup or community operations | [`docs/discord-setup.md`](./discord-setup.md), `scripts/setup-discord.mjs` |
| Workflow, PRs, demos, and reviews | [`docs/workflow.md`](./workflow.md), [`docs/ai-guidelines.md`](./ai-guidelines.md) |
| Build, dependencies, or deployment | `README.md`, `package.json`, `next.config.ts` |

Inspect or modify source only after the startup context and task-specific docs
are loaded.

## Testing And TDD

CodePet Labs does not currently have a dedicated test script or test harness.
Do not claim strict TDD is required for this repo yet.

- Preserve `pnpm lint` and `pnpm build` as the normal checks for code or UI.
- For future non-trivial behavior changes, prefer adding tests once a test
  harness exists.
- If a behavior change ships without tests, explain why in the handoff.
- Do not require tests for docs-only changes, copy edits, visual-only polish,
  scaffolding experiments, or mock-data prototypes.

## Repo Invariants

- Keep the public site mobile-first, minimal, low-text, and mock-data-first.
- Keep Pika core protected; Labs work should orbit Pika without depending on
  production Pika access.
- Do not add real student data flows.
- Do not add a database or new auth model without explicit approval.
- Keep WorkOS usage limited to the documented lightweight membership flow.
- Prefer local content files over dynamic storage for public-site content.
- Preserve small, reviewable PRs with clear test notes.
- Use existing project patterns before adding abstractions or dependencies.

## Agent Modes

Use these modes as lightweight lenses, not as separate required processes.

| Mode | Use for | Must do |
|---|---|---|
| Product/Docs | Vision, onboarding, workflow, AI guidance, project descriptions | Keep text concise, concrete, and aligned with Labs boundaries |
| UI/UX | Public pages, components, responsive layout, visual polish | Read `docs/ui-ux-style.md`, check mobile first, avoid dense explanatory blocks |
| Implementation | Next.js routes, components, server actions, scripts | Keep logic simple, follow existing patterns, avoid unrelated refactors |
| Membership | Join, hub, admin, WorkOS configuration | Stay within `docs/member-management.md`; do not add a database or student records |
| Review/QA | PR review, verification, cleanup | Lead with bugs and risks, then list checks run and remaining gaps |

## Verification

Use the smallest verification that covers the change:

- Docs-only changes: review links and run `git diff --check`.
- Content-only changes: run `pnpm lint` if TypeScript or JSON shape can be
  affected.
- Code or UI changes: run `pnpm lint` and `pnpm build`.
- Behavior changes: add or update tests when a test harness exists; otherwise
  state that no test harness exists and describe the manual check.
- UI changes: also inspect the page at mobile width and include screenshots or
  a short screen recording in the PR when useful.

## Source Of Truth Order

When guidance conflicts, trust this order:

1. `AGENTS.md`
2. `.ai/CURRENT.md`
3. `docs/ai-instructions.md`
4. `README.md`
5. Task-specific docs in `docs/`
6. Source code and local content files
