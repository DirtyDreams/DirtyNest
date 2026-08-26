"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X, Zap, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return a no-op fallback so components work even outside the provider
    return {
      addToast: () => {},
      removeToast: () => {},
      success: (_title: string, _message?: string) => {},
      error: (_title: string, _message?: string) => {},
      warning: (_title: string, _message?: string) => {},
      info: (_title: string, _message?: string) => {},
    };
  }
  return {
    ...ctx,
    success: (title: string, message?: string) =>
      ctx.addToast({ type: "success", title, message }),
    error: (title: string, message?: string) =>
      ctx.addToast({ type: "error", title, message, duration: 6000 }),
    warning: (title: string, message?: string) =>
      ctx.addToast({ type: "warning", title, message, duration: 5000 }),
    info: (title: string, message?: string) =>
      ctx.addToast({ type: "info", title, message }),
  };
}

const TOAST_ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_COLORS: Record<ToastType, { border: string; icon: string; bg: string; glow: string }> = {
  success: {
    border: "rgba(0, 255, 65, 0.4)",
    icon: "#00FF41",
    bg: "rgba(0, 255, 65, 0.08)",
    glow: "0 0 20px rgba(0, 255, 65, 0.2)",
  },
  error: {
    border: "rgba(255, 42, 109, 0.4)",
    icon: "#FF2A6D",
    bg: "rgba(255, 42, 109, 0.08)",
    glow: "0 0 20px rgba(255, 42, 109, 0.2)",
  },
  warning: {
    border: "rgba(255, 184, 0, 0.4)",
    icon: "#FFB800",
    bg: "rgba(255, 184, 0, 0.08)",
    glow: "0 0 20px rgba(255, 184, 0, 0.2)",
  },
  info: {
    border: "rgba(0, 240, 255, 0.4)",
    icon: "#00F0FF",
    bg: "rgba(0, 240, 255, 0.08)",
    glow: "0 0 20px rgba(0, 240, 255, 0.2)",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = toast.duration || 3500;
      setToasts((prev) => [...prev.slice(-4), { ...toast, id }]); // max 5 visible
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container — fixed bottom-right, above status bar */}
      <div
        className="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ bottom: "44px", right: "16px", maxWidth: "380px", width: "100%" }}
      >
        {toasts.map((toast, index) => {
          const Icon = TOAST_ICONS[toast.type];
          const colors = TOAST_COLORS[toast.type];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl font-mono text-xs backdrop-blur-xl border transition-all"
              style={{
                background: `linear-gradient(135deg, ${colors.bg}, rgba(7, 7, 11, 0.92))`,
                borderColor: colors.border,
                boxShadow: colors.glow,
                animation: "toast-slide-in 0.3s ease-out forwards",
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Icon size={16} style={{ color: colors.icon, flexShrink: 0, marginTop: "1px" }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#F1F3F9] uppercase tracking-wide text-[11px]">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-[#9499B3] text-[10px] mt-0.5 leading-relaxed">
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#4F536E] hover:text-[#F1F3F9] transition-colors shrink-0 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Toast animation styles */}
      <style jsx global>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
