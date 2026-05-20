import { unstable_rethrow } from "next/navigation";

import {
  approveUser,
  deactivateMember,
  markNotNow,
  reactivateMember,
  restorePotentialUser,
  setMemberRole,
} from "@/app/admin/actions";
import {
  getLabsConfig,
  getLabsConfigStatus,
  getLabsDirectory,
  type LabsConfig,
  type LabsMember,
  type LabsUser,
  requireLabsAdmin,
} from "@/lib/labs-admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configStatus = getLabsConfigStatus();

  if (!configStatus.ready) {
    return <SetupNeeded missing={configStatus.missing} />;
  }

  let config: LabsConfig;
  let directory: Awaited<ReturnType<typeof getLabsDirectory>>;

  try {
    await requireLabsAdmin();
    config = getLabsConfig();
    directory = await getLabsDirectory();
  } catch (error) {
    unstable_rethrow(error);
    return <AccessProblem error={error} />;
  }

  return <AdminDashboard config={config} directory={directory} />;
}

function AdminDashboard({
  config,
  directory,
}: {
  config: LabsConfig;
  directory: Awaited<ReturnType<typeof getLabsDirectory>>;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-muted">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          CodePet members
        </h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="Pending" value={directory.pendingUsers.length} />
          <Metric label="Builders" value={directory.activeMembers.length} />
          <Metric label="Paused" value={directory.inactiveMembers.length} />
        </div>
      </section>

      <AdminSection title="Interested people">
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

      <AdminSection title="Builders">
        {directory.activeMembers.length ? (
          directory.activeMembers.map((member) => (
            <MemberCard key={member.membershipId} member={member}>
              <form action={setMemberRole}>
                <input
                  type="hidden"
                  name="membershipId"
                  value={member.membershipId}
                />
                <input
                  type="hidden"
                  name="roleSlug"
                  value={config.builderRoleSlug}
                />
                <ActionButton label="Builder" />
              </form>
              <form action={setMemberRole}>
                <input
                  type="hidden"
                  name="membershipId"
                  value={member.membershipId}
                />
                <input
                  type="hidden"
                  name="roleSlug"
                  value={config.adminRoleSlug}
                />
                <ActionButton label="Admin" />
              </form>
              <form action={deactivateMember}>
                <input
                  type="hidden"
                  name="membershipId"
                  value={member.membershipId}
                />
                <ActionButton label="Pause" />
              </form>
            </MemberCard>
          ))
        ) : (
          <EmptyState label="No active members." />
        )}
      </AdminSection>

      <AdminSection title="Paused">
        {directory.inactiveMembers.length ? (
          directory.inactiveMembers.map((member) => (
            <MemberCard key={member.membershipId} member={member}>
              <form action={reactivateMember}>
                <input
                  type="hidden"
                  name="membershipId"
                  value={member.membershipId}
                />
                <ActionButton label="Reactivate" primary />
              </form>
            </MemberCard>
          ))
        ) : (
          <EmptyState label="No paused memberships." />
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

function MemberCard({
  member,
  children,
}: {
  member: LabsMember;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-3 rounded-md border border-border bg-card-soft p-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <UserSummary user={member} />
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip label={member.role} />
          <Chip label={member.membershipStatus} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </article>
  );
}

function UserSummary({ user }: { user: LabsUser }) {
  return (
    <div>
      <p className="font-semibold text-foreground">{user.name}</p>
      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted">
        <a href={`mailto:${user.email}`} className="hover:text-foreground">
          {user.email}
        </a>
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
      </div>
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
  label,
  primary = false,
}: {
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      type="submit"
      className={
        primary
          ? "min-h-10 rounded-md bg-foreground px-3 text-sm font-semibold text-background transition hover:opacity-90"
          : "min-h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-card"
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
        <p className="text-sm font-medium text-muted">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
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
        <p className="text-sm font-medium text-muted">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
          Access unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
      </section>
    </main>
  );
}
