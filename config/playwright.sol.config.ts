import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/sol/browser',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:5186', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone SE'], defaultBrowserType: 'chromium' } },
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5186', reuseExistingServer: false, env: { SOL_DEV_PORT: '5186', OPENAI_API_KEY: '', UPSTASH_REDIS_REST_TOKEN: '' } },
});
