import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.auth0.com",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https", 
        hostname: "dev.directus.zizcon.cz",
      },
      {
        protocol: "https",
        hostname: "dev.next.zizcon.cz",
      }
    ],
  },
};

export default nextConfig;
