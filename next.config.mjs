/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*/',
        destination: 'http://127.0.0.1:8000/api/:path*/',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/',  // ✅ trailing slash force
      },
      {
        source: '/public/:path*/',
        destination: 'http://127.0.0.1:8000/public/:path*/',
      },
      {
        source: '/public/:path*',
        destination: 'http://127.0.0.1:8000/public/:path*/',
      },
      {
        source: '/org/:path*/',
        destination: 'http://127.0.0.1:8000/org/:path*/',
      },
      {
        source: '/org/:path*',
        destination: 'http://127.0.0.1:8000/org/:path*/',
      },
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;