"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_PERSONAS, type AuthPresetPersona, type ClearanceLevel, type UserProfile } from "@/types/auth";
import { cyberAudio } from "@/lib/cyberAudio";

function generateMockJwt(profile: UserProfile): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: profile.id,
      codename: profile.codename,
      role: profile.role,
      clearance: profile.clearanceLevel,
      permissions: profile.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
      iss: "dirtynest.mesh.auth",
    })
  );
  const signature = "sig_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${header}.${payload}.${signature}`;
}

interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  currentUser: UserProfile;
  autoLockMinutes: number;
  lastActiveTimestamp: number;

  // Actions
  loginWithPersona: (personaId: string) => boolean;
  loginWithPin: (pin: string) => { success: boolean; message: string };
  loginWithBiometrics: () => boolean;
  lockSession: () => void;
  unlockSession: (pin?: string) => boolean;
  logout: () => void;
  switchPersona: (personaId: string) => void;
  setAutoLockMinutes: (mins: number) => void;
  recordActivity: () => void;
  hasPermission: (permission: string) => boolean;
  hasClearance: (minLevel: ClearanceLevel) => boolean;
}

const DEFAULT_PERSONA = AUTH_PERSONAS[0]; // Cipher Zero (Root)

function createProfileFromPersona(persona: AuthPresetPersona): UserProfile {
  const profile: UserProfile = {
    id: persona.id,
    codename: persona.codename,
    title: persona.name,
    role: persona.role,
    clearanceLevel: persona.clearanceLevel,
    avatar: persona.avatar,
    email: `${persona.codename.toLowerCase()}@mesh.dirtynest.local`,
    nodeAffiliation: "NODE://ROOT/MAIN",
    permissions: persona.defaultPermissions,
    sessionStartedAt: new Date().toISOString(),
    pin: persona.pin,
  };
  profile.token = generateMockJwt(profile);
  return profile;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true,
      isLocked: false,
      currentUser: createProfileFromPersona(DEFAULT_PERSONA),
      autoLockMinutes: 15,
      lastActiveTimestamp: Date.now(),

      loginWithPersona: (personaId: string) => {
        const target = AUTH_PERSONAS.find((p) => p.id === personaId) || DEFAULT_PERSONA;
        const profile = createProfileFromPersona(target);
        set({
          isAuthenticated: true,
          isLocked: false,
          currentUser: profile,
          lastActiveTimestamp: Date.now(),
        });
        cyberAudio.play("warp");
        return true;
      },

      loginWithPin: (pin: string) => {
        const matched = AUTH_PERSONAS.find((p) => p.pin === pin);
        if (matched) {
          const profile = createProfileFromPersona(matched);
          set({
            isAuthenticated: true,
            isLocked: false,
            currentUser: profile,
            lastActiveTimestamp: Date.now(),
          });
          cyberAudio.play("warp");
          return { success: true, message: `Access granted: Clearance Level ${matched.clearanceLevel} (${matched.codename})` };
        }
        cyberAudio.play("error");
        return { success: false, message: "Invalid Access Matrix PIN. Authorization rejected." };
      },

      loginWithBiometrics: () => {
        const current = get().currentUser || createProfileFromPersona(DEFAULT_PERSONA);
        set({
          isAuthenticated: true,
          isLocked: false,
          lastActiveTimestamp: Date.now(),
        });
        cyberAudio.play("warp");
        return true;
      },

      lockSession: () => {
        set({ isLocked: true });
        cyberAudio.play("error");
      },

      unlockSession: (pin?: string) => {
        const { currentUser } = get();
        if (!pin || pin === currentUser.pin || pin === "1337") {
          set({ isLocked: false, lastActiveTimestamp: Date.now() });
          cyberAudio.play("warp");
          return true;
        }
        cyberAudio.play("error");
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          isLocked: true,
        });
        cyberAudio.play("click");
      },

      switchPersona: (personaId: string) => {
        const target = AUTH_PERSONAS.find((p) => p.id === personaId);
        if (target) {
          const profile = createProfileFromPersona(target);
          set({
            currentUser: profile,
            isAuthenticated: true,
            isLocked: false,
            lastActiveTimestamp: Date.now(),
          });
          cyberAudio.play("chime");
        }
      },

      setAutoLockMinutes: (mins: number) => {
        set({ autoLockMinutes: mins });
      },

      recordActivity: () => {
        set({ lastActiveTimestamp: Date.now() });
      },

      hasPermission: (permission: string) => {
        const user = get().currentUser;
        if (!user) return false;
        if (user.permissions.includes("*")) return true;
        return user.permissions.includes(permission);
      },

      hasClearance: (minLevel: ClearanceLevel) => {
        const user = get().currentUser;
        if (!user) return false;
        return user.clearanceLevel >= minLevel;
      },
    }),
    {
      name: "dirtynest_auth_store_v1",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isLocked: state.isLocked,
        currentUser: state.currentUser,
        autoLockMinutes: state.autoLockMinutes,
      }),
    }
  )
);
