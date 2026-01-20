import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 *
 * Configured for UI testing of Phase 2 pages.
 * Frontend URL: http://100.114.91.110:5173
 * Backend URL: http://localhost:3001
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://100.114.91.110:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: [
    {
      command: 'cd backend && npm run start:dev',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd frontend && npm run dev',
      url: process.env.FRONTEND_URL || 'http://100.114.91.110:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
