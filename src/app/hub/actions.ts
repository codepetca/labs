"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@workos-inc/authkit-nextjs";

import { getWorkOSClient } from "@/lib/labs-admin";

export async function saveGithubUsername(formData: FormData) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const githubUsername = getGithubUsername(formData);
  const workos = getWorkOSClient();
  const fullUser = await workos.userManagement.getUser(user.id);

  await workos.userManagement.updateUser({
    userId: user.id,
    metadata: {
      ...fullUser.metadata,
      githubUsername,
      labsStatus: fullUser.metadata.labsStatus ?? "pending",
    },
  });

  revalidatePath("/hub");
}

function getGithubUsername(formData: FormData) {
  const value = formData.get("githubUsername");

  if (typeof value !== "string") {
    throw new Error("Missing GitHub username");
  }

  const githubUsername = value.trim().replace(/^@/, "");

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(githubUsername)) {
    throw new Error("Enter a valid GitHub username.");
  }

  return githubUsername;
}
