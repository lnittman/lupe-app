/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Increase the body size limit for API routes
    }
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['next-auth']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig 