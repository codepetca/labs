import { authkitProxy } from "@workos-inc/authkit-nextjs";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authkit = authkitProxy();

let warnedMissingAuthkitConfig = false;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasAuthkitProxyConfig()) {
    // The public site must stay up without auth config, but in production a
    // silently disabled auth middleware is a misconfiguration worth alarming
    // on: protected pages fail closed on their own, yet any future route that
    // assumes middleware protection would be exposed.
    if (process.env.NODE_ENV === "production" && !warnedMissingAuthkitConfig) {
      warnedMissingAuthkitConfig = true;
      console.error(
        "[proxy] AuthKit middleware disabled: WorkOS auth config is missing or incomplete.",
      );
    }

    return NextResponse.next();
  }

  return authkit(request, event);
}

function hasAuthkitProxyConfig() {
  return Boolean(
    process.env.WORKOS_API_KEY &&
      process.env.WORKOS_CLIENT_ID &&
      process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI &&
      process.env.WORKOS_COOKIE_PASSWORD &&
      process.env.WORKOS_COOKIE_PASSWORD.length >= 32,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
