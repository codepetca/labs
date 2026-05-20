import { handleAuth } from "@workos-inc/authkit-nextjs";

import { getLabsConfigStatus, markLabsInterest } from "@/lib/labs-admin";

export const GET = handleAuth({
  returnPathname: "/hub",
  onSuccess: async ({ user, authenticationMethod }) => {
    if (!getLabsConfigStatus().ready) {
      return;
    }

    await markLabsInterest(user.id, { authenticationMethod });
  },
});
