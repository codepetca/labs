export type LabsStatus =
  | "pending"
  | "github_required"
  | "profile_required"
  | "approved"
  | "not_now"
  | "inactive";

export type LabsDirectoryUser = {
  labsStatus: string | null;
};

export type LabsOption = {
  value: string;
  label: string;
};

export const LABS_INTEREST_OPTIONS = [
  { value: "features", label: "Small features" },
  { value: "ui", label: "UI prototypes" },
  { value: "qa", label: "Testing and QA" },
  { value: "product", label: "Product ideas" },
  { value: "docs", label: "Documentation" },
  { value: "ai", label: "AI workflows" },
  { value: "pika", label: "Pika experiments" },
] as const satisfies readonly LabsOption[];

export const LABS_AI_TOOL_OPTIONS = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "cursor", label: "Cursor" },
  { value: "copilot", label: "Copilot" },
  { value: "claude", label: "Claude" },
  { value: "other", label: "Other" },
  { value: "none", label: "None yet" },
] as const satisfies readonly LabsOption[];

export const LABS_GITHUB_COMFORT_OPTIONS = [
  { value: "new", label: "New" },
  { value: "basics", label: "Some basics" },
  { value: "comfortable", label: "Comfortable" },
  { value: "advanced", label: "Very comfortable" },
] as const satisfies readonly LabsOption[];

export const LABS_AVAILABILITY_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "steady", label: "Steady" },
  { value: "unsure", label: "Not sure yet" },
] as const satisfies readonly LabsOption[];

export const LABS_ROLE_OPTIONS = [
  { value: "builder", label: "Builder" },
  { value: "ui", label: "UI" },
  { value: "qa", label: "QA" },
  { value: "docs", label: "Docs" },
  { value: "product", label: "Product" },
  { value: "unsure", label: "Not sure" },
  { value: "other", label: "Other" },
] as const satisfies readonly LabsOption[];

export type LabsProfileFormValues = {
  preferredName: string;
  contactEmail: string;
  affiliation: string;
  referrer: string;
  interests: string[];
  buildGoal: string;
  githubComfort: string;
  aiTools: string[];
  availability: string;
  preferredRole: string[];
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
      ? "profile_required"
      : currentStatus;
  }

  return currentStatus === "not_now" ? currentStatus : "github_required";
}

export function getLabsStatusAfterProfileSubmit(
  currentStatus: string | undefined,
) {
  return currentStatus === "approved" ||
    currentStatus === "inactive" ||
    currentStatus === "not_now"
    ? currentStatus
    : "pending";
}

export function getLabsDirectoryBuckets<T extends LabsDirectoryUser>(users: T[]) {
  return {
    profileRequiredUsers: users.filter(
      (user) => user.labsStatus === "profile_required",
    ),
    pendingUsers: users.filter((user) => user.labsStatus === "pending"),
    activeBuilders: users.filter((user) => user.labsStatus === "approved"),
    inactiveBuilders: users.filter((user) => user.labsStatus === "inactive"),
    archivedUsers: users.filter((user) => user.labsStatus === "not_now"),
  };
}

export function getLabsProfileFormValues(
  metadata: Record<string, string | null | undefined>,
  fallback: { email: string; name?: string | null },
): LabsProfileFormValues {
  return {
    preferredName:
      metadata.preferredName ?? normalizeOptionalText(fallback.name, 80),
    contactEmail: metadata.contactEmail ?? fallback.email,
    affiliation: metadata.affiliation ?? "",
    referrer: metadata.referrer ?? "",
    interests: parseStoredList(metadata.interests),
    buildGoal: metadata.buildGoal ?? "",
    githubComfort: metadata.githubComfort ?? "",
    aiTools: parseStoredList(metadata.aiTools),
    availability: metadata.availability ?? "",
    preferredRole: parseStoredList(metadata.preferredRole),
  };
}

export function hasCompletedLabsProfile(
  metadata: Record<string, string | null | undefined>,
) {
  return Boolean(
    metadata.preferredName &&
      metadata.contactEmail &&
      metadata.interests &&
      metadata.githubComfort &&
      metadata.availability &&
      metadata.preferredRole,
  );
}

export function parseBuilderProfileForm(formData: FormData) {
  const aiTools = parseOptionList(
    formData,
    "aiTools",
    LABS_AI_TOOL_OPTIONS,
    false,
  );
  const normalizedAiTools =
    aiTools.length > 1 && aiTools.includes("none")
      ? aiTools.filter((value) => value !== "none")
      : aiTools;

  return {
    preferredName: parseRequiredText(formData, "preferredName", 80),
    contactEmail: parseEmail(formData, "contactEmail"),
    affiliation: parseOptionalText(formData, "affiliation", 100),
    referrer: parseOptionalText(formData, "referrer", 100),
    interests: parseOptionList(
      formData,
      "interests",
      LABS_INTEREST_OPTIONS,
      true,
    ).join(","),
    buildGoal: parseOptionalText(formData, "buildGoal", 240),
    githubComfort: parseOption(
      formData,
      "githubComfort",
      LABS_GITHUB_COMFORT_OPTIONS,
    ),
    aiTools: (normalizedAiTools.length ? normalizedAiTools : ["none"]).join(","),
    availability: parseOption(
      formData,
      "availability",
      LABS_AVAILABILITY_OPTIONS,
    ),
    preferredRole: parseOptionList(
      formData,
      "preferredRole",
      LABS_ROLE_OPTIONS,
      true,
      2,
    ).join(","),
  };
}

export function getLabsOptionLabels(
  storedValue: string | null | undefined,
  options: readonly LabsOption[],
) {
  const labels = new Map(options.map((option) => [option.value, option.label]));

  return parseStoredList(storedValue).map(
    (value) => labels.get(value) ?? value,
  );
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

export function parseGithubApiUsername(profile: unknown) {
  if (!profile || typeof profile !== "object" || !("login" in profile)) {
    return null;
  }

  try {
    return parseGithubUsername((profile as { login: unknown }).login);
  } catch {
    return null;
  }
}

function parseRequiredText(formData: FormData, key: string, maxLength: number) {
  const value = normalizeOptionalText(formData.get(key), maxLength);

  if (!value) {
    throw new Error(`Missing ${key}`);
  }

  return value;
}

function parseOptionalText(formData: FormData, key: string, maxLength: number) {
  return normalizeOptionalText(formData.get(key), maxLength);
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function parseEmail(formData: FormData, key: string) {
  const email = parseRequiredText(formData, key, 120).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email.");
  }

  return email;
}

function parseOption(
  formData: FormData,
  key: string,
  options: readonly LabsOption[],
) {
  const value = parseRequiredText(formData, key, 40);

  if (!options.some((option) => option.value === value)) {
    throw new Error(`Choose a valid ${key}.`);
  }

  return value;
}

function parseOptionList(
  formData: FormData,
  key: string,
  options: readonly LabsOption[],
  required: boolean,
  maxLength?: number,
) {
  const validValues = new Set(options.map((option) => option.value));
  const values = formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => validValues.has(value));
  const uniqueValues = Array.from(new Set(values));

  if (required && uniqueValues.length === 0) {
    throw new Error(`Choose at least one ${key}.`);
  }

  if (maxLength && uniqueValues.length > maxLength) {
    throw new Error(`Choose no more than ${maxLength} ${key}.`);
  }

  return uniqueValues;
}

function parseStoredList(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
