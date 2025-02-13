/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Increase the body size limit for API routes
    },
    responseLimit: false
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['next-auth']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  async rewrites() {
    if (process.env.VERCEL_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://1c5f-2603-8000-e43e-6e9f-3909-6fbd-feb9-c70f.ngrok-free.app'
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