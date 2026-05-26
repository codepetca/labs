const DISCORD_API_BASE = "https://discord.com/api/v10";
const LABS_ADMIN_ROLE_NAME = "Labs Admin";
const BUILDER_ROLE_NAME = "Builder";

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
};

type DiscordUserResponse = {
  id?: string;
  username?: string;
  global_name?: string | null;
};

type DiscordRole = {
  id: string;
  name: string;
};

export type DiscordMemberActionResult =
  | "missing_config"
  | "missing_identity"
  | "missing_role"
  | "not_in_server"
  | "ok";

export function getDiscordRoleNameForLabsUser({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  return isAdmin ? LABS_ADMIN_ROLE_NAME : BUILDER_ROLE_NAME;
}

export function hasLinkedDiscordIdentity(user: {
  metadata: { discordUserId?: string | null };
}) {
  return Boolean(user.metadata.discordUserId?.trim());
}

export function getDiscordConfigStatus() {
  const missing = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_REDIRECT_URI",
    "DISCORD_BOT_TOKEN",
    "DISCORD_GUILD_ID",
  ].filter((key) => !process.env[key]);

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getDiscordBotConfigStatus() {
  const missing = ["DISCORD_BOT_TOKEN", "DISCORD_GUILD_ID"].filter(
    (key) => !process.env[key],
  );

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getDiscordAuthorizationUrl(state: string) {
  const config = getDiscordOAuthConfig();
  const url = new URL("https://discord.com/oauth2/authorize");

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds.join");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeDiscordCode(code: string) {
  const config = getDiscordOAuthConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    body,
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Discord authorization failed.");
  }

  const token = (await response.json()) as DiscordTokenResponse;

  if (!token.access_token) {
    throw new Error("Discord authorization returned no access token.");
  }

  return token.access_token;
}

export async function fetchDiscordUser(accessToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not read Discord profile.");
  }

  const user = (await response.json()) as DiscordUserResponse;

  if (!user.id || !user.username) {
    throw new Error("Discord profile is missing an id or username.");
  }

  return {
    id: user.id,
    username: user.username,
    globalName: user.global_name ?? null,
  };
}

export async function joinDiscordGuildWithRole({
  accessToken,
  discordUserId,
  roleName,
}: {
  accessToken: string;
  discordUserId: string;
  roleName: string;
}) {
  const roleId = await getRequiredDiscordRoleId(roleName);
  const body: { access_token: string; roles?: string[] } = {
    access_token: accessToken,
    roles: [roleId],
  };

  const response = await discordBotFetch(
    `/guilds/${getDiscordBotConfig().guildId}/members/${discordUserId}`,
    {
      body: JSON.stringify(body),
      method: "PUT",
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getDiscordErrorMessage(response, "Could not join Discord server."),
    );
  }

  const roleResult = await setDiscordRole(discordUserId, roleName, true);

  if (roleResult !== "ok") {
    throw new Error(`Could not assign Discord role: ${roleResult}`);
  }
}

export async function setDiscordBuilderRole(
  discordUserId: string | null | undefined,
  enabled: boolean,
): Promise<DiscordMemberActionResult> {
  return setDiscordRole(discordUserId, BUILDER_ROLE_NAME, enabled);
}

async function setDiscordRole(
  discordUserId: string | null | undefined,
  roleName: string,
  enabled: boolean,
): Promise<DiscordMemberActionResult> {
  if (!discordUserId) {
    return "missing_identity";
  }

  if (!getDiscordBotConfigStatus().ready) {
    return "missing_config";
  }

  const roleId = await getDiscordRoleId(roleName);

  if (!roleId) {
    return "missing_role";
  }

  const response = await discordBotFetch(
    `/guilds/${getDiscordBotConfig().guildId}/members/${discordUserId}/roles/${roleId}`,
    {
      method: enabled ? "PUT" : "DELETE",
    },
  );

  if (response.status === 404) {
    return "not_in_server";
  }

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getDiscordErrorMessage(response, "Could not update Discord role."),
    );
  }

  return "ok";
}

export async function removeDiscordMember(
  discordUserId: string | null | undefined,
): Promise<DiscordMemberActionResult> {
  if (!discordUserId) {
    return "missing_identity";
  }

  if (!getDiscordBotConfigStatus().ready) {
    return "missing_config";
  }

  const response = await discordBotFetch(
    `/guilds/${getDiscordBotConfig().guildId}/members/${discordUserId}`,
    {
      method: "DELETE",
    },
  );

  if (response.status === 404) {
    return "not_in_server";
  }

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getDiscordErrorMessage(response, "Could not remove Discord member."),
    );
  }

  return "ok";
}

export function getDiscordDisplayName(user: {
  discordGlobalName: string | null;
  discordUsername: string | null;
}) {
  return user.discordGlobalName || user.discordUsername;
}

export function getDiscordServerUrl() {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  return guildId ? `https://discord.com/channels/${guildId}` : null;
}

function getDiscordOAuthConfig() {
  const status = getDiscordConfigStatus();

  if (!status.ready) {
    throw new Error(`Missing Discord config: ${status.missing.join(", ")}`);
  }

  return {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: process.env.DISCORD_REDIRECT_URI!,
  };
}

function getDiscordBotConfig() {
  const status = getDiscordBotConfigStatus();

  if (!status.ready) {
    throw new Error(`Missing Discord bot config: ${status.missing.join(", ")}`);
  }

  return {
    botToken: process.env.DISCORD_BOT_TOKEN!,
    guildId: process.env.DISCORD_GUILD_ID!,
  };
}

async function getDiscordRoleId(roleName: string) {
  const response = await discordBotFetch(
    `/guilds/${getDiscordBotConfig().guildId}/roles`,
  );

  if (!response.ok) {
    throw new Error(await getDiscordErrorMessage(response, "Could not read Discord roles."));
  }

  const roles = (await response.json()) as DiscordRole[];

  return roles.find((role) => role.name === roleName)?.id ?? null;
}

async function getRequiredDiscordRoleId(roleName: string) {
  const roleId = await getDiscordRoleId(roleName);

  if (!roleId) {
    throw new Error(`Missing Discord role: ${roleName}`);
  }

  return roleId;
}

async function discordBotFetch(
  path: string,
  init: RequestInit = {},
) {
  const config = getDiscordBotConfig();

  return fetch(`${DISCORD_API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bot ${config.botToken}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function getDiscordErrorMessage(response: Response, fallback: string) {
  try {
    const error = (await response.json()) as { message?: string };

    return error.message
      ? `${fallback} Discord said: ${error.message}`
      : fallback;
  } catch {
    return fallback;
  }
}
