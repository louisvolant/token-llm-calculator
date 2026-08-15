// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@dqbd/tiktoken',
    '@huggingface/transformers',
    'onnxruntime-node',
    'onnxruntime-web',
    '@swc/core',
    'clean-css',
    'terser',
  ],
  outputFileTracingIncludes: {
    '/api/tokenize/hf': ['./node_modules/onnxruntime-node/bin/**/linux/**'],
  },
};

module.exports = nextConfig;
