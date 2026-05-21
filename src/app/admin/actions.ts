"use server";

import { revalidatePath } from "next/cache";

import { requireLabsAdmin, updateLabsUserMetadata } from "@/lib/labs-admin";

export async function approveUser(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");

  await updateLabsUserMetadata(userId, {
    labsStatus: "approved",
    labsRole: "builder",
    labsApprovedAt: new Date().toISOString(),
  });

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

  await updateLabsUserMetadata(userId, {
    labsStatus: "inactive",
  });

  revalidatePath("/admin");
}

export async function reactivateBuilder(formData: FormData) {
  await requireLabsAdmin();

  const userId = getFormValue(formData, "userId");

  await updateLabsUserMetadata(userId, {
    labsStatus: "approved",
    labsRole: "builder",
  });

  revalidatePath("/admin");
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${key}`);
  }

  return value.trim();
}
