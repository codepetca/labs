import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ensureLabsGithubUsername,
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

  let user = await getCurrentLabsUser();
  const githubIdentity = await getLabsGithubIdentity(user.id);

  if (!githubIdentity) {
    redirect("/profile");
  }

  user = await ensureLabsGithubUsername(user, githubIdentity);

  const config = getLabsConfig();
  const isAdmin = isAdminEmail(user.email);
  const isApprovedBuilder = user.metadata.labsStatus === "approved";

  if (!isApprovedBuilder && !isAdmin) {
    redirect("/profile");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-normal text-accent">
            Approved workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Builder hub
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Start here after approval.
          </p>
        </div>
        <StatusChip label={isApprovedBuilder ? "builder" : "admin"} />
      </div>

      {isApprovedBuilder || isAdmin ? (
        <DiscordSection inviteUrl={config.discordInviteUrl} />
      ) : null}

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HubLink href="/projects" label="Projects" description="Current demos" />
        <HubLink href="/profile" label="Profile" description="Status and GitHub" />
        {isAdmin ? (
          <HubLink href="/admin" label="Admin" description="Review builders" />
        ) : null}
      </section>
    </main>
  );
}

function DiscordSection({ inviteUrl }: { inviteUrl: string | null }) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Discord</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Quick questions and demos. Durable work stays in GitHub.
          </p>
        </div>
        {inviteUrl ? (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Join Discord
          </a>
        ) : (
          <StatusChip label="invite coming soon" />
        )}
      </div>
    </section>
  );
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

function StatusChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-card-soft px-2.5 py-1 text-xs font-semibold text-muted">
      {label}
    </span>
  );
}

function HubLink({
  description,
  href,
  label,
}: {
  description: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:bg-card-soft"
    >
      <span className="block text-sm font-semibold text-foreground">
        {label}
      </span>
      <span className="mt-1 block text-sm text-muted">{description}</span>
    </Link>
  );
}
