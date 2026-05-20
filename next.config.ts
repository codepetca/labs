import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/",
        permanent: false,
      },
      {
        source: "/join",
        destination: "/#join",
        permanent: false,
      },
      {
        source: "/showcase",
        destination: "/#tracks",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
