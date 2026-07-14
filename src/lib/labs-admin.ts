import { WorkOS, type OauthTokens } from "@workos-inc/node";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

import {
  getLabsDirectoryBuckets,
  getNextLabsStatus,
  isGithubAuthenticationMethod,
  parseGithubApiUsername,
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
  preferredName: string | null;
  contactEmail: string | null;
  affiliation: string | null;
  referrer: string | null;
  interests: string | null;
  buildGoal: string | null;
  githubComfort: string | null;
  isLabsAdmin: boolean;
  discordGlobalName: string | null;
  discordLinkedAt: string | null;
  discordRemovedAt: string | null;
  discordUserId: string | null;
  discordUsername: string | null;
  aiTools: string | null;
  availability: string | null;
  preferredRole: string | null;
  labsProfileCompletedAt: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

type LabsIdentity = Awaited<
  ReturnType<WorkOS["userManagement"]["getUserIdentities"]>
>[number];
type LabsWorkOSUser = Awaited<
  ReturnType<WorkOS["userManagement"]["getUser"]>
>;

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
  options: { authenticationMethod?: string; oauthTokens?: OauthTokens } = {},
) {
  const workos = getWorkOSClient();
  const [user, githubIdentity] = await Promise.all([
    workos.userManagement.getUser(userId),
    getLabsGithubIdentity(userId),
  ]);
  const hasGithubIdentity =
    Boolean(githubIdentity) ||
    isGithubAuthenticationMethod(options.authenticationMethod);

  const nextMetadata: Record<string, string> = {
    labsStatus: getNextLabsStatus(user.metadata.labsStatus, hasGithubIdentity),
    labsJoinedAt: user.metadata.labsJoinedAt ?? new Date().toISOString(),
    labsSource: "codepet-labs",
    labsAuthProvider: hasGithubIdentity ? "github" : "github_required",
    ...(githubIdentity ? { githubIdentityId: githubIdentity.idpId } : {}),
  };

  if (hasGithubIdentity && !nextMetadata.githubUsername) {
    const githubUsername = await resolveGithubUsername({
      githubIdentity,
      oauthTokens: options.oauthTokens,
    });

    if (githubUsername) {
      nextMetadata.githubUsername = githubUsername;
    }
  }

  if (hasSameMetadata(user.metadata, nextMetadata)) {
    return;
  }

  await workos.userManagement.updateUser({
    userId,
    metadata: nextMetadata,
  });
}

export async function getCurrentLabsUser() {
  const { user } = await withAuth();

  if (!user) {
    redirect("/login");
  }

  return getWorkOSClient().userManagement.getUser(user.id);
}

export async function getLabsGithubIdentity(userId: string) {
  const identities =
    await getWorkOSClient().userManagement.getUserIdentities(userId);

  return identities.find(isGithubIdentity) ?? null;
}

export async function ensureLabsGithubUsername(
  user: LabsWorkOSUser,
  githubIdentity: LabsIdentity,
) {
  if (user.metadata.githubUsername) {
    return user;
  }

  const githubUsername = await resolveGithubUsername({ githubIdentity });

  if (!githubUsername) {
    return user;
  }

  return getWorkOSClient().userManagement.updateUser({
    userId: user.id,
    metadata: {
      githubUsername,
    },
  });
}

export async function updateLabsUserMetadata(
  userId: string,
  metadata: Record<string, string>,
) {
  await getWorkOSClient().userManagement.updateUser({
    userId,
    metadata,
  });
}

export async function getLabsUserAdminTarget(userId: string) {
  const user = await getWorkOSClient().userManagement.getUser(userId);

  if (isAdminEmail(user.email)) {
    throw new Error("Admins cannot be changed through builder actions.");
  }

  return {
    discordUserId: user.metadata.discordUserId || null,
    labsStatus: user.metadata.labsStatus ?? null,
  };
}

export async function getLabsUserApprovalEmailTarget(userId: string) {
  const user = await getWorkOSClient().userManagement.getUser(userId);
  const preferredName = user.metadata.preferredName ?? null;
  const workosName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  return {
    email: user.metadata.contactEmail || user.email,
    name: preferredName ?? workosName,
    labsStatus: user.metadata.labsStatus ?? null,
    approvalEmailSentAt: user.metadata.approvalEmailSentAt ?? null,
  };
}

export async function getPausedLabsUserRemovalTarget(userId: string) {
  const target = await getLabsUserAdminTarget(userId);

  if (target.labsStatus !== "inactive") {
    throw new Error("Only paused builders can be removed from Labs.");
  }

  return target;
}

export async function deletePausedLabsUser(userId: string) {
  await getPausedLabsUserRemovalTarget(userId);
  await getWorkOSClient().userManagement.deleteUser(userId);
}

export async function requireLabsAdmin() {
  const session = await withAuth();

  if (!session.user) {
    redirect("/login");
  }

  const user = await getWorkOSClient().userManagement.getUser(session.user.id);

  if (!isAdminEmail(user.email)) {
    redirect("/profile");
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

async function resolveGithubUsername({
  githubIdentity,
  oauthTokens,
}: {
  githubIdentity: LabsIdentity | null;
  oauthTokens?: OauthTokens;
}) {
  const tokenUsername = oauthTokens
    ? await fetchGithubUsername("https://api.github.com/user", oauthTokens)
    : null;

  if (tokenUsername || !githubIdentity || !/^\d+$/.test(githubIdentity.idpId)) {
    return tokenUsername;
  }

  return fetchGithubUsername(
    `https://api.github.com/user/${githubIdentity.idpId}`,
  );
}

async function fetchGithubUsername(url: string, oauthTokens?: OauthTokens) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "codepet-labs",
  };

  if (oauthTokens?.accessToken) {
    headers.Authorization = `Bearer ${oauthTokens.accessToken}`;
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      return null;
    }

    return parseGithubApiUsername(await response.json());
  } catch {
    return null;
  }
}

function hasSameMetadata(
  current: Record<string, string>,
  next: Record<string, string>,
) {
  return Object.entries(next).every(([key, value]) => current[key] === value);
}

function isGithubIdentity(identity: LabsIdentity) {
  return (
    identity.type === "OAuth" && isGithubAuthenticationMethod(identity.provider)
  );
}

function toLabsUser(user: LabsWorkOSUser) {
  const workosName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
  const preferredName = user.metadata.preferredName ?? null;

  return {
    id: user.id,
    name: preferredName ?? workosName,
    email: user.email,
    githubUsername: user.metadata.githubUsername ?? null,
    labsStatus: user.metadata.labsStatus ?? null,
    labsRole: user.metadata.labsRole ?? null,
    preferredName,
    contactEmail: user.metadata.contactEmail ?? null,
    affiliation: user.metadata.affiliation ?? null,
    referrer: user.metadata.referrer ?? null,
    interests: user.metadata.interests ?? null,
    buildGoal: user.metadata.buildGoal ?? null,
    githubComfort: user.metadata.githubComfort ?? null,
    isLabsAdmin: isAdminEmail(user.email),
    discordGlobalName: user.metadata.discordGlobalName || null,
    discordLinkedAt: user.metadata.discordLinkedAt || null,
    discordRemovedAt: user.metadata.discordRemovedAt || null,
    discordUserId: user.metadata.discordUserId || null,
    discordUsername: user.metadata.discordUsername || null,
    aiTools: user.metadata.aiTools ?? null,
    availability: user.metadata.availability ?? null,
    preferredRole: user.metadata.preferredRole ?? null,
    labsProfileCompletedAt: user.metadata.labsProfileCompletedAt ?? null,
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
  };
}
