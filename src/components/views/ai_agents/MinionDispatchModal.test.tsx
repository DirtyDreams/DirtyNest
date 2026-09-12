import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MinionDispatchModal from "./MinionDispatchModal";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockMinions = [
  {
    id: "minion-01",
    name: "Aegis-Alpha",
    role: "Security & CVE Patrol",
    model: "hermes-3-llama-3.1-8b",
    status: "IDLE",
    color: "#00FF41",
  },
  {
    id: "minion-02",
    name: "Cypher-Beta",
    role: "Code Synthesis & AST",
    model: "qwen2.5-coder-32b",
    status: "IDLE",
    color: "#00F0FF",
  },
];

describe("MinionDispatchModal Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              status: "success",
              task: {
                id: "task-12345",
                minion_id: "minion-01",
                name: "Test Directive",
                directive: "Run unit verification test",
                status: "QUEUED",
                progress: 0,
              },
            }),
        })
      )
    );
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", async () => {
    await act(async () => {
      root.render(
        <MinionDispatchModal
          isOpen={false}
          onClose={() => {}}
          minions={mockMinions}
        />
      );
    });

    expect(container.textContent).toBe("");
  });

  it("renders modal header, minion nodes, and quick templates when open", async () => {
    await act(async () => {
      root.render(
        <MinionDispatchModal
          isOpen={true}
          onClose={() => {}}
          minions={mockMinions}
        />
      );
    });

    expect(container.textContent).toContain("Subordinate Swarm Task Dispatch");
    expect(container.textContent).toContain("Aegis-Alpha");
    expect(container.textContent).toContain("Cypher-Beta");
    expect(container.textContent).toContain("Quick Directive Templates");
  });

  it("submits dispatch form and triggers API POST when a quick template is selected", async () => {
    await act(async () => {
      root.render(
        <MinionDispatchModal
          isOpen={true}
          onClose={() => {}}
          minions={mockMinions}
        />
      );
    });

    // Click the first quick template button (Security Recon)
    const templateBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Security Recon")
    );
    expect(templateBtn).toBeTruthy();

    await act(async () => {
      templateBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // Submit form
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toBeTruthy();
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/minions",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
