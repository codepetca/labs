import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function GET() {
  const signUpUrl = await getSignUpUrl({
    returnTo: "/profile",
    state: JSON.stringify({ source: "codepet-labs-join" }),
  });

  redirect(signUpUrl);
}
