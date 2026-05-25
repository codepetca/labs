import { describe, expect, it } from "vitest";

import {
  getLabsStatusAfterProfileSubmit,
  getLabsDirectoryBuckets,
  getNextLabsStatus,
  hasCompletedLabsProfile,
  isGithubAuthenticationMethod,
  parseBuilderProfileForm,
  parseGithubApiUsername,
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

  it("moves GitHub-authenticated interested users into profile setup", () => {
    expect(getNextLabsStatus(undefined, true)).toBe("profile_required");
    expect(getNextLabsStatus("github_required", true)).toBe("profile_required");
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
      { id: "user_started", labsStatus: "profile_required" },
      { id: "user_pending", labsStatus: "pending" },
      { id: "user_builder", labsStatus: "approved" },
      { id: "user_paused", labsStatus: "inactive" },
      { id: "user_archived", labsStatus: "not_now" },
      { id: "user_other", labsStatus: "github_required" },
      { id: "user_none", labsStatus: null },
    ];

    expect(getLabsDirectoryBuckets(users)).toEqual({
      profileRequiredUsers: [users[0]],
      pendingUsers: [users[1]],
      activeBuilders: [users[2]],
      inactiveBuilders: [users[3]],
      archivedUsers: [users[4]],
    });
  });

  it("keeps admins out of builder review buckets", () => {
    const users = [
      { id: "admin_pending", isLabsAdmin: true, labsStatus: "pending" },
      { id: "admin_started", isLabsAdmin: true, labsStatus: "profile_required" },
      { id: "user_pending", labsStatus: "pending" },
    ];

    expect(getLabsDirectoryBuckets(users)).toEqual({
      profileRequiredUsers: [],
      pendingUsers: [users[2]],
      activeBuilders: [],
      inactiveBuilders: [],
      archivedUsers: [],
    });
  });

  it("moves completed profiles into pending review", () => {
    expect(getLabsStatusAfterProfileSubmit("profile_required")).toBe("pending");
    expect(getLabsStatusAfterProfileSubmit("github_required")).toBe("pending");
    expect(getLabsStatusAfterProfileSubmit("approved")).toBe("approved");
    expect(getLabsStatusAfterProfileSubmit("inactive")).toBe("inactive");
    expect(getLabsStatusAfterProfileSubmit("not_now")).toBe("not_now");
  });

  it("parses the builder profile wizard fields", () => {
    const formData = new FormData();

    formData.set("preferredName", " Jane  Smith ");
    formData.set("contactEmail", "JANE@EXAMPLE.COM");
    formData.set("affiliation", " Example High ");
    formData.set("referrer", " Alex ");
    formData.append("interests", "ui");
    formData.append("interests", "ai");
    formData.set("buildGoal", " Learn team workflow. ");
    formData.set("githubComfort", "basics");
    formData.append("aiTools", "none");
    formData.append("aiTools", "chatgpt");
    formData.set("availability", "steady");
    formData.append("preferredRole", "builder");
    formData.append("preferredRole", "ui");

    expect(parseBuilderProfileForm(formData)).toEqual({
      preferredName: "Jane Smith",
      contactEmail: "jane@example.com",
      affiliation: "Example High",
      referrer: "Alex",
      interests: "ui,ai",
      buildGoal: "Learn team workflow.",
      githubComfort: "basics",
      aiTools: "chatgpt",
      availability: "steady",
      preferredRole: "builder,ui",
    });
  });

  it("limits preferred roles to two choices", () => {
    const formData = new FormData();

    formData.set("preferredName", "Jane Smith");
    formData.set("contactEmail", "jane@example.com");
    formData.append("interests", "ui");
    formData.set("githubComfort", "basics");
    formData.set("availability", "steady");
    formData.append("preferredRole", "builder");
    formData.append("preferredRole", "ui");
    formData.append("preferredRole", "other");

    expect(() => parseBuilderProfileForm(formData)).toThrow(
      "no more than 2 preferredRole",
    );
  });

  it("detects completed builder profiles", () => {
    expect(
      hasCompletedLabsProfile({
        preferredName: "Jane",
        contactEmail: "jane@example.com",
        interests: "ui",
        githubComfort: "basics",
        availability: "steady",
        preferredRole: "builder",
      }),
    ).toBe(true);
    expect(
      hasCompletedLabsProfile({
        preferredName: "Jane",
        contactEmail: "jane@example.com",
      }),
    ).toBe(false);
  });

  it("normalizes valid GitHub usernames", () => {
    expect(parseGithubUsername("codepet")).toBe("codepet");
    expect(parseGithubUsername(" @codepet-labs ")).toBe("codepet-labs");
    expect(parseGithubUsername("a")).toBe("a");
    expect(parseGithubUsername("a".repeat(39))).toBe("a".repeat(39));
  });

  it("extracts valid GitHub usernames from API profiles", () => {
    expect(parseGithubApiUsername({ login: "codepet-labs" })).toBe(
      "codepet-labs",
    );
    expect(parseGithubApiUsername({ login: "codepet_labs" })).toBeNull();
    expect(parseGithubApiUsername({})).toBeNull();
    expect(parseGithubApiUsername(null)).toBeNull();
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
