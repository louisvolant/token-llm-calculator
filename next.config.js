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
  // ─── VERCEL FUNCTION SIZE LIMIT (CRITICAL, DO NOT REVERT) ───────────────
  // This route (api/tokenize/hf) runs on Node.js and uses the NATIVE
  // onnxruntime-node backend. It NEVER uses onnxruntime-web (the browser
  // WASM/WebGPU backend) nor any native binary that isn't linux/x64.
  //
  // Vercel's per-function uncompressed limit is 250MB. If all of this is
  // bundled the function grows to ~388MB and the deploy FAILS with:
  //   "api/tokenize/hf is 388.02mb uncompressed which exceeds the maximum
  //    uncompressed size limit of 250mb"
  //
  // The two big contributors are:
  //   * onnxruntime-web  (~130MB of `*.wasm` compiled for web browsers)
  //   * onnxruntime-node's platform binaries for darwin/win32/linux-arm64
  //     (~150MB). Vercel only ever runs linux/x64, so all of these are dead
  //     weight that must be stripped from the output trace.
  //
  // outputFileTracingIncludes alone is NOT enough (that only *adds* files).
  // You MUST also *exclude* the unused artifacts below. If either blob gets
  // orphaned the limit is exceeded again.
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
