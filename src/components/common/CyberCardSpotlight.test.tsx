import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import CyberCardSpotlight from "./CyberCardSpotlight";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("CyberCardSpotlight", () => {
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
  });

  it("renders children correctly", () => {
    act(() => {
      root.render(
        <CyberCardSpotlight>
          <div data-testid="child">Test Content</div>
        </CyberCardSpotlight>
      );
    });

    expect(container.textContent).toContain("Test Content");
    const child = container.querySelector('[data-testid="child"]');
    expect(child).not.toBeNull();
  });

  it("applies default spotlight-color and allows custom spotlightColor", () => {
    act(() => {
      root.render(
        <CyberCardSpotlight spotlightColor="rgba(255, 0, 0, 0.2)">
          <span>Color Test</span>
        </CyberCardSpotlight>
      );
    });

    const card = container.firstElementChild as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.style.getPropertyValue("--spotlight-color")).toBe("rgba(255, 0, 0, 0.2)");
  });

  it("renders brackets by default and can toggle them off", () => {
    act(() => {
      root.render(
        <CyberCardSpotlight showBrackets={true}>
          <span>Brackets On</span>
        </CyberCardSpotlight>
      );
    });

    const tlBracket = container.querySelector(".hud-corner-bracket.tl");
    const brBracket = container.querySelector(".hud-corner-bracket.br");
    expect(tlBracket).not.toBeNull();
    expect(brBracket).not.toBeNull();

    act(() => {
      root.render(
        <CyberCardSpotlight showBrackets={false}>
          <span>Brackets Off</span>
        </CyberCardSpotlight>
      );
    });

    expect(container.querySelector(".hud-corner-bracket")).toBeNull();
  });

  it("updates mouse position style variables on mousemove without re-rendering", () => {
    act(() => {
      root.render(
        <CyberCardSpotlight>
          <span>Mouse Test</span>
        </CyberCardSpotlight>
      );
    });

    const card = container.firstElementChild as HTMLElement;
    expect(card).not.toBeNull();

    card.getBoundingClientRect = () => ({
      left: 100,
      top: 200,
      right: 300,
      bottom: 400,
      width: 200,
      height: 200,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    });

    act(() => {
      const event = new MouseEvent("mousemove", {
        bubbles: true,
        clientX: 150,
        clientY: 280,
      });
      card.dispatchEvent(event);
    });

    expect(card.style.getPropertyValue("--mouse-x")).toBe("50px");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("80px");
  });
});
