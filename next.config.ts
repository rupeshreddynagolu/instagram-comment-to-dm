import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Load Sidequest with Node's own require instead of bundling it: it imports
  // its backend driver and the jobs file by name at runtime, and the web app
  // and the job runtime must share its single in-process engine.
  serverExternalPackages: ["sidequest", "@sidequest/mysql-backend"],
  outputFileTracingIncludes: {
    // Sidequest migrates its own tables at startup from these files, found by
    // a directory scan the tracer cannot see.
    "/*": ["./node_modules/@sidequest/mysql-backend/migrations/**/*"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
