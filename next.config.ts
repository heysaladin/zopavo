import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/docs": ["./data/**/*.md"],
      "/api/docs/file": ["./data/**/*.md"],
    },
  },
};

export default nextConfig;
