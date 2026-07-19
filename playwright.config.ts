import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:8787",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8787",
    reuseExistingServer: true,
  },
});
