# Onboarding

Welcome to Codepet Labs. Start small, keep the scope visible, and build with mock data first.

## First Steps

1. Read the project README and docs.
2. Read the builder expectations before submitting work.
3. Run the app locally.
4. Find the mock data or local content files.
5. Make one small change and open a pull request.
6. Explain what changed, how you tested it, and what remains unfinished.

See [`docs/builder-expectations.md`](./builder-expectations.md) for the plain
expectations around Codepet-directed work, attribution, portfolio use, mock
data, and private material.

## System Boundaries

- Do not use production student data.
- Do not add real auth initially.
- Do not request production Pika access for Labs experiments.
- Do not assume a prototype will ship as-is.
- Do design toward a future Pika-shaped session model.

## Suggested Mock Session Contract

Labs projects should eventually feel compatible with a shared WorkOS/Pika-shaped session contract, even when they start with mock data.

```ts
type CodepetUser = {
  id: string
  workosUserId: string
  email: string
  name: string
  avatarUrl?: string
}

type CodepetOrganization = {
  id: string
  workosOrgId: string
  name: string
  type: "school" | "classroom" | "personal"
}

type CodepetRole = "student" | "teacher" | "admin"

type CodepetSession = {
  user: CodepetUser
  organization: CodepetOrganization
  role: CodepetRole
}
```

## Good First PRs

- Add or edit a mock project.
- Improve a small UI state.
- Add a screenshot to a README.
- Write a short build note.
- Fix a confusing label.

Small, clear PRs are the normal way to build trust.
