/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica para evitar errores de build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;