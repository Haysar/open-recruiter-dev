import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Vercel deployment configuration
  // Enable static optimization for better performance
  output: "standalone",
  
  // Configure image optimization for Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  
  // Enable experimental features for better Vercel integration
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
}

export default nextConfig
