import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabling strict mode prevents double rendering in dev
  experimental: {
    optimizePackageImports: ['lucide-react', '@ai-sdk/openai', 'ai', 'zod'],
  },
};

export default nextConfig;
