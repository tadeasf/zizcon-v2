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
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://dev-zhcom0xk8ta0ma1c.us.auth0.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
