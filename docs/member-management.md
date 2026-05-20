# Member Management

CodePet Labs uses WorkOS as the member source of truth.

## Flow

1. An interested builder clicks **Join**.
2. WorkOS AuthKit authenticates the user with GitHub.
3. The Labs callback confirms a linked GitHub OAuth identity.
4. The callback marks GitHub-authenticated users as `pending`.
5. The user adds their GitHub username in `/hub`.
6. An admin reviews `/admin`.
7. Approval creates a CodePet organization membership.
8. If Discord is configured, users can join from the home page.
9. Approved builders also see the Discord invite and project links in `/hub`.

No separate database is needed for the first version.

## Admin States

- `pending`: signed up and waiting for review.
- `github_required`: signed in without a linked GitHub OAuth identity.
- `approved`: added to the CodePet WorkOS organization as a builder.
- `not_now`: hidden from the main pending queue.
- `inactive`: org membership is paused in WorkOS.

## Required WorkOS Setup

- Enable AuthKit.
- Enable GitHub Social Login.
- Disable email/password sign-up and any non-GitHub social providers.
- Add redirect URI: `/callback`.
- Set `NEXT_PUBLIC_WORKOS_REDIRECT_URI` to the full callback URL.
- Set the sign-in endpoint to `/login`.
- Create the CodePet Labs organization.
- Create `builder` and `admin` role slugs, or update the env vars.

The app also checks WorkOS user identities server-side. A signed-in user without
a GitHub OAuth identity sees a GitHub-required screen instead of the normal hub.

## Environment Variables

Use `.env.example` as the template. `CODEPET_ADMIN_EMAILS` is a
comma-separated allowlist for people who can open `/admin`.

`CODEPET_DISCORD_INVITE_URL` is optional. If it is set, the home page shows a
public **Join Discord** button, and active builders also see the link in `/hub`.
