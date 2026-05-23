/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["markdown-it"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.local:3000", "192.168.*:3000"],
    },
  },
};

export default nextConfig;
