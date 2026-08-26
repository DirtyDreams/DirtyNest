import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js"],
  allowedDevOrigins: [
    "localhost:3000",
    "*.trycloudflare.com",
    "locally-returns-karen-long.trycloudflare.com",
  ],
};

export default nextConfig;
