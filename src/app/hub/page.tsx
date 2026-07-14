import Link from "next/link";
import { redirect } from "next/navigation";

import { SectionHeading } from "@/components/section-heading";
import { TrackCard } from "@/components/track-card";
import type { ProjectCardProject } from "@/components/project-card";
import {
  ensureLabsGithubUsername,
  getCurrentLabsUser,
  getLabsConfig,
  getLabsConfigStatus,
  getLabsGithubIdentity,
  isAdminEmail,
} from "@/lib/labs-admin";
import {
  getDiscordConfigStatus,
  getDiscordDisplayName,
  getDiscordServerUrl,
} from "@/lib/labs-discord";
import projects from "../../../content/projects.json";

const projectList = projects as ProjectCardProject[];

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
  const discordConfigStatus = getDiscordConfigStatus();
  const isAdmin = isAdminEmail(user.email);
  const isApprovedBuilder = user.metadata.labsStatus === "approved";

  if (!isApprovedBuilder && !isAdmin) {
    redirect("/profile");
  }

  return (
    <main>
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <div>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Codepet Labs
          </h1>
          <p className="mt-3 text-base leading-6 text-muted sm:text-lg">
            Tiny playful experiments.
          </p>
        </div>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ContextLink
            href="/profile"
            label="Profile"
            value={user.metadata.githubUsername ? `@${user.metadata.githubUsername}` : "GitHub"}
          />
          <DiscordLink
            discordDisplayName={
              getDiscordDisplayName({
                discordGlobalName: user.metadata.discordGlobalName ?? null,
                discordUsername: user.metadata.discordUsername ?? null,
              }) ?? null
            }
            inviteUrl={config.discordInviteUrl}
            linkingReady={discordConfigStatus.ready}
          />
          {isAdmin ? (
            <ContextLink href="/admin" label="Admin" value="Review" />
          ) : null}
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <span className="block text-xs font-semibold text-muted">Status</span>
            <span className="mt-1 block text-sm font-semibold text-foreground">
              {isApprovedBuilder ? "Builder" : "Admin"}
            </span>
          </div>
        </section>
      </section>

      <section id="tracks" className="border-y border-border bg-surface/75">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <SectionHeading title="Projects" />

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {projectList.map((project, index) => (
              <TrackCard key={project.name} project={project} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function DiscordLink({
  discordDisplayName,
  inviteUrl,
  linkingReady,
}: {
  discordDisplayName: string | null;
  inviteUrl: string | null;
  linkingReady: boolean;
}) {
  const serverUrl = getDiscordServerUrl();
  const href = discordDisplayName
    ? serverUrl
    : linkingReady
      ? "/discord/link"
      : inviteUrl;

  if (!href) {
    return <ContextStatus label="Discord" value="Setup needed" />;
  }

  return (
    <ContextLink
      href={href}
      label="Discord"
      value={discordDisplayName ?? "Join"}
      external={href.startsWith("http")}
    />
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

function ContextStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <span className="block text-xs font-semibold text-muted">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function ContextLink({
  external = false,
  href,
  label,
  value,
}: {
  external?: boolean;
  href: string;
  label: string;
  value: string;
}) {
  const className =
    "rounded-lg border border-border bg-card p-4 shadow-sm transition hover:bg-card-soft";

  const content = (
    <>
      <span className="block text-xs font-semibold text-muted">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">
        {value}
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
