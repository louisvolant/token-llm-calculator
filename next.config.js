// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@dqbd/tiktoken',
    '@swc/core',
    'clean-css',
    'terser',
  ],
};

module.exports = nextConfig;
