import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const allowedDevOrigins = (process.env.CODEPET_DEV_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.workoscdn.com",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://api.workos.com https://*.workos.com",
  "frame-src 'self' https://*.workos.com",
  "form-action 'self' https://*.workos.com",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  ...(isDevelopment && allowedDevOrigins.length
    ? { allowedDevOrigins }
    : {}),
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/showcase",
        destination: "/projects",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
