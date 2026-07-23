import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
  requireLabsAdmin: vi.fn(),
  getLabsUserAdminTarget: vi.fn(),
  updateLabsUserMetadata: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/labs-admin", () => ({
  requireLabsAdmin: adminMocks.requireLabsAdmin,
  getLabsUserAdminTarget: adminMocks.getLabsUserAdminTarget,
  updateLabsUserMetadata: adminMocks.updateLabsUserMetadata,
  deletePausedLabsUser: vi.fn(),
  getLabsUserApprovalEmailTarget: vi.fn(),
  getPausedLabsUserRemovalTarget: vi.fn(),
}));

function formDataWith(userId: string) {
  const formData = new FormData();
  formData.set("userId", userId);
  return formData;
}

describe("admin action guards on admin-owned accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMocks.requireLabsAdmin.mockResolvedValue({});
  });

  it("markNotNow refuses to modify an admin account before writing metadata", async () => {
    adminMocks.getLabsUserAdminTarget.mockRejectedValue(
      new Error("Admins cannot be changed through builder actions."),
    );
    const { markNotNow } = await import("@/app/admin/actions");

    await expect(markNotNow(formDataWith("user_admin"))).rejects.toThrow(
      "Admins cannot be changed through builder actions.",
    );
    expect(adminMocks.updateLabsUserMetadata).not.toHaveBeenCalled();
  });

  it("markNotNow archives a non-admin builder", async () => {
    adminMocks.getLabsUserAdminTarget.mockResolvedValue({
      discordUserId: null,
      labsStatus: "pending",
    });
    const { markNotNow } = await import("@/app/admin/actions");

    await markNotNow(formDataWith("user_1"));

    expect(adminMocks.updateLabsUserMetadata).toHaveBeenCalledWith("user_1", {
      labsStatus: "not_now",
    });
  });

  it("restorePotentialUser refuses to modify an admin account before writing metadata", async () => {
    adminMocks.getLabsUserAdminTarget.mockRejectedValue(
      new Error("Admins cannot be changed through builder actions."),
    );
    const { restorePotentialUser } = await import("@/app/admin/actions");

    await expect(
      restorePotentialUser(formDataWith("user_admin")),
    ).rejects.toThrow("Admins cannot be changed through builder actions.");
    expect(adminMocks.updateLabsUserMetadata).not.toHaveBeenCalled();
  });

  it("restorePotentialUser restores a non-admin builder to pending", async () => {
    adminMocks.getLabsUserAdminTarget.mockResolvedValue({
      discordUserId: null,
      labsStatus: "not_now",
    });
    const { restorePotentialUser } = await import("@/app/admin/actions");

    await restorePotentialUser(formDataWith("user_1"));

    expect(adminMocks.updateLabsUserMetadata).toHaveBeenCalledWith("user_1", {
      labsStatus: "pending",
    });
  });
});
