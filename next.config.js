/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activer les Server Components (default dans App Router)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

module.exports = nextConfig;
