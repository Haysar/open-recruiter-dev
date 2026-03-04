import path from "path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Prevent Next.js from walking up to /home/jelastic and picking up
  // Jelastic's own package-lock.json as the monorepo root.
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
