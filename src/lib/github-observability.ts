import { get, put } from "@vercel/blob";

const DEFAULT_ORG = "codepetca";
const OBSERVED_REPOS_BLOB_KEY = "admin/observed-repos.json";
const ACTIVITY_DAYS = 14;

export type GithubRepoSummary = {
  defaultBranch: string;
  description: string | null;
  fullName: string;
  htmlUrl: string;
  name: string;
  openIssuesCount: number;
  owner: string;
  private: boolean;
  pushedAt: string | null;
  updatedAt: string | null;
};

export type RepoActivityDay = {
  date: string;
  count: number;
};

export type RepoActivitySummary = {
  activeDays: number;
  days: RepoActivityDay[];
  lastActiveAt: string | null;
  openIssues: number;
  openPullRequests: number;
  repo: GithubRepoSummary;
  totalActivity: number;
  totalCommits: number;
  totalIssues: number;
  totalPullRequests: number;
};

export type RepoObservabilityDashboard = {
  githubError: string | null;
  org: string;
  repos: GithubRepoSummary[];
  selectedRepoNames: string[];
  selectedRepos: RepoActivitySummary[];
  storageReady: boolean;
  storageError: string | null;
};

type GithubEvent = {
  created_at?: string;
  payload?: {
    action?: string;
    commits?: unknown[];
  };
  type?: string;
};

type GithubRepoResponse = {
  default_branch?: string;
  description?: string | null;
  full_name?: string;
  html_url?: string;
  name?: string;
  open_issues_count?: number;
  owner?: {
    login?: string;
  };
  private?: boolean;
  pushed_at?: string | null;
  updated_at?: string | null;
};

export async function getRepoObservabilityDashboard(): Promise<RepoObservabilityDashboard> {
  const org = getGithubOrg();
  const storage = await readObservedRepoSelection();
  const reposResult = await fetchGithubOrgRepos(org);

  if (!reposResult.ok) {
    return {
      githubError: reposResult.error,
      org,
      repos: [],
      selectedRepoNames: storage.selectedRepoNames ?? [],
      selectedRepos: [],
      storageReady: storage.ready,
      storageError: storage.error,
    };
  }

  const selectedRepoNames = getSelectedRepoNames({
    availableRepos: reposResult.repos,
    storedRepoNames: storage.selectedRepoNames,
  });
  const selectedRepoSet = new Set(selectedRepoNames);
  const selectedRepos = await Promise.all(
    reposResult.repos
      .filter((repo) => selectedRepoSet.has(repo.fullName))
      .map((repo) => fetchRepoActivity(repo)),
  );

  return {
    githubError: null,
    org,
    repos: reposResult.repos,
    selectedRepoNames,
    selectedRepos,
    storageReady: storage.ready,
    storageError: storage.error,
  };
}

export async function saveObservedRepoSelection(repoNames: string[]) {
  if (!hasBlobStorageConfig()) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
  }

  const selectedRepoNames = normalizeObservedRepoNames(repoNames, getGithubOrg());

  await put(
    OBSERVED_REPOS_BLOB_KEY,
    JSON.stringify(
      {
        selectedRepoNames,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    },
  );
}

export function getSelectedRepoNames({
  availableRepos,
  storedRepoNames,
}: {
  availableRepos: GithubRepoSummary[];
  storedRepoNames: string[] | null;
}) {
  if (storedRepoNames === null) {
    return availableRepos.slice(0, 3).map((repo) => repo.fullName);
  }

  const availableNames = new Set(availableRepos.map((repo) => repo.fullName));
  return storedRepoNames.filter((repoName) =>
    availableNames.has(repoName),
  );
}

export function normalizeObservedRepoNames(repoNames: string[], org = DEFAULT_ORG) {
  const seen = new Set<string>();

  return repoNames
    .map((repoName) => repoName.trim().toLowerCase())
    .filter((repoName) => repoName.startsWith(`${org.toLowerCase()}/`))
    .filter((repoName) => /^[-a-z0-9]+\/[-._a-z0-9]+$/.test(repoName))
    .filter((repoName) => {
      if (seen.has(repoName)) {
        return false;
      }

      seen.add(repoName);
      return true;
    });
}

export function summarizeGithubEvents(
  events: GithubEvent[],
  options: { days?: number; now?: Date } = {},
) {
  const days = options.days ?? ACTIVITY_DAYS;
  const now = options.now ?? new Date();
  const dayKeys = getRecentDayKeys(days, now);
  const dayCounts = new Map(dayKeys.map((day) => [day, 0]));
  let totalCommits = 0;
  let totalIssues = 0;
  let totalPullRequests = 0;
  let lastActiveAt: string | null = null;

  for (const event of events) {
    if (!event.created_at) {
      continue;
    }

    const dayKey = event.created_at.slice(0, 10);

    if (!dayCounts.has(dayKey)) {
      continue;
    }

    dayCounts.set(dayKey, (dayCounts.get(dayKey) ?? 0) + 1);
    lastActiveAt = getNewestIsoDate(lastActiveAt, event.created_at);

    if (event.type === "PushEvent") {
      totalCommits += Array.isArray(event.payload?.commits)
        ? event.payload.commits.length
        : 1;
    }

    if (event.type === "PullRequestEvent") {
      totalPullRequests += 1;
    }

    if (event.type === "IssuesEvent") {
      totalIssues += 1;
    }
  }

  const activityDays = Array.from(dayCounts.values()).filter(Boolean).length;
  const totalActivity = Array.from(dayCounts.values()).reduce(
    (total, count) => total + count,
    0,
  );

  return {
    activeDays: activityDays,
    days: Array.from(dayCounts, ([date, count]) => ({ date, count })),
    lastActiveAt,
    totalActivity,
    totalCommits,
    totalIssues,
    totalPullRequests,
  };
}

async function readObservedRepoSelection() {
  if (!hasBlobStorageConfig()) {
    return {
      error: null,
      ready: false,
      selectedRepoNames: null,
    };
  }

  try {
    const blob = await get(OBSERVED_REPOS_BLOB_KEY, {
      access: "public",
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200) {
      return {
        error: null,
        ready: true,
        selectedRepoNames: null,
      };
    }

    const text = await new Response(blob.stream).text();

    return {
      error: null,
      ready: true,
      selectedRepoNames: parseObservedRepoSelection(text),
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ready: true,
      selectedRepoNames: null,
    };
  }
}

function parseObservedRepoSelection(text: string) {
  try {
    const parsed = JSON.parse(text) as { selectedRepoNames?: unknown };

    if (!Array.isArray(parsed.selectedRepoNames)) {
      return [];
    }

    return normalizeObservedRepoNames(
      parsed.selectedRepoNames.filter(
        (repoName): repoName is string => typeof repoName === "string",
      ),
      getGithubOrg(),
    );
  } catch {
    return [];
  }
}

async function fetchGithubOrgRepos(org: string) {
  try {
    const repos = await fetchGithubPages<GithubRepoResponse>(
      `https://api.github.com/orgs/${org}/repos?type=all&sort=pushed&direction=desc&per_page=100`,
    );

    return {
      ok: true as const,
      repos: repos.map(toGithubRepoSummary).filter(isGithubRepoSummary),
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false as const,
    };
  }
}

async function fetchRepoActivity(repo: GithubRepoSummary) {
  const [events, openPullRequests] = await Promise.all([
    fetchGithubJson<GithubEvent[]>(
      `https://api.github.com/repos/${repo.fullName}/events?per_page=100`,
    ).catch(() => []),
    fetchGithubCount(
      `https://api.github.com/repos/${repo.fullName}/pulls?state=open&per_page=1`,
    ).catch(() => 0),
  ]);
  const summary = summarizeGithubEvents(events);

  return {
    ...summary,
    openIssues: Math.max(repo.openIssuesCount - openPullRequests, 0),
    openPullRequests,
    repo,
  };
}

async function fetchGithubPages<T>(url: string) {
  const items: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response = await fetchGithubResponse(nextUrl);
    const page = (await response.json()) as T[];

    items.push(...page);
    nextUrl = getNextLink(response.headers.get("link"));
  }

  return items;
}

async function fetchGithubJson<T>(url: string) {
  const response = await fetchGithubResponse(url);

  return (await response.json()) as T;
}

async function fetchGithubCount(url: string) {
  const response = await fetchGithubResponse(url);
  const page = (await response.json()) as unknown[];
  const lastPage = getLastPageNumber(response.headers.get("link"));

  return lastPage ?? page.length;
}

async function fetchGithubResponse(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: getGithubHeaders(),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`GitHub ${response.status} for ${url}`);
  }

  return response;
}

function toGithubRepoSummary(repo: GithubRepoResponse) {
  return {
    defaultBranch: repo.default_branch ?? "main",
    description: repo.description ?? null,
    fullName: repo.full_name ?? "",
    htmlUrl: repo.html_url ?? "",
    name: repo.name ?? "",
    openIssuesCount: repo.open_issues_count ?? 0,
    owner: repo.owner?.login ?? "",
    private: Boolean(repo.private),
    pushedAt: repo.pushed_at ?? null,
    updatedAt: repo.updated_at ?? null,
  };
}

function isGithubRepoSummary(
  repo: GithubRepoSummary,
): repo is GithubRepoSummary {
  return Boolean(repo.fullName && repo.htmlUrl && repo.name && repo.owner);
}

function getGithubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "codepet-labs",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.CODEPET_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getGithubOrg() {
  return process.env.CODEPET_GITHUB_ORG?.trim() || DEFAULT_ORG;
}

function hasBlobStorageConfig() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getRecentDayKeys(days: number, now: Date) {
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(now);

    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - (days - index - 1));

    return day.toISOString().slice(0, 10);
  });
}

function getNewestIsoDate(current: string | null, next: string) {
  if (!current) {
    return next;
  }

  return Date.parse(next) > Date.parse(current) ? next : current;
}

function getNextLink(linkHeader: string | null) {
  return getLinkUrl(linkHeader, "next");
}

function getLastPageNumber(linkHeader: string | null) {
  const lastUrl = getLinkUrl(linkHeader, "last");

  if (!lastUrl) {
    return null;
  }

  return Number(new URL(lastUrl).searchParams.get("page")) || null;
}

function getLinkUrl(linkHeader: string | null, rel: string) {
  if (!linkHeader) {
    return null;
  }

  for (const link of linkHeader.split(",")) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);

    if (match?.[2] === rel) {
      return match[1];
    }
  }

  return null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
