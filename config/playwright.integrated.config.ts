import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/moodle/integrated-browser', workers: 1, timeout: 240_000,
  use: { baseURL: 'http://127.0.0.1:8790', reducedMotion: 'reduce', trace: 'retain-on-failure' },
});
