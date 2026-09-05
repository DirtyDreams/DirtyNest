"use client";

import { create } from "zustand";

export type RealAuthStatus = "loading" | "authed" | "unauthed";

export interface RealAuthUser {
  id: number;
  username: string;
  role: string;
}

interface RealAuthState {
  status: RealAuthStatus;
  user: RealAuthUser | null;
  check: () => Promise<void>;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useRealAuthStore = create<RealAuthState>((set) => ({
  status: "loading",
  user: null,

  check: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        set({
          status: "authed",
          user: { id: data.id, username: data.username, role: data.role },
        });
      } else {
        set({ status: "unauthed", user: null });
      }
    } catch {
      set({ status: "unauthed", user: null });
    }
  },

  login: async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        set({
          status: "authed",
          user: { id: data.id, username: data.username, role: data.role },
        });
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || "Login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    set({ status: "unauthed", user: null });
  },
}));
