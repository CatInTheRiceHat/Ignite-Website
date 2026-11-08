import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/moodle/markdown-browser',
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: 'https://learn.ignitefindyourfire.org',
    trace: 'retain-on-failure',
  },
});
