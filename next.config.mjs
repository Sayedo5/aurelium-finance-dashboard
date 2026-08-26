/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Recharts and lucide-react both ship large barrel files; this keeps only the
  // icons and chart primitives actually imported in the client bundle.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"]
  }
};

export default nextConfig;
