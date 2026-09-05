/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // Proxy API + uploaded images through this app so it works from localhost,
  // phone on Wi-Fi (LAN IP), or a public tunnel.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND}/uploads/:path*` },
    ];
  },
};
export default nextConfig;
