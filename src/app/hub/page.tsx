import Link from "next/link";

import { saveGithubUsername } from "@/app/hub/actions";
import {
  getCurrentLabsUser,
  getLabsConfig,
  getLabsConfigStatus,
  getLabsMembership,
  isAdminEmail,
} from "@/lib/labs-admin";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const configStatus = getLabsConfigStatus();

  if (!configStatus.ready) {
    return <SetupNeeded missing={configStatus.missing} />;
  }

  const user = await getCurrentLabsUser();
  const config = getLabsConfig();
  const membership = await getLabsMembership(user.id);
  const isAdmin = isAdminEmail(user.email);
  const isActiveMember = membership?.status === "active";
  const githubUsername = user.metadata.githubUsername;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted">Labs hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {isActiveMember ? "Builder access" : "Thanks for your interest"}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {isActiveMember
              ? "You have access to the CodePet Labs workspace."
              : "We will review your profile. Keep your GitHub handle current."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusChip label={membership?.role.slug ?? "pending"} />
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
          {isActiveMember ? "Next steps" : "Links"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {isActiveMember && config.discordInviteUrl ? (
            <HubLink href={config.discordInviteUrl} label="Join Discord" />
          ) : null}
          <HubLink href="/projects" label="Projects" />
          <HubLink href="/showcase" label="Showcase" />
          {isAdmin ? <HubLink href="/admin" label="Admin" /> : null}
        </div>
      </section>
    </main>
  );
}

function SetupNeeded({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-muted">Labs hub</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
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

function HubLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border bg-card-soft px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
    >
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
