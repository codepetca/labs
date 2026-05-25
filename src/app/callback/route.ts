import { handleAuth } from "@workos-inc/authkit-nextjs";

import { getLabsConfigStatus, markLabsInterest } from "@/lib/labs-admin";

export const GET = handleAuth({
  returnPathname: "/profile",
  onSuccess: async ({ user, authenticationMethod, oauthTokens }) => {
    if (!getLabsConfigStatus().ready) {
      return;
    }

    await markLabsInterest(user.id, { authenticationMethod, oauthTokens });
  },
});
