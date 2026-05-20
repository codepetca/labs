import { WorkOS } from "@workos-inc/node";
import { withAuth } from "@workos-inc/authkit-nextjs";

export type LabsConfig = {
  apiKey: string;
  orgId: string;
  adminEmails: string[];
  builderRoleSlug: string;
  adminRoleSlug: string;
  discordInviteUrl: string | null;
};

export type LabsUser = {
  id: string;
  name: string;
  email: string;
  githubUsername: string | null;
  labsStatus: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

export type LabsMember = LabsUser & {
  membershipId: string;
  membershipStatus: string;
  role: string;
  roles: string[];
  memberSince: string;
};

type LabsIdentity = Awaited<
  ReturnType<WorkOS["userManagement"]["getUserIdentities"]>
>[number];

let workosClient: WorkOS | null = null;

export function getLabsConfigStatus() {
  const missing = [
    "WORKOS_API_KEY",
    "WORKOS_CLIENT_ID",
    "WORKOS_COOKIE_PASSWORD",
    "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
    "CODEPET_WORKOS_ORG_ID",
    "CODEPET_ADMIN_EMAILS",
  ].filter((key) => !process.env[key]);

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getLabsConfig(): LabsConfig {
  const status = getLabsConfigStatus();

  if (!status.ready) {
    throw new Error(`Missing Labs auth config: ${status.missing.join(", ")}`);
  }

  return {
    apiKey: process.env.WORKOS_API_KEY!,
    orgId: process.env.CODEPET_WORKOS_ORG_ID!,
    adminEmails: parseAdminEmails(process.env.CODEPET_ADMIN_EMAILS),
    builderRoleSlug: process.env.CODEPET_BUILDER_ROLE_SLUG ?? "builder",
    adminRoleSlug: process.env.CODEPET_ADMIN_ROLE_SLUG ?? "admin",
    discordInviteUrl: process.env.CODEPET_DISCORD_INVITE_URL ?? null,
  };
}

export function getWorkOSClient() {
  if (!workosClient) {
    workosClient = new WorkOS(getLabsConfig().apiKey);
  }

  return workosClient;
}

export async function markLabsInterest(
  userId: string,
  options: { authenticationMethod?: string } = {},
) {
  const workos = getWorkOSClient();
  const [user, githubIdentity] = await Promise.all([
    workos.userManagement.getUser(userId),
    getLabsGithubIdentity(userId),
  ]);
  const hasGithubIdentity =
    Boolean(githubIdentity) ||
    isGithubAuthenticationMethod(options.authenticationMethod);

  if (user.metadata.labsStatus && user.metadata.labsAuthProvider === "github") {
    return;
  }

  await workos.userManagement.updateUser({
    userId,
    metadata: {
      ...user.metadata,
      labsStatus: getNextLabsStatus(user.metadata.labsStatus, hasGithubIdentity),
      labsJoinedAt: user.metadata.labsJoinedAt ?? new Date().toISOString(),
      labsSource: "codepet-labs",
      labsAuthProvider: hasGithubIdentity ? "github" : "github_required",
      ...(githubIdentity ? { githubIdentityId: githubIdentity.idpId } : {}),
    },
  });
}

export async function getCurrentLabsUser() {
  const { user } = await withAuth({ ensureSignedIn: true });
  return getWorkOSClient().userManagement.getUser(user.id);
}

export async function getLabsGithubIdentity(userId: string) {
  const identities =
    await getWorkOSClient().userManagement.getUserIdentities(userId);

  return identities.find(isGithubIdentity) ?? null;
}

export async function requireLabsAdmin() {
  const session = await withAuth({ ensureSignedIn: true });
  const user = await getWorkOSClient().userManagement.getUser(session.user.id);

  if (!isAdminEmail(user.email)) {
    throw new Error("Not authorized for Labs admin.");
  }

  return user;
}

export async function getLabsMembership(userId: string) {
  const config = getLabsConfig();
  const memberships =
    await getWorkOSClient().userManagement.listOrganizationMemberships({
      organizationId: config.orgId,
      userId,
      statuses: ["active", "inactive", "pending"],
      limit: 10,
    });

  return memberships.data[0] ?? null;
}

export async function getLabsDirectory() {
  const config = getLabsConfig();
  const workos = getWorkOSClient();

  const [users, memberships] = await Promise.all([
    workos.userManagement.listUsers({ limit: 100, order: "desc" }),
    workos.userManagement.listOrganizationMemberships({
      organizationId: config.orgId,
      statuses: ["active", "inactive", "pending"],
      limit: 100,
    }),
  ]);

  const usersById = new Map(users.data.map((user) => [user.id, toLabsUser(user)]));
  const members = memberships.data.map((membership) => {
    const user = usersById.get(membership.userId);

    return {
      ...(user ?? emptyLabsUser(membership.userId)),
      membershipId: membership.id,
      membershipStatus: membership.status,
      role: membership.role.slug,
      roles: membership.roles?.map((role) => role.slug) ?? [membership.role.slug],
      memberSince: membership.createdAt,
    };
  });
  const memberIds = new Set(members.map((member) => member.id));
  const pendingUsers = users.data
    .map(toLabsUser)
    .filter((user) => user.labsStatus === "pending" && !memberIds.has(user.id));
  const archivedUsers = users.data
    .map(toLabsUser)
    .filter((user) => user.labsStatus === "not_now" && !memberIds.has(user.id));

  return {
    pendingUsers,
    activeMembers: members.filter((member) => member.membershipStatus === "active"),
    inactiveMembers: members.filter(
      (member) => member.membershipStatus !== "active",
    ),
    archivedUsers,
  };
}

export function isAdminEmail(email: string) {
  const config = getLabsConfig();
  const normalized = email.trim().toLowerCase();

  return config.adminEmails.includes(normalized);
}

function parseAdminEmails(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isGithubIdentity(identity: LabsIdentity) {
  return identity.type === "OAuth" && isGithubAuthenticationMethod(identity.provider);
}

function isGithubAuthenticationMethod(method: string | undefined) {
  if (!method) {
    return false;
  }

  const normalized = method.replace(/[-_\s]/g, "").toLowerCase();

  return normalized === "githuboauth";
}

function getNextLabsStatus(
  currentStatus: string | undefined,
  hasGithubIdentity: boolean,
) {
  if (hasGithubIdentity) {
    return currentStatus === "github_required" || !currentStatus
      ? "pending"
      : currentStatus;
  }

  return currentStatus === "not_now" ? currentStatus : "github_required";
}

function toLabsUser(user: Awaited<ReturnType<WorkOS["userManagement"]["getUser"]>>) {
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
    email: user.email,
    githubUsername: user.metadata.githubUsername ?? null,
    labsStatus: user.metadata.labsStatus ?? null,
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
}

function emptyLabsUser(userId: string): LabsUser {
  return {
    id: userId,
    name: "Unknown",
    email: "Unknown",
    githubUsername: null,
    labsStatus: null,
    createdAt: "",
    lastSignInAt: null,
  };
}
