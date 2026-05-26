import { unstable_rethrow } from "next/navigation";

import {
  approveUser,
  markNotNow,
  pauseBuilder,
  reactivateBuilder,
  removeBuilderFromDiscord,
  restorePotentialUser,
} from "@/app/admin/actions";
import {
  getLabsConfigStatus,
  getLabsDirectory,
  type LabsUser,
  requireLabsAdmin,
} from "@/lib/labs-admin";
import { getDiscordDisplayName } from "@/lib/labs-discord";
import {
  getLabsOptionLabels,
  LABS_AI_TOOL_OPTIONS,
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
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          CodePet members
        </h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric
            label="Started"
            value={directory.profileRequiredUsers.length}
          />
          <Metric label="Pending" value={directory.pendingUsers.length} />
          <Metric label="Builders" value={directory.activeBuilders.length} />
          <Metric label="Paused" value={directory.inactiveBuilders.length} />
        </div>
      </section>

      <AdminSection title="Applications">
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
        <AdminSection title="Started">
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

      <AdminSection title="Builders">
        {directory.activeBuilders.length ? (
          directory.activeBuilders.map((user) => (
            <UserCard key={user.id} user={user}>
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

      <AdminSection title="Paused">
        {directory.inactiveBuilders.length ? (
          directory.inactiveBuilders.map((user) => (
            <UserCard key={user.id} user={user}>
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
            </UserCard>
          ))
        ) : (
          <EmptyState label="No paused builders." />
        )}
      </AdminSection>

      {directory.archivedUsers.length ? (
        <AdminSection title="Not now">
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
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function UserCard({
  user,
  children,
}: {
  user: LabsUser;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-3 rounded-md border border-border bg-card-soft p-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <UserSummary user={user} />
      <div className="flex flex-wrap gap-2">{children}</div>
    </article>
  );
}

function UserSummary({ user }: { user: LabsUser }) {
  const contactEmail = user.contactEmail ?? user.email;

  return (
    <div>
      <p className="font-semibold text-foreground">{user.name}</p>
      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted">
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
        {user.affiliation ? <span>{user.affiliation}</span> : null}
        {getDiscordDisplayName(user) ? (
          <span>Discord: {getDiscordDisplayName(user)}</span>
        ) : (
          <span>No Discord link</span>
        )}
      </div>
      {user.labsProfileCompletedAt ? <ProfileDetails user={user} /> : null}
    </div>
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
  return (
    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
      <ProfileLine
        label="Interests"
        value={formatOptionLabels(user.interests, LABS_INTEREST_OPTIONS)}
      />
      <ProfileLine
        label="GitHub comfort"
        value={formatOptionLabels(
          user.githubComfort,
          LABS_GITHUB_COMFORT_OPTIONS,
        )}
      />
      <ProfileLine
        label="AI"
        value={formatOptionLabels(user.aiTools, LABS_AI_TOOL_OPTIONS)}
      />
      <ProfileLine
        label="Availability"
        value={formatOptionLabels(user.availability, LABS_AVAILABILITY_OPTIONS)}
      />
      <ProfileLine
        label="Role"
        value={formatOptionLabels(user.preferredRole, LABS_ROLE_OPTIONS)}
      />
      <ProfileLine label="Referrer" value={user.referrer || "Not added"} />
      {user.buildGoal ? (
        <div className="sm:col-span-2">
          <dt className="font-medium text-foreground">Goal</dt>
          <dd className="mt-1 leading-6 text-muted">{user.buildGoal}</dd>
        </div>
      ) : null}
    </dl>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground">{label}</dt>
      <dd className="mt-1 text-muted">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card-soft p-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
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
      className={
        primary
          ? "min-h-10 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          : "min-h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      {label}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-border bg-card-soft p-3 text-sm text-muted">
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
      ? "This page is only for CodePet Labs admins."
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

function formatOptionLabels(
  storedValue: string | null,
  options: Parameters<typeof getLabsOptionLabels>[1],
) {
  const labels = getLabsOptionLabels(storedValue, options);

  return labels.length ? labels.join(", ") : "Not added";
}
