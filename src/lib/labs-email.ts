export type LabsApprovalEmailResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: "missing_config" };

type LabsApprovalEmailInput = {
  name: string | null;
  to: string;
};

const BREVO_EMAILS_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendLabsApprovalEmail({
  name,
  to,
}: LabsApprovalEmailInput): Promise<LabsApprovalEmailResult> {
  const config = getLabsEmailConfig();

  if (!config) {
    return { status: "skipped", reason: "missing_config" };
  }

  const hubUrl = getLabsHubUrl();
  const greeting = name ? `Hi ${name},` : "Hi,";
  const text = [
    greeting,
    "",
    "You're approved for Codepet Labs.",
    "",
    "Sign in to the Labs hub to get your Discord access link:",
    hubUrl,
    "",
    "Use the Discord card there to connect your Discord account and join the server.",
    "",
    "See you in the lab,",
    "Stewart",
    "Codepet Labs",
  ].join("\n");

  const response = await fetch(BREVO_EMAILS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "api-key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: config.sender,
      to: [{ email: to }],
      subject: "You're approved for Codepet Labs",
      textContent: text,
      htmlContent: renderApprovalEmailHtml({
        greeting,
        hubUrl,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(await getEmailErrorMessage(response));
  }

  const body = (await response.json().catch(() => null)) as {
    messageId?: string;
  } | null;

  return { status: "sent", id: body?.messageId ?? null };
}

export function getLabsHubUrl() {
  return new URL("/hub", getLabsSiteUrl()).toString();
}

function getLabsEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.CODEPET_EMAIL_FROM_ADDRESS?.trim();
  const senderName = process.env.CODEPET_EMAIL_FROM_NAME?.trim();

  if (!apiKey || !senderEmail) {
    return null;
  }

  return {
    apiKey,
    sender: {
      email: senderEmail,
      ...(senderName ? { name: senderName } : {}),
    },
  };
}

function getLabsSiteUrl() {
  const configuredUrl =
    process.env.CODEPET_LABS_URL?.trim() ||
    process.env.NEXT_PUBLIC_CODEPET_LABS_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim();

  if (redirectUri) {
    return new URL(redirectUri).origin;
  }

  return "https://labs.codepet.ca";
}

function renderApprovalEmailHtml({
  greeting,
  hubUrl,
}: {
  greeting: string;
  hubUrl: string;
}) {
  const escapedGreeting = escapeHtml(greeting);
  const escapedHubUrl = escapeHtml(hubUrl);

  return `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <p>${escapedGreeting}</p>
    <p>You're approved for Codepet Labs.</p>
    <p>
      Sign in to the Labs hub to get your Discord access link:<br>
      <a href="${escapedHubUrl}">${escapedHubUrl}</a>
    </p>
    <p>Use the Discord card there to connect your Discord account and join the server.</p>
    <p>See you in the lab,<br>Stewart<br>Codepet Labs</p>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getEmailErrorMessage(response: Response) {
  const body = await response.text().catch(() => "");

  return body
    ? `Approval email failed: ${response.status} ${body}`
    : `Approval email failed: ${response.status}`;
}
