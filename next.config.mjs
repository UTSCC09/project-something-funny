/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
      return [
        {
          // Match all routes
          source: '/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*', 
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, OPTIONS', // Methods you want to allow
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization', // Headers you want to allow
            },
            {
              key: 'Access-Control-Allow-Credentials',
              value: 'true',
            },
          ],
        },
      ];
    },
  };

export default nextConfig;
