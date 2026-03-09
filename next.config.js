/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typedRoutes: true,
  experimental: {
    authInterrupts: true,
  },
};
