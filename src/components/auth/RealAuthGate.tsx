"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRealAuthStore } from "@/stores/useRealAuthStore";
import LoginScreen from "./LoginScreen";

// Primary security gate: checks the httpOnly session cookie via /api/auth/me.
// Until real auth succeeds, the app is not rendered. The persona/clearance
// layer (useAuthStore) remains a secondary, optional roleplay gate.
export default function RealAuthGate({ children }: { children: React.ReactNode }) {
  const status = useRealAuthStore((s) => s.status);
  const check = useRealAuthStore((s) => s.check);

  useEffect(() => {
    check();
  }, [check]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080E] select-none">
        <div className="flex flex-col items-center gap-3 font-mono text-[#00FF41]">
          <Loader2 size={28} className="animate-spin" />
          <span className="text-xs tracking-widest">VERIFYING SESSION...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthed") {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
