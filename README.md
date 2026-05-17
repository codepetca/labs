# CodePet Labs

CodePet Labs is an independent AI-native student software lab/studio connected to the Pika ecosystem.

It is not a school club, formal class, or employment program. It is a small invite-only builder environment where motivated students learn modern software development by building Pika-adjacent tools, prototypes, and experiments.

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

The site is static-first. Content lives in local files:

- `content/projects.json` stores project cards shown on `/projects`.
- `content/updates/2026-summer-launch.md` is rendered on `/showcase`.
- `docs/` stores practical operating docs for students and reviewers.

There is no database, auth layer, or production data dependency.

## Add a Project

Edit `content/projects.json` and add an object:

```json
{
  "name": "Project Name",
  "status": "Prototype",
  "description": "Short description of the work.",
  "focusArea": "Classroom workflow",
  "demoUrl": "#demo-placeholder",
  "githubUrl": "#github-placeholder",
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

No environment variables are required for the initial site.

## Docs

- [Vision](docs/vision.md)
- [Operating Model](docs/operating-model.md)
- [Workflow](docs/workflow.md)
- [AI Guidelines](docs/ai-guidelines.md)
- [Onboarding](docs/onboarding.md)
- [Student Roles](docs/student-roles.md)
- [Project Ideas](docs/project-ideas.md)
