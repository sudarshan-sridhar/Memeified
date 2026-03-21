import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Magic Hour and social media
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Increase serverless function timeout for Apify scraping
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
