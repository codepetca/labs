import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentLabsUser,
  isAdminEmail,
  updateLabsUserMetadata,
} from "@/lib/labs-admin";
import {
  exchangeDiscordCode,
  fetchDiscordUser,
  getDiscordRoleNameForLabsUser,
  hasLinkedDiscordIdentity,
  joinDiscordGuildWithRole,
} from "@/lib/labs-discord";

const DISCORD_STATE_COOKIE = "codepet_discord_oauth_state";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(DISCORD_STATE_COOKIE)?.value;

  cookieStore.delete(DISCORD_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/hub?discord=error", request.url));
  }

  const user = await getCurrentLabsUser();
  const isAdmin = isAdminEmail(user.email);
  const isAllowed = user.metadata.labsStatus === "approved" || isAdmin;

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  if (hasLinkedDiscordIdentity(user)) {
    return NextResponse.redirect(new URL("/hub?discord=linked", request.url));
  }

  try {
    const accessToken = await exchangeDiscordCode(code);
    const discordUser = await fetchDiscordUser(accessToken);

    await joinDiscordGuildWithRole({
      accessToken,
      discordUserId: discordUser.id,
      roleName: getDiscordRoleNameForLabsUser({ isAdmin }),
    });

    await updateLabsUserMetadata(user.id, {
      discordGlobalName: discordUser.globalName ?? "",
      discordLinkedAt: new Date().toISOString(),
      discordRemovedAt: "",
      discordUserId: discordUser.id,
      discordUsername: discordUser.username,
    });

    return NextResponse.redirect(new URL("/hub?discord=linked", request.url));
  } catch (error) {
    console.error("[Discord link error]", error);
    return NextResponse.redirect(new URL("/hub?discord=error", request.url));
  }
}
