import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages : ['pino', 'pino-pretty'],
    images : {
        remotePatterns :  [{hostname : "res.cloudinary.com"}],
    },
};

export default nextConfig;
