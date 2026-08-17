import path from 'node:path';

import { defineConfig } from 'vitest/config';

import { TEST_DATABASE_URL } from './src/test/test-db';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
    },
    globalSetup: ['./src/test/global-setup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
