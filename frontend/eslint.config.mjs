// eslint.config.mjs
import next from 'eslint-config-next';

export default [
  next,
  next.configs.coreWebVitals,
  next.configs.typescript,
  {
    ignores: [
      'out/**',
      'build/**',
      'dist/**',
      '.next/**',
      'node_modules/**',
    ],
  },
    {
    rules: {
    },
  },
];