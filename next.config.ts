import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'https://463b4414a0b8.ngrok.app';

console.log('Next.js Config:', {
  env: process.env.VERCEL_ENV,
  backendUrl: BACKEND_URL
});

const nextConfig: NextConfig = {
  // API configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: false
  },

  async rewrites() {
    if (process.env.VERCEL_ENV === 'production') {
      console.log('Using production API rewrite to:', BACKEND_URL);
      return [
        {
          source: '/api/:path*',
          destination: `${BACKEND_URL}/api/:path*`,
          basePath: false
        }
      ];
    }
    
    console.log('Using development API rewrite to: http://localhost:8000');
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
        basePath: false
      }
    ];
  },

  // Update CORS and security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Access-Control-Max-Age', value: '86400' }
        ],
      }
    ];
  }
};

export default nextConfig;