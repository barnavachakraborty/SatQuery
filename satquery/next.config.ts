import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disables automatic generation of AGENTS.md and CLAUDE.md
  // @ts-ignore
  agentRules: false,
};

export default nextConfig;
