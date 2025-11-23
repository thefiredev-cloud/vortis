import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Vortis
 *
 * Tests all critical functionality:
 * - Framework (Next.js 15)
 * - UI/UX (React components)
 * - Database (Supabase)
 * - Billing (Stripe)
 * - Security (Rate limiting)
 * - AI (Stock analysis)
 * - Authentication (Clerk)
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run tests sequentially for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for E2E tests
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
