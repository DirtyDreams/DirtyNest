<<<<<<< HEAD
import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "text-sm", false && "hidden", "px-4")).toBe("text-sm px-4");
  });
});
=======
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("resolves tailwind-merge conflicts keeping the last class", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("filters falsy inputs", () => {
    expect(cn("a", false, undefined)).toBe("a");
  });

  it("keeps arbitrary-value utilities intact and resolves conflicts", () => {
    expect(cn("text-[#00FF41]", "text-[#BF40FF]")).toBe("text-[#BF40FF]");
  });
});
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
