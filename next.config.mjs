/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/notificaciones',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, 
  },
}

export default nextConfig
