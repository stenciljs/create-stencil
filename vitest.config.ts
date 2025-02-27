import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      exclude: ['index.js', 'vitest.config.ts', 'rollup.config.mjs'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 39,
        statements: 39,
      },
    },
  },
});