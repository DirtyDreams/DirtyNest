/**
 * F7.5 e2e (1) — Smoke: the SPA loads, auth gate passes on the mocked
 * session, and decks are navigable via the URL hash (activeView) without
 * any console/page errors. All backends are mocked (see hermes-mocks.ts).
 */
import { test, expect } from "@playwright/test";
import { installHermeticMocks, trackConsoleErrors } from "./hermes-mocks";

test.beforeEach(async ({ page }) => {
  await installHermeticMocks(page);
});

test("app loads, auth gate passes and dashboard renders", async ({ page }) => {
  const getErrors = trackConsoleErrors(page);

  await page.goto("/#/dashboard");
  await expect(page.locator("text=VERIFYING SESSION...")).toHaveCount(0);
  await expect(page.locator("body")).toContainText("DIRTYNEST", { ignoreCase: true });

  //No uncaught page errors while the deck boots.
  const errors = getErrors().filter(
    (e) => !e.includes("favicon") && !e.includes("the server responded with a status of")
  );
  expect(errors, errors.join("\n")).toHaveLength(0);
});

const DECKS = [
  { hash: "knowledge", marker: "OBSIDIAN VAULT", name: "Knowledge deck" },
  { hash: "chatbot", marker: "NEURAL", name: "Chatbot deck" },
  { hash: "control_room", marker: "CONTROL ROOM", name: "Control Room deck" },
];

for (const [i, deck] of DECKS.entries()) {
  test(`deck navigable via hash: ${deck.hash}`, async ({ page }) => {
    const getErrors = trackConsoleErrors(page);

    // Deep-link straight to the deck; page.tsx syncs activeView from the hash.
    await page.goto(`/#${deck.hash}`);
    await expect(page.locator("body")).toContainText(deck.marker, { ignoreCase: true });
    expect(new URL(page.url()).hash).toBe(`#${deck.hash}`);

    // And hash navigation between decks works without a page reload.
    const next = DECKS[(i + 1) % DECKS.length];
    await page.evaluate((h) => {
      window.location.hash = "#" + h;
    }, next.hash);
    await expect(page.locator("body")).toContainText(next.marker, { ignoreCase: true });

    const errors = getErrors().filter(
      (e) => !e.includes("favicon") && !e.includes("the server responded with a status of")
    );
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
}
