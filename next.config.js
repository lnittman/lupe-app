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
    if (process.env.VERCEL_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://lupe-backend.onrender.com/api/:path*'
        }
      ];
    }
    
    // Local development
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ];
  }
}

module.exports = nextConfig 