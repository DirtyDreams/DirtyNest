import { defineConfig, devices } from "@playwright/test";

/**
 * F7.5 — Playwright e2e suite (fully hermetic).
 *
 * Every external dependency is mocked at the network layer:
 *  - ACP/sidecar REST (`/api/hermes/*` + cross-origin sidecar URLs) via page.route
 *  - Telemetry WebSocket (`/ws/telemetry`) via page.routeWebSocket
 *  - Next API routes that would hit Postgres/Qdrant via page.route
 *
 * The webServer runs the production build (`next start` after `next build`)
 * on port 3100 so the suite exercises the real compiled app; no sidecar,
 * Postgres, Qdrant, or Redis instances are required.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_BUILD
    ? {
        command: "npm run start -- --port 3100 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3100",
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : {
        command: "npm run build && npm run start -- --port 3100 --hostname 127.0.0.1",
        url: "http://127.0.0.1:3100",
        timeout: 420_000,
        reuseExistingServer: !process.env.CI,
      },
});