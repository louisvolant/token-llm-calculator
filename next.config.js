// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@dqbd/tiktoken',
    '@xenova/transformers',
    '@swc/core',
    'clean-css',
    'terser',
  ],
};

module.exports = nextConfig;
