# Member Management

CodePet Labs uses WorkOS as the member source of truth.

## Flow

1. An interested builder clicks **Join with GitHub**.
2. WorkOS AuthKit creates the user.
3. The Labs callback marks the user as `pending`.
4. The user adds their GitHub username in `/hub`.
5. An admin reviews `/admin`.
6. Approval creates a CodePet organization membership.
7. If Discord is configured, users can join from `/join`.
8. Approved builders also see the Discord invite and project links in `/hub`.

No separate database is needed for the first version.

## Admin States

- `pending`: signed up and waiting for review.
- `approved`: added to the CodePet WorkOS organization as a builder.
- `not_now`: hidden from the main pending queue.
- `inactive`: org membership is paused in WorkOS.

## Required WorkOS Setup

- Enable AuthKit.
- Enable GitHub Social Login.
- Add redirect URI: `/callback`.
- Set `NEXT_PUBLIC_WORKOS_REDIRECT_URI` to the full callback URL.
- Set the sign-in endpoint to `/login`.
- Create the CodePet Labs organization.
- Create `builder` and `admin` role slugs, or update the env vars.

## Environment Variables

Use `.env.example` as the template. `CODEPET_ADMIN_EMAILS` is a
comma-separated allowlist for people who can open `/admin`.

`CODEPET_DISCORD_INVITE_URL` is optional. If it is set, `/join` shows a public
**Join Discord** button, and active builders also see the link in `/hub`.
