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
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-normal text-accent">
              Approved workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Builder hub
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              Links for CodePet Labs builders.
            </p>
          </div>
          <StatusChip label={isApprovedBuilder ? "builder" : "admin"} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isApprovedBuilder && config.discordInviteUrl ? (
            <HubLink
              href={config.discordInviteUrl}
              label="Join Discord"
              external
            />
          ) : null}
          <HubLink href="/projects" label="Projects" />
          <HubLink href="/profile" label="Profile" />
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
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "inline-flex min-h-11 items-center rounded-md border border-border bg-card-soft px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-surface";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
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
