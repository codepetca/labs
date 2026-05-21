# CodePet Labs Development Workflow

This document is the canonical source for CodePet Labs branch and worktree
usage. It adapts the Pika workflow to this smaller repo without importing
Pika-only database, migration, feature-inventory, or production-release rules.

## Core Rules

- Use one git worktree per branch.
- Do not switch branches inside an existing feature worktree.
- Treat `$HOME/Repos/codepet-labs` as the hub checkout unless the user
  explicitly says otherwise.
- Do not do feature or branch work in the hub checkout. If edits start there,
  create or open a dedicated worktree first.
- Resolve the current repo root with `git rev-parse --show-toplevel` and run
  commands from that root.

## Worktree Locations

New named CodePet Labs worktrees should live under:

```bash
$HOME/.codex/worktrees/codepet-labs/<branch-slug>
```

Codex Desktop may also create app-managed worktrees under:

```bash
$HOME/.codex/worktrees/<id>/codepet-labs
```

Both are valid. The important rule is that each task has one current checkout
and one branch.

Existing sibling worktrees under `$HOME/Repos/` are okay to finish, but
prefer the `$HOME/.codex/worktrees/codepet-labs/` location for new work.

## Starting New Work

From the hub checkout:

```bash
HUB="$HOME/Repos/codepet-labs"
WT_ROOT="$HOME/.codex/worktrees/codepet-labs"
BRANCH="codex/<short-task-name>"
WT="$WT_ROOT/<short-task-name>"
BASE="${BASE:-origin/main}"

mkdir -p "$WT_ROOT"
git -C "$HUB" fetch origin
git -C "$HUB" worktree add -b "$BRANCH" "$WT" "$BASE"
cd "$WT"
```

Use `BASE=HEAD` or `BASE=<branch-name>` only when intentionally stacking on the
current checkout or another unmerged branch.

If the branch already exists, open the existing worktree instead of creating a
duplicate:

```bash
git -C "$HUB" worktree list
```

## Environment Files

This repo does not have Pika's shared Supabase environment setup. Keep Labs
environment handling simple:

- Never commit `.env.local`.
- Use `.env.example` as the public reference.
- If a worktree needs the same local WorkOS/Discord config as the hub, symlink
  the hub's private env file:

```bash
ln -s "$HOME/Repos/codepet-labs/.env.local" .env.local
```

Only create branch-specific env files when intentionally testing different
WorkOS or Discord settings.

## Verification

Run the smallest checks that cover the change:

- Docs-only: `git diff --check`
- Code or UI: `pnpm lint`, `pnpm test`, and `pnpm build`
- Public routes, navigation, or user flows: also run `pnpm test:e2e`

If port `3000` is already serving another app, use another port for manual or
e2e verification and say so in the handoff.

## Cleanup

After a branch is merged, clean up from the hub checkout:

```bash
HUB="$HOME/Repos/codepet-labs"
BRANCH="codex/<short-task-name>"

git -C "$HUB" fetch origin
WT_PATH="$(git -C "$HUB" worktree list --porcelain \
  | awk -v branch="$BRANCH" '
      /^worktree / { path=substr($0, 10) }
      /^branch refs\/heads\// {
        ref=substr($0, 19)
        if (ref == branch) { print path; exit }
      }')"

if [ -n "$WT_PATH" ]; then
  git -C "$HUB" worktree remove "$WT_PATH"
fi

git -C "$HUB" branch -D "$BRANCH"
```
