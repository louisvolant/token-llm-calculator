// eslint.config.mjs
import next from 'eslint-config-next';

const nextConfigs = next;

const config = [
  ...nextConfigs,
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

export default config;