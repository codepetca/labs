import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("security headers", () => {
  it("applies a restrictive baseline to every route", async () => {
    const entries = await nextConfig.headers?.();
    const headers = entries?.[0]?.headers ?? [];
    const values = new Map(headers.map((header) => [header.key, header.value]));

    expect(entries?.[0]?.source).toBe("/(.*)");
    expect(values.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(values.get("Content-Security-Policy")).toContain(
      "object-src 'none'",
    );
    expect(values.get("X-Content-Type-Options")).toBe("nosniff");
    expect(values.get("X-Frame-Options")).toBe("DENY");
    expect(values.get("Permissions-Policy")).toContain("camera=()");
  });
});
