#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const API_BASE = "https://discord.com/api/v10";
const dryRun = process.argv.includes("--dry-run");

const ChannelType = {
  GuildText: 0,
  GuildVoice: 2,
  GuildCategory: 4,
};

const OverwriteType = {
  Role: 0,
};

const Permission = {
  ManageChannels: 1n << 4n,
  ViewChannel: 1n << 10n,
  SendMessages: 1n << 11n,
  ManageMessages: 1n << 13n,
  ReadMessageHistory: 1n << 16n,
  ManageRoles: 1n << 28n,
  ModerateMembers: 1n << 40n,
};

const rolesToCreate = [
  {
    name: "Labs Admin",
    color: 0x2563eb,
    permissions: bits([
      Permission.ViewChannel,
      Permission.SendMessages,
      Permission.ReadMessageHistory,
      Permission.ManageMessages,
      Permission.ManageChannels,
      Permission.ManageRoles,
      Permission.ModerateMembers,
    ]),
  },
  {
    name: "Moderator",
    color: 0x0891b2,
    permissions: bits([
      Permission.ViewChannel,
      Permission.SendMessages,
      Permission.ReadMessageHistory,
      Permission.ManageMessages,
      Permission.ModerateMembers,
    ]),
  },
  { name: "Builder", color: 0x16a34a, permissions: "0" },
  { name: "Tester", color: 0xf59e0b, permissions: "0" },
  { name: "Pika User", color: 0x8b5cf6, permissions: "0" },
  { name: "AI Helper", color: 0x64748b, permissions: "0" },
];

const layout = [
  {
    name: "START HERE",
    channels: [
      {
        name: "welcome",
        topic: "Start here for the purpose of CodePet Labs and how to participate.",
        readOnly: true,
        starter:
          "Welcome to CodePet Labs. This is a small builder space for Pika-adjacent prototypes, feedback, and experiments. Keep work lightweight, public-safe, and focused on mock-data demos.",
      },
      {
        name: "announcements",
        topic: "Low-noise updates about CodePet Labs.",
        readOnly: true,
      },
      {
        name: "rules",
        topic: "Shared expectations for the server.",
        readOnly: true,
        starter:
          "Rules: be direct and respectful; do not post credentials, real student data, or production Pika details; use mock data; keep AI helpers clearly labeled; move durable decisions into GitHub or docs.",
      },
      {
        name: "introductions",
        topic: "Brief intros from builders, testers, and collaborators.",
      },
    ],
  },
  {
    name: "CODEPET LABS",
    channels: [
      {
        name: "feature-ideas",
        topic: "Small, specific feature ideas. Include who it helps and what problem it solves.",
        starter:
          "Feature idea format: problem, who it helps, smallest useful version, and any screenshot or sketch. Keep ideas narrow enough to prototype.",
      },
      {
        name: "bug-reports",
        topic: "Bug reports for CodePet Labs prototypes and demos.",
        starter:
          "Bug format: what happened, what you expected, steps to reproduce, device/browser, and screenshot or short video when useful.",
      },
      {
        name: "questions",
        topic: "Questions about Labs projects, setup, ideas, and workflows.",
      },
      {
        name: "show-and-tell",
        topic: "Share demos, screenshots, prototypes, and shipped experiments.",
      },
      {
        name: "roadmap",
        topic: "Short roadmap notes and decisions. Keep detailed discussion in feature threads or GitHub.",
        readOnly: true,
      },
    ],
  },
  {
    name: "BUILDERS",
    privateTo: ["Labs Admin", "Moderator", "Builder", "AI Helper"],
    channels: [
      {
        name: "design-review",
        topic: "Review flows, copy, layouts, and user-facing prototype decisions.",
      },
      {
        name: "implementation-notes",
        topic: "Technical notes, project tradeoffs, and build planning.",
      },
      {
        name: "ai-builder-lab",
        topic: "AI helper experiments for summaries, specs, critique, and backlog cleanup.",
        starter:
          "Use this channel for AI-assisted summaries, feature spec drafts, critique, and backlog cleanup. Do not paste secrets, real student data, or production-only details.",
      },
    ],
  },
  {
    name: "VOICE",
    channels: [
      { name: "Office Hours", type: ChannelType.GuildVoice },
      { name: "Feature Jam", type: ChannelType.GuildVoice },
    ],
  },
];

loadLocalEnv();

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  console.error(
    "Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID. Add them to .env.local, then run pnpm discord:setup.",
  );
  process.exit(1);
}

const guild = await discord("GET", `/guilds/${guildId}`);
console.log(`Setting up Discord server: ${guild.name} (${guild.id})`);

const roles = await ensureRoles(guildId);
const botRoles = await getBotRoles(guildId, roles);
const channels = await ensureChannels(guildId, roles, botRoles);
await postStarterMessages(channels);

console.log("Discord setup complete.");

function bits(values) {
  return values.reduce((total, value) => total | value, 0n).toString();
}

function loadLocalEnv() {
  const fileValues = {};

  for (const fileName of [".env", ".env.local"]) {
    const filePath = resolve(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    for (const [key, value] of parseEnvFile(readFileSync(filePath, "utf8"))) {
      fileValues[key] = value;
    }
  }

  for (const [key, value] of Object.entries(fileValues)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseEnvFile(content) {
  const entries = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push([key, value]);
  }

  return entries;
}

async function ensureRoles(targetGuildId) {
  const existingRoles = await discord("GET", `/guilds/${targetGuildId}/roles`);
  const byName = new Map(existingRoles.map((role) => [role.name, role]));
  const ensured = new Map();

  for (const roleConfig of rolesToCreate) {
    const existingRole = byName.get(roleConfig.name);
    const body = {
      name: roleConfig.name,
      color: roleConfig.color,
      hoist: false,
      mentionable: false,
      permissions: roleConfig.permissions,
    };

    if (existingRole) {
      ensured.set(roleConfig.name, existingRole);
      await discord("PATCH", `/guilds/${targetGuildId}/roles/${existingRole.id}`, body);
      console.log(`Updated role: ${roleConfig.name}`);
      continue;
    }

    const createdRole = await discord("POST", `/guilds/${targetGuildId}/roles`, body);
    ensured.set(roleConfig.name, createdRole);
    console.log(`Created role: ${roleConfig.name}`);
  }

  return ensured;
}

async function getBotRoles(targetGuildId, managedRoles) {
  const botUser = await discord("GET", "/users/@me");
  let botMember = await discord("GET", `/guilds/${targetGuildId}/members/${botUser.id}`);
  const helperRole = managedRoles.get("AI Helper");

  if (helperRole && !botMember.roles.includes(helperRole.id)) {
    await discord("PUT", `/guilds/${targetGuildId}/members/${botUser.id}/roles/${helperRole.id}`);
    botMember = await discord("GET", `/guilds/${targetGuildId}/members/${botUser.id}`);
    console.log("Assigned AI Helper role to bot");
  }

  const guildRoles = await discord("GET", `/guilds/${targetGuildId}/roles`);
  const byId = new Map(guildRoles.map((role) => [role.id, role]));

  return botMember.roles.map((roleId) => byId.get(roleId)).filter(Boolean);
}

async function ensureChannels(targetGuildId, roles, botRoles) {
  let existingChannels = await discord("GET", `/guilds/${targetGuildId}/channels`);
  const channelKey = (channel) => `${channel.parent_id ?? "root"}:${channel.name}:${channel.type}`;
  let byKey = new Map(existingChannels.map((channel) => [channelKey(channel), channel]));
  const ensuredChannels = new Map();
  const adminRoles = ["Labs Admin", "Moderator"]
    .map((name) => roles.get(name))
    .filter(Boolean);

  for (const [categoryIndex, categoryConfig] of layout.entries()) {
    const category = await ensureChannel({
      targetGuildId,
      byKey,
      config: {
        name: categoryConfig.name,
        type: ChannelType.GuildCategory,
        position: categoryIndex,
        permission_overwrites: categoryOverwrites(categoryConfig, roles, botRoles),
      },
    });

    ensuredChannels.set(categoryConfig.name, category);

    for (const [channelIndex, channelConfig] of categoryConfig.channels.entries()) {
      const channelType = channelConfig.type ?? ChannelType.GuildText;
      const isText = channelType === ChannelType.GuildText;
      const config = {
        name: channelConfig.name,
        type: channelType,
        parent_id: category.id,
        position: channelIndex,
        permission_overwrites: textChannelOverwrites(channelConfig, adminRoles, botRoles),
      };

      if (isText) {
        config.topic = channelConfig.topic ?? null;
      }

      const channel = await ensureChannel({ targetGuildId, byKey, config });
      ensuredChannels.set(channelConfig.name, { ...channel, starter: channelConfig.starter });
    }

    existingChannels = await discord("GET", `/guilds/${targetGuildId}/channels`);
    byKey = new Map(existingChannels.map((channel) => [channelKey(channel), channel]));
  }

  return ensuredChannels;
}

async function ensureChannel({ targetGuildId, byKey, config }) {
  const key = `${config.parent_id ?? "root"}:${config.name}:${config.type}`;
  const existingChannel = byKey.get(key);

  if (existingChannel) {
    const updatedChannel = await discord("PATCH", `/channels/${existingChannel.id}`, config);
    console.log(`Updated channel: ${config.name}`);
    return updatedChannel;
  }

  const createdChannel = await discord("POST", `/guilds/${targetGuildId}/channels`, config);
  console.log(`Created channel: ${config.name}`);
  return createdChannel;
}

function categoryOverwrites(categoryConfig, roles, botRoles) {
  if (!categoryConfig.privateTo) {
    return undefined;
  }

  const overwrites = [
    {
      id: guildId,
      type: OverwriteType.Role,
      allow: "0",
      deny: bits([Permission.ViewChannel]),
    },
  ];

  const allowedRoleIds = new Set();

  for (const roleName of categoryConfig.privateTo) {
    const role = roles.get(roleName);

    if (!role || allowedRoleIds.has(role.id)) {
      continue;
    }

    allowedRoleIds.add(role.id);
    overwrites.push({
      id: role.id,
      type: OverwriteType.Role,
      allow: bits([
        Permission.ViewChannel,
        Permission.SendMessages,
        Permission.ReadMessageHistory,
      ]),
      deny: "0",
    });
  }

  for (const role of botRoles) {
    if (allowedRoleIds.has(role.id)) {
      continue;
    }

    allowedRoleIds.add(role.id);
    overwrites.push({
      id: role.id,
      type: OverwriteType.Role,
      allow: bits([
        Permission.ViewChannel,
        Permission.SendMessages,
        Permission.ReadMessageHistory,
      ]),
      deny: "0",
    });
  }

  return overwrites;
}

function textChannelOverwrites(channelConfig, adminRoles, botRoles) {
  if (!channelConfig.readOnly) {
    return undefined;
  }

  const allowedRoleIds = new Set();
  return [
    {
      id: guildId,
      type: OverwriteType.Role,
      allow: "0",
      deny: bits([Permission.SendMessages]),
    },
    ...adminRoles
      .filter((role) => {
        if (allowedRoleIds.has(role.id)) {
          return false;
        }

        allowedRoleIds.add(role.id);
        return true;
      })
      .map((role) => ({
        id: role.id,
        type: OverwriteType.Role,
        allow: bits([Permission.SendMessages]),
        deny: "0",
      })),
    ...botRoles
      .filter((role) => {
        if (allowedRoleIds.has(role.id)) {
          return false;
        }

        allowedRoleIds.add(role.id);
        return true;
      })
      .map((role) => ({
        id: role.id,
        type: OverwriteType.Role,
        allow: bits([
          Permission.ViewChannel,
          Permission.SendMessages,
          Permission.ReadMessageHistory,
        ]),
        deny: "0",
      })),
  ];
}

async function postStarterMessages(channels) {
  for (const channel of channels.values()) {
    if (!channel.starter || channel.type !== ChannelType.GuildText) {
      continue;
    }

    const messages = await discord("GET", `/channels/${channel.id}/messages?limit=1`);

    if (messages.length > 0) {
      console.log(`Skipped starter message in #${channel.name}; channel is not empty.`);
      continue;
    }

    await discord("POST", `/channels/${channel.id}/messages`, {
      content: channel.starter,
      allowed_mentions: { parse: [] },
    });
    console.log(`Posted starter message in #${channel.name}`);
  }
}

async function discord(method, path, body) {
  if (dryRun && method !== "GET") {
    console.log(`[dry-run] ${method} ${path}`);
    return {};
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
      "X-Audit-Log-Reason": encodeURIComponent("CodePet Labs Discord bootstrap"),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 429) {
    const rateLimit = await response.json();
    const retryAfter = Math.ceil((rateLimit.retry_after ?? 1) * 1000);
    await wait(retryAfter);
    return discord(method, path, body);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${method} ${path} failed with ${response.status}: ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function wait(ms) {
  return new Promise((resolveWait) => {
    setTimeout(resolveWait, ms);
  });
}
