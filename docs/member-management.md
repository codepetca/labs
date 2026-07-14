# Member Management

Codepet Labs uses WorkOS as the member source of truth.

## Flow

1. An interested builder clicks **Join**.
2. WorkOS AuthKit authenticates the user with GitHub.
3. The Labs callback confirms a linked GitHub OAuth identity.
4. The callback marks GitHub-authenticated users as `profile_required`.
5. The callback or profile page resolves the GitHub username when possible.
6. The user completes the short builder profile wizard in `/profile`.
7. Profile completion marks the user as `pending`.
8. An admin reviews `/admin`.
9. Approval marks the user as an approved builder in WorkOS metadata and sends
   an approval email pointing them back to `/hub` when email is configured.
10. Approved builders use `/hub` for Discord and project links.
11. Builders click **Join Discord** from `/hub`; Discord OAuth stores the user
    ID in WorkOS metadata so admins can remove Discord access later.
12. Pausing a linked builder removes the Discord `Builder` role.
13. The paused list can remove Discord access, or remove the paused builder
    from Labs entirely. Full removal first kicks them from Discord when linked,
    then permanently deletes the WorkOS user. If Discord removal cannot run,
    the builder stays paused so an admin can retry.

Admin allowlist users skip the builder application flow. After sign-in, `/profile`
redirects them to `/admin`, and admin users are excluded from review buckets.

No separate database is needed for the first version.

## Admin States

- `pending`: signed up and waiting for review.
- `github_required`: signed in without a linked GitHub OAuth identity.
- `profile_required`: signed in with GitHub and still needs the builder profile.
- `approved`: approved as a Codepet Labs builder.
- `not_now`: hidden from the main pending queue.
- `inactive`: builder access is paused.

## Required WorkOS Setup

- Enable AuthKit.
- Enable GitHub Social Login.
- Disable email/password sign-up and any non-GitHub social providers.
- Add redirect URI: `/callback`.
- Set `NEXT_PUBLIC_WORKOS_REDIRECT_URI` to the full callback URL.
- Set the sign-in endpoint to `/login`.

The app also checks WorkOS user identities server-side. A signed-in user without
a GitHub OAuth identity sees a GitHub-required screen instead of the normal profile page.

No WorkOS organization is required for the first version. Builder state lives in
user metadata so Labs can stay small until organization roles or SSO are needed.

## Environment Variables

Use `.env.example` as the template. `CODEPET_ADMIN_EMAILS` is a
comma-separated allowlist for people who can open `/admin`.

`CODEPET_DISCORD_INVITE_URL` is optional. It is only a fallback link when
Discord OAuth is not fully configured.

Admin repository selection requires a private Vercel Blob store. Set its token
as `CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN`. If a previous deployment wrote
`admin/observed-repos.json` to a public store, delete that legacy blob after
deploying this change.

Approval emails use Brevo transactional email. Set `BREVO_API_KEY`,
`CODEPET_EMAIL_FROM_ADDRESS`, `CODEPET_EMAIL_FROM_NAME`, and
`CODEPET_LABS_URL` to send an email when an admin approves a builder. The email
links to `/hub` instead of a raw Discord invite so Labs can keep access checks
and Discord role assignment in the app.

Discord linking needs `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
`DISCORD_REDIRECT_URI`, `DISCORD_BOT_TOKEN`, and `DISCORD_GUILD_ID`. The Discord
OAuth redirect URI must point to `/discord/callback`.
