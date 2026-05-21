export type LabsStatus =
  | "pending"
  | "github_required"
  | "approved"
  | "not_now"
  | "inactive";

export type LabsDirectoryUser = {
  labsStatus: string | null;
};

export function isGithubAuthenticationMethod(method: string | undefined) {
  if (!method) {
    return false;
  }

  const normalized = method.replace(/[-_\s]/g, "").toLowerCase();

  return normalized === "githuboauth";
}

export function getNextLabsStatus(
  currentStatus: string | undefined,
  hasGithubIdentity: boolean,
): LabsStatus | string {
  if (hasGithubIdentity) {
    return currentStatus === "github_required" || !currentStatus
      ? "pending"
      : currentStatus;
  }

  return currentStatus === "not_now" ? currentStatus : "github_required";
}

export function getLabsDirectoryBuckets<T extends LabsDirectoryUser>(users: T[]) {
  return {
    pendingUsers: users.filter((user) => user.labsStatus === "pending"),
    activeBuilders: users.filter((user) => user.labsStatus === "approved"),
    inactiveBuilders: users.filter((user) => user.labsStatus === "inactive"),
    archivedUsers: users.filter((user) => user.labsStatus === "not_now"),
  };
}

export function parseGithubUsername(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Missing GitHub username");
  }

  const githubUsername = value.trim().replace(/^@/, "");

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(githubUsername)) {
    throw new Error("Enter a valid GitHub username.");
  }

  return githubUsername;
}
