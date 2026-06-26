import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLabsHubUrl,
  sendLabsApprovalEmail,
} from "../../src/lib/labs-email";

describe("Labs email helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("skips approval email when Brevo is not configured", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    vi.stubEnv("CODEPET_EMAIL_FROM_ADDRESS", "");

    await expect(
      sendLabsApprovalEmail({ name: "Ada", to: "ada@example.com" }),
    ).resolves.toEqual({ status: "skipped", reason: "missing_config" });
  });

  it("builds the hub URL from the configured Labs URL", () => {
    vi.stubEnv("CODEPET_LABS_URL", "https://labs.example.com");

    expect(getLabsHubUrl()).toBe("https://labs.example.com/hub");
  });

  it("sends approval email through Brevo", async () => {
    vi.stubEnv("BREVO_API_KEY", "brevo_test");
    vi.stubEnv("CODEPET_EMAIL_FROM_ADDRESS", "noreply@notify.codepet.ca");
    vi.stubEnv("CODEPET_EMAIL_FROM_NAME", "Codepet Labs");
    vi.stubEnv("CODEPET_LABS_URL", "https://labs.example.com");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ messageId: "email_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      sendLabsApprovalEmail({ name: "Ada", to: "ada@example.com" }),
    ).resolves.toEqual({ status: "sent", id: "email_123" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "api-key": "brevo_test",
          "Content-Type": "application/json",
        }),
      }),
    );

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));

    expect(body).toMatchObject({
      sender: { email: "noreply@notify.codepet.ca", name: "Codepet Labs" },
      to: [{ email: "ada@example.com" }],
      subject: "You're approved for Codepet Labs",
    });
    expect(body.replyTo).toBeUndefined();
    expect(body.textContent).toContain("https://labs.example.com/hub");
    expect(body.textContent).toContain("Discord access link");
  });
});
