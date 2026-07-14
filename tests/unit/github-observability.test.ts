import { put } from "@vercel/blob";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSelectedRepoNames,
  normalizeObservedRepoNames,
  saveObservedRepoSelection,
  summarizeGithubEvents,
  type GithubRepoSummary,
} from "../../src/lib/github-observability";

vi.mock("@vercel/blob", () => ({
  get: vi.fn(),
  put: vi.fn(),
}));

const repos: GithubRepoSummary[] = [
  repo("codepetca/codepet-labs"),
  repo("codepetca/codepet-pal"),
  repo("codepetca/gradex"),
  repo("codepetca/pika"),
];

describe("GitHub observability helpers", () => {
  const previousPrivateBlobToken =
    process.env.CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.mocked(put).mockResolvedValue({} as Awaited<ReturnType<typeof put>>);
    process.env.CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN = "private-test-token";
  });

  afterEach(() => {
    vi.clearAllMocks();

    if (previousPrivateBlobToken === undefined) {
      delete process.env.CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN;
    } else {
      process.env.CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN =
        previousPrivateBlobToken;
    }
  });

  it("normalizes selected Codepet repo names", () => {
    expect(
      normalizeObservedRepoNames([
        " CodepetCA/Codepet-Labs ",
        "codepetca/codepet-labs",
        "other/repo",
        "codepetca/bad repo",
        "codepetca/gradex",
      ]),
    ).toEqual(["codepetca/codepet-labs", "codepetca/gradex"]);
  });

  it("uses stored selected repos when they are still available", () => {
    expect(
      getSelectedRepoNames({
        availableRepos: repos,
        storedRepoNames: ["codepetca/gradex", "codepetca/missing"],
      }),
    ).toEqual(["codepetca/gradex"]);
  });

  it("defaults to the three most recent repos when nothing is stored", () => {
    expect(
      getSelectedRepoNames({
        availableRepos: repos,
        storedRepoNames: null,
      }),
    ).toEqual([
      "codepetca/codepet-labs",
      "codepetca/codepet-pal",
      "codepetca/gradex",
    ]);
  });

  it("allows an intentionally empty observed repo selection", () => {
    expect(
      getSelectedRepoNames({
        availableRepos: repos,
        storedRepoNames: [],
      }),
    ).toEqual([]);
  });

  it("stores observed repo names only in authenticated private Blob storage", async () => {
    await saveObservedRepoSelection(["codepetca/codepet-labs"]);

    expect(put).toHaveBeenCalledWith(
      "admin/observed-repos.json",
      expect.stringContaining("codepetca/codepet-labs"),
      expect.objectContaining({
        access: "private",
        token: "private-test-token",
      }),
    );
  });

  it("fails closed when private Blob storage is not configured", async () => {
    delete process.env.CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN;

    await expect(
      saveObservedRepoSelection(["codepetca/codepet-labs"]),
    ).rejects.toThrow("Missing CODEPET_PRIVATE_BLOB_READ_WRITE_TOKEN");
    expect(put).not.toHaveBeenCalled();
  });

  it("summarizes recent GitHub events into daily activity", () => {
    const summary = summarizeGithubEvents(
      [
        {
          created_at: "2026-05-30T10:00:00Z",
          payload: { commits: [{ id: "1" }, { id: "2" }] },
          type: "PushEvent",
        },
        {
          created_at: "2026-05-29T10:00:00Z",
          payload: { action: "opened" },
          type: "PullRequestEvent",
        },
        {
          created_at: "2026-05-20T10:00:00Z",
          payload: { action: "opened" },
          type: "IssuesEvent",
        },
        {
          created_at: "2026-05-01T10:00:00Z",
          type: "PushEvent",
        },
      ],
      {
        days: 3,
        now: new Date("2026-05-30T12:00:00Z"),
      },
    );

    expect(summary.days).toEqual([
      { count: 0, date: "2026-05-28" },
      { count: 1, date: "2026-05-29" },
      { count: 1, date: "2026-05-30" },
    ]);
    expect(summary.totalActivity).toBe(2);
    expect(summary.totalCommits).toBe(2);
    expect(summary.totalPullRequests).toBe(1);
    expect(summary.totalIssues).toBe(0);
    expect(summary.activeDays).toBe(2);
    expect(summary.lastActiveAt).toBe("2026-05-30T10:00:00Z");
  });
});

function repo(fullName: string): GithubRepoSummary {
  const [, name] = fullName.split("/");

  return {
    defaultBranch: "main",
    description: null,
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    name,
    openIssuesCount: 0,
    owner: "codepetca",
    private: false,
    pushedAt: null,
    updatedAt: null,
  };
}
