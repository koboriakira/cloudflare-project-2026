import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: process.env.STAGING_URL ?? "https://cloudflare-project-2026-staging.workers.dev",
  },
});
