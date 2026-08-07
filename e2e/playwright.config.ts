import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/** Repo root (parent of this e2e/ directory). */
const repoRoot = path.join(__dirname, "..");

export default defineConfig({
  testDir: __dirname,
  testMatch: "**/*.e2e.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  outputDir: path.join(__dirname, "test-results"),
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm start",
    cwd: repoRoot,
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
