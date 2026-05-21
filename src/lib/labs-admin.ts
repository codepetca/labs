import { WorkOS } from "@workos-inc/node";
import { withAuth } from "@workos-inc/authkit-nextjs";

import {
  getLabsDirectoryBuckets,
  getNextLabsStatus,
  isGithubAuthenticationMethod,
} from "@/lib/labs-state";

export type LabsConfig = {
  apiKey: string;
  adminEmails: string[];
  discordInviteUrl: string | null;
};

export type LabsUser = {
  id: string;
  name: string;
  email: string;
  githubUsername: string | null;
  labsStatus: string | null;
  labsRole: string | null;
  createdAt: string;
  lastSignInAt: string | null;
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
    adminEmails: parseAdminEmails(process.env.CODEPET_ADMIN_EMAILS),
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

export async function updateLabsUserMetadata(
  userId: string,
  metadata: Record<string, string>,
) {
  const workos = getWorkOSClient();
  const user = await workos.userManagement.getUser(userId);

  await workos.userManagement.updateUser({
    userId,
    metadata: {
      ...user.metadata,
      ...metadata,
    },
  });
}

export async function requireLabsAdmin() {
  const session = await withAuth({ ensureSignedIn: true });
  const user = await getWorkOSClient().userManagement.getUser(session.user.id);

  if (!isAdminEmail(user.email)) {
    throw new Error("Not authorized for Labs admin.");
  }

  return user;
}

export async function getLabsDirectory() {
  const userList = await getWorkOSClient().userManagement.listUsers({
    order: "desc",
  });
  const labsUsers = (await userList.autoPagination()).map(toLabsUser);

  return getLabsDirectoryBuckets(labsUsers);
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

function toLabsUser(user: Awaited<ReturnType<WorkOS["userManagement"]["getUser"]>>) {
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
    email: user.email,
    githubUsername: user.metadata.githubUsername ?? null,
    labsStatus: user.metadata.labsStatus ?? null,
    labsRole: user.metadata.labsRole ?? null,
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
}
