import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error eslint config is valid but might be missing in types
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for Next.js 16+ when using plugins that add webpack config
  turbopack: {},
};

export default nextConfig;
