"use server";

import { revalidatePath } from "next/cache";

import {
  deletePausedLabsUser,
  getLabsUserApprovalEmailTarget,
  getPausedLabsUserRemovalTarget,
  requireLabsAdmin,
  updateLabsUserMetadata,
} from "@/lib/labs-admin";
import { saveObservedRepoSelection } from "@/lib/github-observability";
import {
  type DiscordMemberActionResult,
  removeDiscordMember,
  setDiscordBuilderRole,
} from "@/lib/labs-discord";
import { sendLabsApprovalEmail } from "@/lib/labs-email";

export async function approveUser(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");
  const emailTarget = await getLabsUserApprovalEmailTarget(userId);
  const approvedAt = new Date().toISOString();
  const approvalMetadata = {
    labsStatus: "approved",
    labsRole: "builder",
    labsApprovedAt: approvedAt,
  };

  await updateLabsUserMetadata(userId, approvalMetadata);

  if (shouldSendApprovalEmail(emailTarget)) {
    await sendApprovalEmail(userId, emailTarget, approvalMetadata);
  }

  revalidatePath("/admin");
}

export async function markNotNow(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");

  await updateLabsUserMetadata(userId, {
    labsStatus: "not_now",
  });

  revalidatePath("/admin");
}

export async function restorePotentialUser(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");

  await updateLabsUserMetadata(userId, {
    labsStatus: "pending",
  });

  revalidatePath("/admin");
}

export async function pauseBuilder(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");
  const discordUserId = getOptionalFormValue(formData, "discordUserId");
  const nextMetadata: Record<string, string> = {
    labsStatus: "inactive",
  };

  if (discordUserId) {
    const result = await syncDiscordBuilderRole(discordUserId, false);

    nextMetadata.discordLastRoleSyncResult = result;
    nextMetadata.discordRoleSyncedAt = new Date().toISOString();
  }

  await updateLabsUserMetadata(userId, nextMetadata);

  revalidatePath("/admin");
}

export async function reactivateBuilder(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");
  const discordUserId = getOptionalFormValue(formData, "discordUserId");
  const nextMetadata: Record<string, string> = {
    labsStatus: "approved",
    labsRole: "builder",
  };

  if (discordUserId) {
    const result = await syncDiscordBuilderRole(discordUserId, true);

    nextMetadata.discordLastRoleSyncResult = result;
    nextMetadata.discordRoleSyncedAt = new Date().toISOString();
  }

  await updateLabsUserMetadata(userId, nextMetadata);

  revalidatePath("/admin");
}

export async function removeBuilderFromDiscord(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");
  const discordUserId = getOptionalFormValue(formData, "discordUserId");

  const result = await removeDiscordAccess(discordUserId);
  const nextMetadata: Record<string, string> = {
    discordLastRemovalResult: result,
  };

  if (result === "ok" || result === "not_in_server") {
    nextMetadata.discordGlobalName = "";
    nextMetadata.discordLinkedAt = "";
    nextMetadata.discordRemovedAt = new Date().toISOString();
    nextMetadata.discordUserId = "";
    nextMetadata.discordUsername = "";
  }

  await updateLabsUserMetadata(userId, nextMetadata);

  revalidatePath("/admin");
}

export async function removePausedUser(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");
  const target = await getPausedLabsUserRemovalTarget(userId);
  const result = await removeDiscordAccess(target.discordUserId);

  if (!canDeleteAfterDiscordRemoval(result)) {
    await updateLabsUserMetadata(userId, {
      discordLastRemovalResult: result,
    });
    revalidatePath("/admin");
    return;
  }

  await deletePausedLabsUser(userId);

  revalidatePath("/admin");
}

export async function saveObservedRepos(formData: FormData) {
  await requireLabsAdmin();

  const repoNames = formData
    .getAll("repo")
    .filter((repoName): repoName is string => typeof repoName === "string");

  await saveObservedRepoSelection(repoNames);

  revalidatePath("/admin");
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${key}`);
  }

  return value.trim();
}

function getOptionalFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function syncDiscordBuilderRole(discordUserId: string, enabled: boolean) {
  try {
    return await setDiscordBuilderRole(discordUserId, enabled);
  } catch (error) {
    console.error("[Discord role sync error]", error);
    return "error";
  }
}

async function removeDiscordAccess(discordUserId: string | null) {
  try {
    return await removeDiscordMember(discordUserId);
  } catch (error) {
    console.error("[Discord removal error]", error);
    return "error";
  }
}

function canDeleteAfterDiscordRemoval(
  result: DiscordMemberActionResult | "error",
) {
  return (
    result === "ok" ||
    result === "not_in_server" ||
    result === "missing_identity"
  );
}

function shouldSendApprovalEmail(emailTarget: {
  labsStatus: string | null;
  approvalEmailSentAt: string | null;
}) {
  return (
    emailTarget.labsStatus !== "approved" && !emailTarget.approvalEmailSentAt
  );
}

async function sendApprovalEmail(
  userId: string,
  emailTarget: {
    email: string;
    name: string | null;
  },
  approvalMetadata: Record<string, string>,
) {
  try {
    const result = await sendLabsApprovalEmail({
      name: emailTarget.name,
      to: emailTarget.email,
    });

    await updateLabsUserMetadata(userId, {
      ...approvalMetadata,
      approvalEmailLastResult:
        result.status === "sent" ? "sent" : result.reason,
      ...(result.status === "sent"
        ? {
            approvalEmailId: result.id ?? "",
            approvalEmailSentAt: new Date().toISOString(),
          }
        : {}),
    });
  } catch (error) {
    console.error("[Approval email error]", error);

    await updateLabsUserMetadata(userId, {
      ...approvalMetadata,
      approvalEmailLastResult: "error",
      approvalEmailLastErrorAt: new Date().toISOString(),
    });
  }
}
