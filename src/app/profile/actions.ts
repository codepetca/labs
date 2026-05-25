"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getCurrentLabsUser,
  getLabsGithubIdentity,
  updateLabsUserMetadata,
} from "@/lib/labs-admin";
import {
  getLabsStatusAfterProfileSubmit,
  parseBuilderProfileForm,
} from "@/lib/labs-state";

export async function saveBuilderProfile(formData: FormData) {
  const user = await getCurrentLabsUser();
  const githubIdentity = await getLabsGithubIdentity(user.id);

  if (!githubIdentity) {
    redirect("/profile");
  }

  const now = new Date().toISOString();
  const profileMetadata = parseBuilderProfileForm(formData);

  await updateLabsUserMetadata(user.id, {
    ...profileMetadata,
    labsStatus: getLabsStatusAfterProfileSubmit(user.metadata.labsStatus),
    labsProfileCompletedAt: user.metadata.labsProfileCompletedAt ?? now,
    labsProfileUpdatedAt: now,
  });

  revalidatePath("/admin");
  revalidatePath("/profile");
  redirect("/profile");
}
