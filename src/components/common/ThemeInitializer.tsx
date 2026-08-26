"use client";

import { useEffect, useLayoutEffect } from "react";
import { applyThemePreset } from "@/lib/theme";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ThemeInitializer() {
  useIsomorphicLayoutEffect(() => {
    try {
      const themeId =
        localStorage.getItem("dirtynest_active_theme") ||
        localStorage.getItem("dirtynest_theme") ||
        "matrix";
      applyThemePreset(themeId);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
