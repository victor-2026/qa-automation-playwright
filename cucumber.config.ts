import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './features',
  runner: 'cucumber',
  cucumber: {
    features: ['./features/*.feature'],
    steps: ['./features/steps/*.steps.ts'],
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
