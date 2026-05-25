# Discord Setup

CodePet Labs uses Discord as an optional builder hangout for lightweight feedback,
feature jams, and AI-assisted discussion. GitHub and the public site should remain
the durable places for decisions, project work, and school-friendly access.

## Boundaries

- Keep Discord optional for participation.
- Do not require Discord for school-day work.
- Do not post real student data, credentials, or production Pika details.
- Use mock data and public-safe screenshots.
- Keep AI helpers clearly labeled and confined to `#ai-builder-lab` at first.

## Manual First Steps

1. Create a blank Discord server in the Discord app.
2. Create a bot in the Discord Developer Portal.
3. Invite the bot to the server with these permissions:
   - Manage Channels
   - Manage Roles
   - Manage Messages
   - Moderate Members
   - Read Message History
   - Send Messages
   - Use Slash Commands
4. Copy `.env.example` to `.env.local` if needed.
5. Set these local variables:

```bash
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=
CODEPET_DISCORD_INVITE_URL=
```

Do not paste the bot token into chat, commit it, or add it to public Vercel
variables unless a hosted bot actually needs it.

## Bootstrap Server Layout

Run:

```bash
pnpm discord:setup
```

The script is additive and idempotent:

- It creates missing roles.
- It creates missing categories and channels.
- It updates channel topics and permission overwrites for the managed channels.
- It posts starter messages only into empty starter channels.
- It does not delete existing Discord content.

Created roles:

- `Labs Admin`
- `Moderator`
- `Builder`
- `Tester`
- `Pika User`
- `AI Helper`

Created channels:

```text
START HERE
#welcome
#announcements
#rules
#introductions

CODEPET LABS
#feature-ideas
#bug-reports
#questions
#show-and-tell
#roadmap

BUILDERS
#design-review
#implementation-notes
#ai-builder-lab

VOICE
Office Hours
Feature Jam
```

The `BUILDERS` category is private to `Builder`, `Moderator`, `Labs Admin`, and
`AI Helper`. Assign roles manually after members join.

## After Bootstrap

1. Review every channel and delete anything you do not want.
2. Assign yourself `Labs Admin`.
3. Assign trusted helpers `Moderator`.
4. Generate a Discord invite and set `CODEPET_DISCORD_INVITE_URL`.
   This enables the **Join Discord** button on the home page.
5. Keep `#announcements`, `#rules`, and `#roadmap` low-noise and read-only.

Later bot work should be added as explicit slash commands, such as:

- `/summarize-thread`
- `/draft-feature-spec`
- `/triage-feedback`
- `/slowmode`
- `/lock-thread`
