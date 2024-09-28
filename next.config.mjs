/** @type {import('next').NextConfig} */
const nextConfig = {
  // redirect by global next.config.js
  // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirects-in-nextconfigjs
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/',
        destination: '/cornell',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
