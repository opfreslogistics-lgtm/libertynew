/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Development mode optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Enable source maps in development for better debugging
    productionBrowserSourceMaps: false,
  }),
  typescript: {
    // ⚠️ Warning: This allows deployment despite TypeScript errors
    // Remove this after fixing all TypeScript errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
    // Optimize images in production, allow unoptimized in development for faster builds
    unoptimized: false, // Always optimize images in production
  },
}

module.exports = nextConfig


