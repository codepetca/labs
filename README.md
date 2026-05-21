# CodePet Labs

CodePet Labs is an independent AI-native student software lab/studio connected to the Pika ecosystem.

It is not a school club, formal class, or employment program. It is a small reviewed builder environment where motivated students learn modern software development by building Pika-adjacent tools, prototypes, and experiments.

## Run Locally

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Run checks:

```bash
pnpm lint
pnpm build
```

## Content Model

The public site is static-first. Content lives in local files:

- `content/projects.json` stores project cards shown on the home page and `/projects`.
- `content/updates/2026-summer-launch.md` is rendered on `/projects`.
- `docs/` stores practical operating docs for students and reviewers.

There is no database or production data dependency. The optional member hub uses
WorkOS for authentication and lightweight approval metadata.

## Member Management

Labs has a lightweight WorkOS-backed approval flow:

- The home page sends interested builders to the WorkOS-protected hub.
- AuthKit should be configured for GitHub Social Login only.
- `/hub` requires a linked GitHub OAuth identity, then lets users add their
  GitHub username and see approval status.
- `/admin` lets allowlisted admins approve, pause, reactivate, or hide builders.

Set these environment variables locally and in Vercel:

```bash
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_COOKIE_PASSWORD=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
CODEPET_ADMIN_EMAILS=you@example.com
CODEPET_DISCORD_INVITE_URL=https://discord.gg/...
```

In WorkOS, enable GitHub Social Login and disable email/password sign-up plus
other social providers. See `.env.example` and `docs/member-management.md` for
the full setup.

## Add a Project

Edit `content/projects.json` and add an object:

```json
{
  "name": "Project Name",
  "status": "Prototype",
  "description": "Short description of the work.",
  "focusArea": "Classroom workflow",
  "demoUrl": "#demo-placeholder",
  "githubUrl": "https://github.com/codepetca/codepet-labs",
  "demoVideoUrl": "/videos/project-demo.mp4",
  "contributor": "AB"
}
```

Then run `pnpm lint` and `pnpm build` before opening a pull request.

## Deploy to Vercel

This app is ready for Vercel:

1. Push the repo to GitHub.
2. Create a new Vercel project from the repo.
3. Keep the default Next.js settings.
4. Deploy.

Add the WorkOS environment variables above before enabling the home/member hub
flow in production.

## Docs

- [Vision](docs/vision.md)
- [Operating Model](docs/operating-model.md)
- [Workflow](docs/workflow.md)
- [AI Guidelines](docs/ai-guidelines.md)
- [AI Instructions](docs/ai-instructions.md)
- [UI/UX Style Guide](docs/ui-ux-style.md)
- [Member Management](docs/member-management.md)
- [Discord Setup](docs/discord-setup.md)
- [Onboarding](docs/onboarding.md)
- [Student Roles](docs/student-roles.md)
- [Project Ideas](docs/project-ideas.md)
