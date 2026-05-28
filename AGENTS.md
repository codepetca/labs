# Codepet Labs Agent Notes

For AI session startup and doc routing, read `.ai/START-HERE.md` and
`docs/ai-instructions.md`.

For branch and worktree usage, `docs/dev-workflow.md` is authoritative.
Use one worktree per branch and avoid feature edits in the hub checkout.
After every branch or PR merge, keep the hub checkout on `main` and
fast-forward it to `origin/main`.

Before changing UI, read `docs/ui-ux-style.md`.

Keep the public site mobile-first, minimal, and low-text. Prefer concise labels,
small cards, obvious actions, and mock-data messaging. Do not add new auth beyond
the documented WorkOS membership flow, databases, production Pika access, or
real student data flows to this repo.

Run `pnpm lint`, `pnpm test`, and `pnpm build` before shipping code changes.
Run `pnpm test:e2e` when public routes or user flows change.
