import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 40000,
  retries: 1,

  reporter: [['html', { open: 'never' }]],

  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});