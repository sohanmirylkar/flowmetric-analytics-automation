import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: "/flowmetric-analytics-automation",
        assetPrefix: "/flowmetric-analytics-automation",
      }
    : {}),
};

export default nextConfig;
