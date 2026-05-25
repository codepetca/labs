import { signOut } from "@workos-inc/authkit-nextjs";
import Link from "next/link";

import { saveBuilderProfile } from "@/app/hub/actions";
import { BuilderProfileWizard } from "@/components/builder-profile-wizard";
import {
  ensureLabsGithubUsername,
  getCurrentLabsUser,
  getLabsConfig,
  getLabsConfigStatus,
  getLabsGithubIdentity,
  isAdminEmail,
} from "@/lib/labs-admin";
import {
  getLabsProfileFormValues,
  hasCompletedLabsProfile,
} from "@/lib/labs-state";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const configStatus = getLabsConfigStatus();

  if (!configStatus.ready) {
    return <SetupNeeded missing={configStatus.missing} />;
  }

  let user = await getCurrentLabsUser();
  const githubIdentity = await getLabsGithubIdentity(user.id);

  if (!githubIdentity) {
    return <GitHubRequired email={user.email} />;
  }

  user = await ensureLabsGithubUsername(user, githubIdentity);

  const config = getLabsConfig();
  const isAdmin = isAdminEmail(user.email);
  const labsStatus = user.metadata.labsStatus ?? "profile_required";
  const isApprovedBuilder = labsStatus === "approved";
  const githubUsername = user.metadata.githubUsername;
  const profileComplete = hasCompletedLabsProfile(user.metadata);
  const emailInitial = getEmailInitial(user.email);

  if (
    labsStatus === "profile_required" ||
    (labsStatus === "pending" && !profileComplete)
  ) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <BuilderProfileWizard
          action={saveBuilderProfile}
          githubUsername={githubUsername}
          initialValues={getLabsProfileFormValues(user.metadata, {
            email: user.email,
            name: getWorkOSName(user),
          })}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {getHubTitle(labsStatus)}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {getHubMessage(labsStatus)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusChip label={isApprovedBuilder ? "builder" : labsStatus} />
            {isAdmin ? <StatusChip label="admin access" /> : null}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-card-soft font-mono text-lg font-semibold text-foreground"
            >
              {emailInitial}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                Profile
              </h2>
              <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <SummaryRow label="GitHub auth" value="Verified" />
            <SummaryRow
              label="GitHub"
              value={githubUsername ? `@${githubUsername}` : "Not added"}
            />
          </dl>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">
          {isApprovedBuilder ? "Next steps" : "Review"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {isApprovedBuilder && config.discordInviteUrl ? (
            <HubLink
              href={config.discordInviteUrl}
              label="Join Discord"
              external
            />
          ) : null}
          <HubLink href="/#tracks" label="Projects" />
          {isAdmin ? <HubLink href="/admin" label="Admin" /> : null}
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
    "rounded-md border border-border bg-card-soft px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-surface";

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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function getHubTitle(status: string) {
  if (status === "approved") {
    return "Builder access";
  }

  if (status === "inactive") {
    return "Access paused";
  }

  if (status === "not_now") {
    return "Not this round";
  }

  return "Application sent";
}

function getHubMessage(status: string) {
  if (status === "approved") {
    return "You have access to the CodePet Labs workspace.";
  }

  if (status === "inactive") {
    return "Your builder access is paused for now.";
  }

  if (status === "not_now") {
    return "We are not adding this profile to the active builder group right now.";
  }

  return "We will review your profile before sharing builder links.";
}

function getEmailInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "?";
}

function getWorkOSName(user: {
  firstName?: string | null;
  lastName?: string | null;
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
}
