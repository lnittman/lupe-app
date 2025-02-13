import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  },

  experimental: {
    // Update serverActions to use the correct type
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['*']
    },
    // Remove serverComponentsExternalPackages from experimental
  },

  // Add serverComponentsExternalPackages at root level
  serverComponentsExternalPackages: ['next-auth'],

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' }
        ],
      },
    ];
  },

  async rewrites() {
    if (process.env.VERCEL_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://463b4414a0b8.ngrok.app/api/:path*'
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
};

export default nextConfig;