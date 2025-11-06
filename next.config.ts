import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uts-20251-it-fin-tech-rahma-sari.vercel.app",
      },
    ],
  },
};

export default nextConfig;
