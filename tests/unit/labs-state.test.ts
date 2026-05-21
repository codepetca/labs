import { describe, expect, it } from "vitest";

import {
  getLabsDirectoryBuckets,
  getNextLabsStatus,
  isGithubAuthenticationMethod,
  parseGithubUsername,
} from "../../src/lib/labs-state";

describe("Labs state helpers", () => {
  it("recognizes GitHub OAuth authentication method variants", () => {
    expect(isGithubAuthenticationMethod("GitHubOAuth")).toBe(true);
    expect(isGithubAuthenticationMethod("github_oauth")).toBe(true);
    expect(isGithubAuthenticationMethod("github-oauth")).toBe(true);
    expect(isGithubAuthenticationMethod("github oauth")).toBe(true);
    expect(isGithubAuthenticationMethod("google_oauth")).toBe(false);
    expect(isGithubAuthenticationMethod(undefined)).toBe(false);
  });

  it("moves GitHub-authenticated interested users into pending review", () => {
    expect(getNextLabsStatus(undefined, true)).toBe("pending");
    expect(getNextLabsStatus("github_required", true)).toBe("pending");
    expect(getNextLabsStatus("approved", true)).toBe("approved");
    expect(getNextLabsStatus("not_now", true)).toBe("not_now");
  });

  it("requires GitHub when the signed-in identity is not GitHub", () => {
    expect(getNextLabsStatus(undefined, false)).toBe("github_required");
    expect(getNextLabsStatus("pending", false)).toBe("github_required");
    expect(getNextLabsStatus("not_now", false)).toBe("not_now");
  });

  it("buckets Labs users by metadata status", () => {
    const users = [
      { id: "user_pending", labsStatus: "pending" },
      { id: "user_builder", labsStatus: "approved" },
      { id: "user_paused", labsStatus: "inactive" },
      { id: "user_archived", labsStatus: "not_now" },
      { id: "user_other", labsStatus: "github_required" },
      { id: "user_none", labsStatus: null },
    ];

    expect(getLabsDirectoryBuckets(users)).toEqual({
      pendingUsers: [users[0]],
      activeBuilders: [users[1]],
      inactiveBuilders: [users[2]],
      archivedUsers: [users[3]],
    });
  });

  it("normalizes valid GitHub usernames", () => {
    expect(parseGithubUsername("codepet")).toBe("codepet");
    expect(parseGithubUsername(" @codepet-labs ")).toBe("codepet-labs");
    expect(parseGithubUsername("a")).toBe("a");
    expect(parseGithubUsername("a".repeat(39))).toBe("a".repeat(39));
  });

  it("rejects invalid GitHub usernames", () => {
    expect(() => parseGithubUsername(null)).toThrow("Missing GitHub username");
    expect(() => parseGithubUsername("")).toThrow("valid GitHub username");
    expect(() => parseGithubUsername("@")).toThrow("valid GitHub username");
    expect(() => parseGithubUsername("-codepet")).toThrow(
      "valid GitHub username",
    );
    expect(() => parseGithubUsername("codepet-")).toThrow(
      "valid GitHub username",
    );
    expect(() => parseGithubUsername("codepet_labs")).toThrow(
      "valid GitHub username",
    );
    expect(() => parseGithubUsername("a".repeat(40))).toThrow(
      "valid GitHub username",
    );
  });
});
