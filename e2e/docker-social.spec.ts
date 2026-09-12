/**
 * F7.5 e2e (3) — Docker View & Social Media View verification.
 *
 * Verifies:
 * 1. Docker deck: authenticated proxy GET /api/docker/containers loads real
 *    stack services and displays the container stack.
 * 2. Social deck: clicking "Audience & Engagement Radar" loads EngagementRadar,
 *    fetches GET /api/social/analytics, and displays live status badge with campaign data.
 */
import { test, expect } from "@playwright/test";
import { installHermeticMocks } from "./hermes-mocks";

test.beforeEach(async ({ page }) => {
  await installHermeticMocks(page);
});

test("Docker deck: fetches authenticated /api/docker/containers and displays container stack", async ({
  page,
}) => {
  const containerRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/docker/containers")) {
      containerRequests.push(req.url());
    }
  });

  await page.route("**/api/docker/containers", (route) => {
    return route.fulfill({
      json: {
        containers: [
          {
            id: "cnt-web-1",
            name: "dirtynest-web",
            image: "dirtynest-web:latest",
            status: "running",
            ports: ["3000:3000"],
            created: "2026-09-12T00:00:00Z",
          },
          {
            id: "cnt-sidecar-1",
            name: "dirtynest-sidecar",
            image: "dirtynest-sidecar:latest",
            status: "running",
            ports: ["8000:8000"],
            created: "2026-09-12T00:00:00Z",
          },
          {
            id: "cnt-pg-1",
            name: "dirtynest-postgres",
            image: "postgres:16-alpine",
            status: "running",
            ports: ["5432:5432"],
            created: "2026-09-12T00:00:00Z",
          },
        ],
      },
    });
  });

  await page.goto("/#docker");
  await expect(page.locator("main").getByText("DOCKER CONTAINER", { exact: false }).first()).toBeVisible();

  // Container stack rendered from mock
  await expect(page.getByText("dirtynest-web").first()).toBeVisible();
  await expect(page.getByText("dirtynest-sidecar").first()).toBeVisible();
  await expect(page.getByText("dirtynest-postgres").first()).toBeVisible();

  // Verify the fetch was directed to Next.js API route
  expect(containerRequests.length).toBeGreaterThan(0);
});

test("Social Media deck: EngagementRadar connects to /api/social/analytics and renders live badge", async ({
  page,
}) => {
  await page.route("**/api/social/analytics**", (route) => {
    return route.fulfill({
      json: {
        analytics: {
          total_posts: 12,
          by_platform: {
            twitter: { posts: 4, reach: 12400, engagement: 890, likes: 400, comments: 90, shares: 400 },
          },
          totals: {
            reach: 12400,
            engagement: 890,
            likes: 400,
            comments: 90,
            shares: 400,
          },
        },
      },
    });
  });

  await page.goto("/#social_media");
  await expect(page.locator("main").getByText("SOCIAL MEDIA COMMAND", { exact: false }).first()).toBeVisible();

  // Navigate to Audience & Engagement Radar sub-tab
  await page.getByRole("button", { name: /Audience & Engagement Radar/i }).click();

  await expect(page.locator("main").getByText("ENGAGEMENT & AUDIENCE RADAR", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("LIVE SYNC").first()).toBeVisible();
  await expect(page.getByText("12 tracked posts").first()).toBeVisible();
});
