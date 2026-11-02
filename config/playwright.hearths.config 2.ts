import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/moodle/hearths-browser', workers: 1, timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:8767', reducedMotion: 'reduce', trace: 'retain-on-failure' },
});
