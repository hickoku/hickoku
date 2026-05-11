import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [];
    // Only apply to non-production environments
    if (process.env.APP_ENV !== 'prod') {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      });
    }
    return headers;
  },
  reactStrictMode: true,
};

export default nextConfig;
