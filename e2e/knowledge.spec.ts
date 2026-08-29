/**
 * F7.5 e2e (4) — Knowledge view: semantic search over the real REST contract.
 *
 * POST /api/knowledge/search + GET /api/knowledge/docs are intercepted; the
 * debounced UI query must render the mocked Qdrant results (doc titles +
 * % MATCH badges) in the vault list.
 */
import { test, expect } from "@playwright/test";
import { installHermeticMocks } from "./hermes-mocks";

test.beforeEach(async ({ page }) => {
  await installHermeticMocks(page);
});

test("knowledge search: querying renders mocked Qdrant results", async ({ page }) => {
  let searchSeen = false;
  page.on("request", (req) => {
    if (req.url().includes("/api/knowledge/search") && req.method() === "POST") {
      searchSeen = true;
    }
  });

  await page.goto("/#knowledge");
  await expect(page.getByText("OBSIDIAN VAULT", { exact: false }).first()).toBeVisible();

  const searchInput = page.getByPlaceholder("Search [[WikiLinks]], Karpathy recipes, or tags...");
  await expect(searchInput).toBeVisible();
  await searchInput.fill("eBPF");

  // Debounce is 400ms; the % MATCH badge comes from the mocked score.
  await expect(page.getByText("93% MATCH").first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Zero-Trust eBPF Kernel Mesh").first()).toBeVisible();
  await expect(page.getByText("Karpathy Skill: NanoGPT KV-Cache Matrix").first()).toBeVisible();
  expect(searchSeen).toBe(true);
});
