import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/moodle/dashboard-browser',
  workers: 1,
  timeout: 180_000,
  use: {
    baseURL: 'http://127.0.0.1:8785',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
});
