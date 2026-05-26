import { randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentLabsUser, isAdminEmail } from "@/lib/labs-admin";
import {
  getDiscordAuthorizationUrl,
  getDiscordConfigStatus,
  hasLinkedDiscordIdentity,
} from "@/lib/labs-discord";

const DISCORD_STATE_COOKIE = "codepet_discord_oauth_state";

export async function GET(request: NextRequest) {
  const configStatus = getDiscordConfigStatus();

  if (!configStatus.ready) {
    return NextResponse.redirect(new URL("/hub?discord=setup", request.url));
  }

  const user = await getCurrentLabsUser();
  const isAllowed =
    user.metadata.labsStatus === "approved" || isAdminEmail(user.email);

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (hasLinkedDiscordIdentity(user)) {
    return NextResponse.redirect(new URL("/hub?discord=linked", request.url));
  }

  const state = randomBytes(24).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(DISCORD_STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(getDiscordAuthorizationUrl(state));
}
