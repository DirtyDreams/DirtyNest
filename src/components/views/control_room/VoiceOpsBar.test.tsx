import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import VoiceOpsBar from "./VoiceOpsBar";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("VoiceOpsBar Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("renders voice control button and idle state", async () => {
    await act(async () => {
      root.render(<VoiceOpsBar />);
    });

    expect(container.textContent).toContain("VOICE CONTROL");
    expect(container.textContent).toContain("IDLE");
  });

  it("triggers onCommandRecognized when a quick chip is clicked", async () => {
    const handleCommand = vi.fn();
    await act(async () => {
      root.render(<VoiceOpsBar onCommandRecognized={handleCommand} />);
    });

    const chip = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("Security")
    );
    expect(chip).toBeTruthy();

    await act(async () => {
      chip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handleCommand).toHaveBeenCalledWith("Run Security Sentinel");
    expect(container.textContent).toContain("Run Security Sentinel");
  });
});
