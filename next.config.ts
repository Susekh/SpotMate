import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  experimental: {
    optimizeCss: false, // Disable Lightning CSS
  },
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
