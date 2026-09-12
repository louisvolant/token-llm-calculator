// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@dqbd/tiktoken',
    '@huggingface/transformers',
    '@swc/core',
    'clean-css',
    'terser',
  ],
  // ─── VERCEL FUNCTION SIZE LIMIT (CRITICAL, DO NOT REVERT) ───────────────
  // IMPORTANT: Do NOT add 'onnxruntime-node' or 'onnxruntime-web' to
  // serverExternalPackages above!
  //
  // When a package is listed in serverExternalPackages, Vercel CLI copies
  // the ENTIRE package folder from node_modules, completely bypassing
  // outputFileTracingExcludes. That bundles:
  //   * onnxruntime-web  (~130MB of `*.wasm`)
  //   * onnxruntime-node (~210MB of win32, darwin, and linux binaries)
  // pushing the function to 361MB+ and causing Vercel's 250MB limit to fail.
  //
  // By listing ONLY '@huggingface/transformers' in serverExternalPackages and
  // relying on Next.js file tracing:
  //   1) outputFileTracingIncludes includes the native linux/x64 binary (~34MB).
  //   2) outputFileTracingExcludes strips onnxruntime-web and non-linux/x64 binaries.
  // This keeps the uncompressed function trace at ~60MB, well under the 250MB limit.
  outputFileTracingIncludes: {
    // Keep the linux/x64 native library the function actually loads at runtime.
    '/api/tokenize/hf': ['./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**'],
  },
  outputFileTracingExcludes: {
    '/api/tokenize/hf': [
      // Browser-only WASM backend, never used by this Node.js route.
      './node_modules/onnxruntime-web/**',
      // onnxruntime-node binaries for platforms Vercel never runs (darwin/win32).
      './node_modules/onnxruntime-node/bin/napi-v6/darwin/**',
      './node_modules/onnxruntime-node/bin/napi-v6/win32/**',
      // linux/arm64 is also unnecessary: Vercel functions are linux/x64.
      './node_modules/onnxruntime-node/bin/napi-v6/linux/arm64/**',
    ],
  },
};

module.exports = nextConfig;
