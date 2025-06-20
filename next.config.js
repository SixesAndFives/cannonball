/** @type {import('next').NextConfig} */
export default {
  async headers() {
    return [
      {
        // Match all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        // Match all B2 audio files
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'Accept',
            value: '(.*)'
          }
        ],
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ]
  },
  images: {
    domains: ['f004.backblazeb2.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'f004.backblazeb2.com'
      }
    ],
    unoptimized: true
  },
}
