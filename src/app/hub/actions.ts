"use server";

import { revalidatePath } from "next/cache";
import { withAuth } from "@workos-inc/authkit-nextjs";

import { getWorkOSClient } from "@/lib/labs-admin";
import { parseGithubUsername } from "@/lib/labs-state";

export async function saveGithubUsername(formData: FormData) {
  const { user } = await withAuth({ ensureSignedIn: true });
  const githubUsername = parseGithubUsername(formData.get("githubUsername"));
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
