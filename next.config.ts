import type { NextConfig } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  /* config options here */
  // Better Auth session cookies are set on the API host. Because the client
  // and API live on different vercel.app subdomains (a public suffix), mobile
  // browsers treat that cookie as third-party and drop it. Proxying auth
  // requests through our own origin makes the cookie first-party while the
  // auth server, flow and JWT plugin remain unchanged.
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${API_URL}/api/auth/:path*`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
