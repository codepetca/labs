# CodePet Labs - AI Agent Starting Checklist

Follow this checklist at the start of every AI-assisted coding session.

## Start Here

```text
[ ] Resolve repo root: git rev-parse --show-toplevel
[ ] Check status: git status --short --branch
[ ] Read: AGENTS.md
[ ] Read: .ai/CURRENT.md
[ ] Read: docs/ai-instructions.md
[ ] Load the task-specific docs listed in docs/ai-instructions.md
[ ] Confirm the work stays inside CodePet Labs boundaries
```

## Boundaries

- Keep CodePet Labs Pika-adjacent, not Pika-core.
- Do not add production Pika access or production student data flows.
- Use mock data and local content first.
- Keep public-site changes mobile-first, minimal, and low-text.
- Treat WorkOS only as the lightweight Labs membership layer already described
  in the docs; do not expand auth or add a database without explicit approval.

## Before Coding

- Prefer the existing Next.js App Router, TypeScript, and Tailwind patterns.
- Keep changes small and reviewable.
- For UI work, read `docs/ui-ux-style.md` before editing.
- For membership/admin work, read `docs/member-management.md` before editing.
- For docs/content work, match the concise tone already used in `docs/`.

## Before Handoff

- Explain what changed, how it was checked, and what remains unfinished.
- Run `pnpm lint` and `pnpm build` before shipping code or UI changes.
- For docs-only changes, at minimum review the rendered links and run
  `git diff --check`.

## Source Order

When docs disagree, trust them in this order:

1. `AGENTS.md`
2. `.ai/CURRENT.md`
3. `docs/ai-instructions.md`
4. `README.md`
5. Task-specific docs in `docs/`
