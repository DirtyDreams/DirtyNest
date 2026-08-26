import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sql.js"],
  allowedDevOrigins: [
    "localhost:3000",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
