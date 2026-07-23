import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const workosMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  getUserIdentities: vi.fn(),
}));
const authMocks = vi.hoisted(() => ({ withAuth: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("@workos-inc/node", () => ({
  WorkOS: class {
    userManagement = {
      getUser: workosMocks.getUser,
      updateUser: workosMocks.updateUser,
      getUserIdentities: workosMocks.getUserIdentities,
    };
  },
}));

vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: authMocks.withAuth,
}));

vi.mock("next/navigation", () => ({
  redirect: navigationMocks.redirect,
}));

describe("Labs admin security helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WORKOS_API_KEY = "sk_test";
    process.env.WORKOS_CLIENT_ID = "client_test";
    process.env.WORKOS_COOKIE_PASSWORD = "x".repeat(32);
    process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI = "http://localhost/callback";
    process.env.CODEPET_ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("patches only intended WorkOS metadata keys", async () => {
    workosMocks.updateUser.mockResolvedValue({});
    const { updateLabsUserMetadata } = await import("../../src/lib/labs-admin");

    await updateLabsUserMetadata("user_123", { labsStatus: "approved" });

    expect(workosMocks.getUser).not.toHaveBeenCalled();
    expect(workosMocks.updateUser).toHaveBeenCalledWith({
      userId: "user_123",
      metadata: { labsStatus: "approved" },
    });
  });

  it("redirects signed-out profile requests instead of throwing an auth error", async () => {
    authMocks.withAuth.mockResolvedValue({ user: null });
    navigationMocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const { getCurrentLabsUser } = await import("../../src/lib/labs-admin");

    await expect(getCurrentLabsUser()).rejects.toThrow("NEXT_REDIRECT");
    expect(navigationMocks.redirect).toHaveBeenCalledWith("/login");
    expect(workosMocks.getUser).not.toHaveBeenCalled();
  });

  it("resolves Discord identity from the WorkOS user, not form input", async () => {
    workosMocks.getUser.mockResolvedValue({
      email: "builder@example.com",
      metadata: {
        discordUserId: "discord_123",
        labsStatus: "approved",
      },
    });
    const { getLabsUserAdminTarget } = await import("../../src/lib/labs-admin");

    await expect(getLabsUserAdminTarget("user_123")).resolves.toEqual({
      discordUserId: "discord_123",
      labsStatus: "approved",
    });
  });

  it("treats an admin email as an admin only when the email is verified", async () => {
    const { isVerifiedLabsAdmin } = await import("../../src/lib/labs-admin");

    expect(
      isVerifiedLabsAdmin({ email: "admin@example.com", emailVerified: true }),
    ).toBe(true);
    expect(
      isVerifiedLabsAdmin({ email: "admin@example.com", emailVerified: false }),
    ).toBe(false);
    expect(
      isVerifiedLabsAdmin({ email: "builder@example.com", emailVerified: true }),
    ).toBe(false);
  });

  it("grants admin access only with a verified email and a GitHub identity", async () => {
    authMocks.withAuth.mockResolvedValue({ user: { id: "user_admin" } });
    workosMocks.getUser.mockResolvedValue({
      id: "user_admin",
      email: "admin@example.com",
      emailVerified: true,
    });
    workosMocks.getUserIdentities.mockResolvedValue([
      { type: "OAuth", provider: "GitHubOAuth", idpId: "42" },
    ]);
    const { requireLabsAdmin } = await import("../../src/lib/labs-admin");

    await expect(requireLabsAdmin()).resolves.toMatchObject({
      email: "admin@example.com",
    });
    expect(navigationMocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects an admin email with an unverified address away from admin", async () => {
    authMocks.withAuth.mockResolvedValue({ user: { id: "user_admin" } });
    workosMocks.getUser.mockResolvedValue({
      id: "user_admin",
      email: "admin@example.com",
      emailVerified: false,
    });
    workosMocks.getUserIdentities.mockResolvedValue([
      { type: "OAuth", provider: "GitHubOAuth", idpId: "42" },
    ]);
    navigationMocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const { requireLabsAdmin } = await import("../../src/lib/labs-admin");

    await expect(requireLabsAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(navigationMocks.redirect).toHaveBeenCalledWith("/");
  });

  it("redirects an admin email without a GitHub identity away from admin", async () => {
    authMocks.withAuth.mockResolvedValue({ user: { id: "user_admin" } });
    workosMocks.getUser.mockResolvedValue({
      id: "user_admin",
      email: "admin@example.com",
      emailVerified: true,
    });
    workosMocks.getUserIdentities.mockResolvedValue([]);
    navigationMocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const { requireLabsAdmin } = await import("../../src/lib/labs-admin");

    await expect(requireLabsAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(navigationMocks.redirect).toHaveBeenCalledWith("/");
  });

  it("refuses to build an approval email target for an admin account", async () => {
    workosMocks.getUser.mockResolvedValue({
      email: "admin@example.com",
      metadata: {},
    });
    const { getLabsUserApprovalEmailTarget } = await import(
      "../../src/lib/labs-admin"
    );

    await expect(
      getLabsUserApprovalEmailTarget("user_admin"),
    ).rejects.toThrow("Admins cannot be changed through builder actions.");
  });

  it("keeps a stored GitHub username without refetching it on sign-in", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    workosMocks.getUser.mockResolvedValue({
      id: "user_1",
      email: "builder@example.com",
      metadata: {
        githubUsername: "octocat",
        labsStatus: "profile_required",
        labsJoinedAt: "2026-01-01T00:00:00.000Z",
        labsSource: "codepet-labs",
        labsAuthProvider: "github",
        githubIdentityId: "42",
      },
    });
    workosMocks.getUserIdentities.mockResolvedValue([
      { type: "OAuth", provider: "GitHubOAuth", idpId: "42" },
    ]);
    const { markLabsInterest } = await import("../../src/lib/labs-admin");

    await markLabsInterest("user_1");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(workosMocks.updateUser).not.toHaveBeenCalled();
  });

  it("resolves the GitHub username on sign-in when none is stored yet", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ login: "octocat" }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    workosMocks.getUser.mockResolvedValue({
      id: "user_1",
      email: "builder@example.com",
      metadata: { labsStatus: "github_required" },
    });
    workosMocks.getUserIdentities.mockResolvedValue([
      { type: "OAuth", provider: "GitHubOAuth", idpId: "42" },
    ]);
    workosMocks.updateUser.mockResolvedValue({});
    const { markLabsInterest } = await import("../../src/lib/labs-admin");

    await markLabsInterest("user_1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.github.com/user/42",
      expect.anything(),
    );
    expect(workosMocks.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        metadata: expect.objectContaining({ githubUsername: "octocat" }),
      }),
    );
  });
});
