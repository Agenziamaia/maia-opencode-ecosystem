/**
 * Vitest Configuration for Integration Tests
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'ARCHIVE/',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../'),
      '@maia-opencode/logger': resolve(__dirname, '../../../UNIVERSAL/logger/src'),
      '@maia-opencode/config': resolve(__dirname, '../../../UNIVERSAL/config'),
    },
  },
});
