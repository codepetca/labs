import { handleAuth } from "@workos-inc/authkit-nextjs";

import {
  getLabsConfigStatus,
  isAdminEmail,
  markLabsInterest,
} from "@/lib/labs-admin";

export const GET = handleAuth({
  returnPathname: "/profile",
  onSuccess: async ({ user, authenticationMethod, oauthTokens }) => {
    if (!getLabsConfigStatus().ready) {
      return;
    }

    if (isAdminEmail(user.email)) {
      return;
    }

    await markLabsInterest(user.id, { authenticationMethod, oauthTokens });
  },
});
