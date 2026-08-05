import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // GitHub project pages are served below the repository name.
  basePath: process.env.GITHUB_ACTIONS ? "/llm_notes" : "",
};

export default nextConfig;