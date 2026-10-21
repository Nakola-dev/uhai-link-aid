import { defineConfig, devices } from "@playwright/test";

/**
 * Rendered verification. Supabase is always mocked (see e2e/support/supabase-mock.ts),
 * so tests never touch a real project and use synthetic data only.
 * Uses the locally installed Chrome (no browser download needed).
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8080",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1366, height: 900 } } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: "chrome", viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
