import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
