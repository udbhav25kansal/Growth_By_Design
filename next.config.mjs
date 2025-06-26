/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Node.js middleware runtime so we can access full Node APIs in middleware
  experimental: {
    nodeMiddleware: true,
  },
}

export default nextConfig 