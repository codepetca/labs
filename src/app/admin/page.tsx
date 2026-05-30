import { unstable_rethrow } from "next/navigation";

import {
  approveUser,
  markNotNow,
  pauseBuilder,
  reactivateBuilder,
  removeBuilderFromDiscord,
  removePausedUser,
  restorePotentialUser,
} from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  getLabsConfigStatus,
  getLabsDirectory,
  type LabsUser,
  requireLabsAdmin,
} from "@/lib/labs-admin";
import { getDiscordDisplayName } from "@/lib/labs-discord";
import {
  getLabsOptionLabels,
  LABS_AVAILABILITY_OPTIONS,
  LABS_GITHUB_COMFORT_OPTIONS,
  LABS_INTEREST_OPTIONS,
  LABS_ROLE_OPTIONS,
} from "@/lib/labs-state";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configStatus = getLabsConfigStatus();

  if (!configStatus.ready) {
    return <SetupNeeded missing={configStatus.missing} />;
  }

  let directory: Awaited<ReturnType<typeof getLabsDirectory>>;

  try {
    await requireLabsAdmin();
    directory = await getLabsDirectory();
  } catch (error) {
    unstable_rethrow(error);
    return <AccessProblem error={error} />;
  }

  return <AdminDashboard directory={directory} />;
}

function AdminDashboard({
  directory,
}: {
  directory: Awaited<ReturnType<typeof getLabsDirectory>>;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Codepet members
          </h1>
          <div className="grid grid-cols-4 gap-2">
            <Metric
              label="Started"
              value={directory.profileRequiredUsers.length}
            />
            <Metric label="Pending" value={directory.pendingUsers.length} />
            <Metric label="Members" value={directory.activeBuilders.length} />
            <Metric label="Paused" value={directory.inactiveBuilders.length} />
          </div>
        </div>
      </section>

      <AdminSection title="Applications" count={directory.pendingUsers.length}>
        {directory.pendingUsers.length ? (
          directory.pendingUsers.map((user) => (
            <UserCard key={user.id} user={user}>
              <form action={approveUser}>
                <input type="hidden" name="userId" value={user.id} />
                <ActionButton label="Approve" primary />
              </form>
              <form action={markNotNow}>
                <input type="hidden" name="userId" value={user.id} />
                <ActionButton label="Not now" />
              </form>
            </UserCard>
          ))
        ) : (
          <EmptyState label="No pending requests." />
        )}
      </AdminSection>

      {directory.profileRequiredUsers.length ? (
        <AdminSection title="Started" count={directory.profileRequiredUsers.length}>
          {directory.profileRequiredUsers.map((user) => (
            <UserCard key={user.id} user={user}>
              <form action={markNotNow}>
                <input type="hidden" name="userId" value={user.id} />
                <ActionButton label="Not now" />
              </form>
            </UserCard>
          ))}
        </AdminSection>
      ) : null}

      <AdminSection title="Members" count={directory.activeBuilders.length}>
        {directory.activeBuilders.length ? (
          directory.activeBuilders.map((user) => (
            <UserCard key={user.id} user={user} showProfile={false}>
              <form action={pauseBuilder}>
                <input type="hidden" name="userId" value={user.id} />
                <input
                  type="hidden"
                  name="discordUserId"
                  value={user.discordUserId ?? ""}
                />
                <ActionButton label="Pause" />
              </form>
            </UserCard>
          ))
        ) : (
          <EmptyState label="No active builders." />
        )}
      </AdminSection>

      <AdminSection title="Paused" count={directory.inactiveBuilders.length}>
        {directory.inactiveBuilders.length ? (
          directory.inactiveBuilders.map((user) => (
            <UserCard key={user.id} user={user} showProfile={false}>
              <form action={reactivateBuilder}>
                <input type="hidden" name="userId" value={user.id} />
                <input
                  type="hidden"
                  name="discordUserId"
                  value={user.discordUserId ?? ""}
                />
                <ActionButton label="Reactivate" primary />
              </form>
              <DiscordRemovalForm user={user} />
              <PausedUserRemovalForm user={user} />
            </UserCard>
          ))
        ) : (
          <EmptyState label="No paused builders." />
        )}
      </AdminSection>

      {directory.archivedUsers.length ? (
        <AdminSection title="Not now" count={directory.archivedUsers.length}>
          {directory.archivedUsers.map((user) => (
            <UserCard key={user.id} user={user}>
              <form action={restorePotentialUser}>
                <input type="hidden" name="userId" value={user.id} />
                <ActionButton label="Restore" />
              </form>
            </UserCard>
          ))}
        </AdminSection>
      ) : null}
    </main>
  );
}

function AdminSection({
  count,
  title,
  children,
}: {
  count: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 border-t border-border pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span className="text-xs font-semibold text-muted">{count}</span>
      </div>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function UserCard({
  user,
  children,
  showProfile = true,
}: {
  user: LabsUser;
  children: React.ReactNode;
  showProfile?: boolean;
}) {
  return (
    <article className="grid gap-2 rounded-md border border-border bg-card p-2.5 sm:grid-cols-[1fr_auto] sm:items-center">
      <UserSummary user={user} showProfile={showProfile} />
      <div className="flex flex-wrap gap-2 sm:justify-end">{children}</div>
    </article>
  );
}

function UserSummary({
  showProfile,
  user,
}: {
  showProfile: boolean;
  user: LabsUser;
}) {
  const contactEmail = user.contactEmail ?? user.email;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-semibold text-foreground">{user.name}</p>
        {user.affiliation ? (
          <span className="text-xs text-muted">{user.affiliation}</span>
        ) : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        <a href={`mailto:${contactEmail}`} className="hover:text-foreground">
          {contactEmail}
        </a>
        {contactEmail !== user.email ? <span>Auth: {user.email}</span> : null}
        {user.githubUsername ? (
          <a
            href={`https://github.com/${user.githubUsername}`}
            className="hover:text-foreground"
          >
            @{user.githubUsername}
          </a>
        ) : (
          <span>No GitHub handle</span>
        )}
        {getDiscordDisplayName(user) ? (
          <span>Discord: {getDiscordDisplayName(user)}</span>
        ) : (
          <span>No Discord link</span>
        )}
      </div>
      {showProfile && user.labsProfileCompletedAt ? (
        <ProfileDetails user={user} />
      ) : null}
    </div>
  );
}

function PausedUserRemovalForm({ user }: { user: LabsUser }) {
  return (
    <form action={removePausedUser}>
      <input type="hidden" name="userId" value={user.id} />
      <ConfirmSubmitButton
        className={getActionButtonClassName({ tone: "danger" })}
        message={[
          `Remove ${user.name} from Codepet Labs?`,
          "This deletes the WorkOS user and cannot be undone.",
        ].join(" ")}
      >
        Remove user
      </ConfirmSubmitButton>
    </form>
  );
}

function DiscordRemovalForm({ user }: { user: LabsUser }) {
  return (
    <form action={removeBuilderFromDiscord}>
      <input type="hidden" name="userId" value={user.id} />
      <input
        type="hidden"
        name="discordUserId"
        value={user.discordUserId ?? ""}
      />
      <ActionButton label="Remove Discord" disabled={!user.discordUserId} />
    </form>
  );
}

function ProfileDetails({ user }: { user: LabsUser }) {
  const details = [
    getCompactProfileLine("Role", user.preferredRole, LABS_ROLE_OPTIONS),
    getCompactProfileLine("Interests", user.interests, LABS_INTEREST_OPTIONS),
    getCompactProfileLine(
      "Availability",
      user.availability,
      LABS_AVAILABILITY_OPTIONS,
    ),
    getCompactProfileLine(
      "GitHub",
      user.githubComfort,
      LABS_GITHUB_COMFORT_OPTIONS,
    ),
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail),
  );

  if (!details.length && !user.buildGoal) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1 text-xs text-muted">
      {details.length ? (
        <dl className="flex flex-wrap gap-x-3 gap-y-1">
          {details.map((detail) => (
            <div key={detail.label} className="flex gap-1">
              <dt className="font-medium text-foreground">{detail.label}:</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {user.buildGoal ? (
        <p className="max-w-full truncate">
          <span className="font-medium text-foreground">Goal:</span>{" "}
          {user.buildGoal}
        </p>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-16 rounded-md border border-border bg-card px-3 py-2 text-right">
      <p className="text-[11px] font-semibold text-muted">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-semibold text-muted">
      {label}
    </span>
  );
}

function ActionButton({
  disabled = false,
  label,
  primary = false,
}: {
  disabled?: boolean;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={getActionButtonClassName({ primary })}
    >
      {label}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-border bg-card p-2.5 text-sm text-muted">
      {label}
    </p>
  );
}

function SetupNeeded({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Setup needed
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Add these environment variables before using member approval.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {missing.map((key) => (
            <Chip key={key} label={key} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AccessProblem({ error }: { error: unknown }) {
  const message =
    error instanceof Error && error.message.includes("Not authorized")
      ? "This page is only for Codepet Labs admins."
      : "Check the WorkOS configuration and try again.";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Access unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
      </section>
    </main>
  );
}

function getCompactProfileLine(
  label: string,
  storedValue: string | null,
  options: Parameters<typeof getLabsOptionLabels>[1],
) {
  const labels = getLabsOptionLabels(storedValue, options);

  return labels.length ? { label, value: labels.join(", ") } : null;
}

function getActionButtonClassName({
  primary = false,
  tone = "default",
}: {
  primary?: boolean;
  tone?: "default" | "danger";
}) {
  if (primary) {
    return "min-h-9 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
  }

  if (tone === "danger") {
    return "min-h-9 rounded-md border border-warm bg-warm-soft px-3 text-sm font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40";
  }

  return "min-h-9 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40";
}
