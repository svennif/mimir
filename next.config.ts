import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Opts into Next.js agent-assisted upgrades for security releases only
    // (added with the 16.4.3 -> 16.4.6 security patch).
    agentUpgrade: "security",
  },
};

export default nextConfig;
