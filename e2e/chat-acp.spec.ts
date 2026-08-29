/**
 * F7.5 e2e (2) — Agentic chat against a mocked ACP backend.
 *
 * The live ACP event path (`ACP_REASONING_DELTA` -> `ACP_TOOL_EXECUTED` ->
 * `ACP_MESSAGE_CHUNK` -> `ACP_EXECUTION_FINISHED`) reaches the UI through the
 * sidecar WebSocket and is persisted by the bridge (acpBridge.ts) into the
 * session transcript. This e2e exercises the same contract hermetically:
 *
 *   1. POST /api/hermes/acp/sessions  -> simulated session create (201)
 *   2. prompt send -> sidecar REST fallback POST .../acp/prompt (intercepted)
 *   3. GET  /api/hermes/acp/sessions/:id -> persisted agent transcript whose
 *      agent message embeds the full event stream result: <thought> (thinking),
 *      <tool_call> +  Ref Tags (markers assembled in hermes-mocks.ts).
 */
import { test, expect } from "@playwright/test";
import { installHermeticMocks, SIDECAR } from "./hermes-mocks";

test.beforeEach(async ({ page }) => {
  await installHermeticMocks(page);
});

test("ACP chat: session create + mocked agent stream renders bubble and trace", async ({
  page,
}) => {
  // Capture which upstream calls the app really makes.
  const createdSessions: Array<Record<string, unknown>> = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/api/hermes/acp/sessions")) {
      createdSessions.push(req.postDataJSON() || {});
    }
  });
  const promptPosts = page.waitForRequest(
    (req) =>
      req.method() === "POST" &&
      (req.url().includes("/api/hermes/acp/prompt") ||
        req.url().includes(":" + new URL(SIDECAR).port)),
    { timeout: 15_000 }
  );

  await page.goto("/#chatbot");
  await expect(page.locator("text=NEURAL").first()).toBeVisible();

  // Type a directive and transmit (Enter submits the composer).
  const composer = page.getByPlaceholder(
    "Type a message, press / for commands, @ to mention context..."
  );
  await expect(composer).toBeVisible();
  await composer.click();
  await page.keyboard.type("Run the zero-trust mesh audit directive");
  await page.keyboard.press("Enter");

  // The ChatbotView store path auto-creates a Hermes ACP session (mocked 201).
  await expect.poll(() => createdSessions.length, { timeout: 15_000 }).toBeGreaterThan(0);
  expect(createdSessions[0]).toMatchObject({ profile: "dirtydaily" });

  // The prompt is dispatched to the ACP backend (WS offline -> REST fallback).
  await promptPosts;

  // Hydrate the session transcript through the real store path: clicking the
  // thread card calls selectSession -> GET .../acp/sessions/:id (mocked with
  // the persisted thinking->tool->result->done transcript).
  await page.getByText("Hermes Thread").first().click();

  // The agent bubble renders with the final synthesis text...
  await expect(
    page.getByText("Directive completed. All 8 mesh microservices report 0 packet loss", { exact: false })
  .first()).toBeVisible();
  await expect(page.getByText("HERMES NEURAL SYNAPSE").first()).toBeVisible();

  // ...the thinking trace renders as the reasoning accordion...
  await expect(page.getByText("AI Thought Process").first()).toBeVisible();
  await page.getByText("AI Thought Process").first().click();
  await expect(page.getByText("Verifying tool permissions & zero-trust safety guardrails...").first()).toBeVisible();

  // ...and the tool_call / tool_result cards render in the message block.
  await expect(page.getByText("FUNCTION INVOCATION").first()).toBeVisible();
  await expect(page.getByText("TOOL RESPONSE").first()).toBeVisible();
  // The rendered trace manifest includes the tool result status value.
  await expect(page.getByText("FUNCTION INVOCATION").first()).toBeVisible();
  await expect(page.getByText("TOOL RESPONSE", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/online/i).first()).toBeVisible();
});
