// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // webServer: [
  //   {
  //     command: 'npm run dev',
  //     url: 'http://localhost:5173',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //     cwd: '../frontend',
  //     shell: 'cmd.exe',
  //   },
  //   {
  //     command: 'npm run start',
  //     url: 'http://localhost:3003/api/blogs',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //     cwd: '../backend',
  //     shell: 'cmd.exe',
  //   },
  // ],
});