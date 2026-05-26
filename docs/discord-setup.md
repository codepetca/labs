# Discord Setup

CodePet Labs uses Discord as an optional builder hangout for lightweight feedback,
feature jams, and AI-assisted discussion. GitHub and the public site should remain
the durable places for decisions, project work, and school-friendly access.

Start intentionally small. One active builder channel is enough until traffic
makes project-specific channels useful.

## Boundaries

- Keep Discord optional for participation.
- Do not require Discord for school-day work.
- Do not post real student data, credentials, or production Pika details.
- Use mock data and public-safe screenshots.
- Keep AI helper output clearly labeled in the active builder channel.
- Add project channels only after one project has enough repeated discussion.

## Manual First Steps

1. Create a blank Discord server in the Discord app.
2. Create a bot in the Discord Developer Portal.
3. Invite the bot to the server with these permissions:
   - Create Instant Invite
   - Manage Channels
   - Manage Roles
   - Manage Messages
   - Kick Members
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
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=
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
- `AI Helper`

Created channels:

```text
CODEPET LABS
#announcements
#builders

VOICE
Office Hours
```

Keep most discussion in `#builders`: questions, intros, demos, lightweight AI
help, and quick feedback. Use GitHub issues, PRs, and docs for durable decisions.
The `CODEPET LABS` category is private to `Builder`, `Moderator`, `Labs Admin`,
and `AI Helper`. The site assigns and removes the `Builder` role after a builder
clicks **Join Discord** from `/hub`. The bot's `AI Helper` role includes Create
Instant Invite so Discord OAuth can add approved builders to the server.

If you already ran an older bootstrap, delete unused channels manually. The
script does not delete existing Discord content.

## After Bootstrap

1. Review every channel and delete anything you do not want.
2. Assign yourself `Labs Admin`.
3. Assign trusted helpers `Moderator`.
4. Optionally generate a Discord invite and set `CODEPET_DISCORD_INVITE_URL`.
   This is only a fallback while Discord OAuth is not fully configured.
5. Keep `#announcements` low-noise and read-only.
6. In the Discord Developer Portal, add the OAuth redirect URI:
   `/discord/callback`.

Create more channels only when a real pattern appears:

- `#project-name` for a project with repeated discussion.
- `#office-hours` or a voice channel for scheduled help.
- `#ai-lab` only if AI helper traffic starts crowding normal discussion.

Later bot work should be added as explicit slash commands, such as:

- `/summarize-thread`
- `/draft-feature-spec`
- `/triage-feedback`
- `/slowmode`
- `/lock-thread`
