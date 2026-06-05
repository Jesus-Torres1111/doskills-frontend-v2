import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Evita la advertencia de múltiples lockfiles en monorepos/workspaces
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
