import { signOut } from "@workos-inc/authkit-nextjs";
import Link from "next/link";

import { saveGithubUsername } from "@/app/hub/actions";
import {
  getCurrentLabsUser,
  getLabsConfig,
  getLabsConfigStatus,
  getLabsGithubIdentity,
  isAdminEmail,
} from "@/lib/labs-admin";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const configStatus = getLabsConfigStatus();

  if (!configStatus.ready) {
    return <SetupNeeded missing={configStatus.missing} />;
  }

  const user = await getCurrentLabsUser();
  const githubIdentity = await getLabsGithubIdentity(user.id);

  if (!githubIdentity) {
    return <GitHubRequired email={user.email} />;
  }

  const config = getLabsConfig();
  const isAdmin = isAdminEmail(user.email);
  const labsStatus = user.metadata.labsStatus ?? "pending";
  const isApprovedBuilder = labsStatus === "approved";
  const githubUsername = user.metadata.githubUsername;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {isApprovedBuilder ? "Builder access" : "Thanks for your interest"}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {isApprovedBuilder
              ? "You have access to the CodePet Labs workspace."
              : "We will review your profile. Keep your GitHub handle current."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusChip label={isApprovedBuilder ? "builder" : labsStatus} />
            {isAdmin ? <StatusChip label="admin access" /> : null}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="rounded-md border border-border bg-card-soft p-3">
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
            </div>
            <div className="rounded-md border border-border bg-card-soft p-3">
              <dt className="text-muted">GitHub auth</dt>
              <dd className="mt-1 font-medium text-foreground">Verified</dd>
            </div>
            <div className="rounded-md border border-border bg-card-soft p-3">
              <dt className="text-muted">GitHub</dt>
              <dd className="mt-1 font-medium text-foreground">
                {githubUsername ? `@${githubUsername}` : "Not added"}
              </dd>
            </div>
          </dl>

          <form action={saveGithubUsername} className="mt-4 flex gap-2">
            <input
              name="githubUsername"
              placeholder="github username"
              defaultValue={githubUsername ?? ""}
              className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Save
            </button>
          </form>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          {isApprovedBuilder ? "Next steps" : "Links"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {isApprovedBuilder && config.discordInviteUrl ? (
            <HubLink href={config.discordInviteUrl} label="Join Discord" />
          ) : null}
          <HubLink href="/#tracks" label="Projects" />
          {isAdmin ? <HubLink href="/admin" label="Admin" plain /> : null}
        </div>
      </section>
    </main>
  );
}

function GitHubRequired({ email }: { email: string }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          GitHub required
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          You are signed in as {email}. Sign out, then use GitHub to continue.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft"
          >
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}

async function signOutAction() {
  "use server";

  await signOut({ returnTo: "/" });
}

function SetupNeeded({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Auth setup needed
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add the WorkOS environment variables before enabling sign-in.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {missing.map((key) => (
            <StatusChip key={key} label={key} />
          ))}
        </div>
      </section>
    </main>
  );
}

function HubLink({
  href,
  label,
  plain = false,
}: {
  href: string;
  label: string;
  plain?: boolean;
}) {
  const className =
    "rounded-md border border-border bg-card-soft px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-surface";

  if (plain) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function StatusChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-card-soft px-2.5 py-1 text-xs font-semibold text-muted">
      {label}
    </span>
  );
}
