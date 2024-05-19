/* @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/oauth/token',
        destination: '/api/token',
      },
      {
        source: '/api/user/me',
        destination: '/api/users/me'
      }
    ]
  }, 
  serverRuntimeConfig: {
    secret: '0dfcd4f7-0605-4c99-a3fd-57bc03f88fdb'
  }
}