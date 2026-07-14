import { beforeEach, describe, expect, it, vi } from "vitest";

const workosMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));
const authMocks = vi.hoisted(() => ({ withAuth: vi.fn() }));
const navigationMocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("@workos-inc/node", () => ({
  WorkOS: class {
    userManagement = {
      getUser: workosMocks.getUser,
      updateUser: workosMocks.updateUser,
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
});
