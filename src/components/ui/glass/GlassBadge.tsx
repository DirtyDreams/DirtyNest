"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "green" | "purple" | "cyan" | "amber" | "red" | "neutral";
  pulse?: boolean;
}

export function GlassBadge({
  className,
  variant = "neutral",
  pulse = false,
  children,
  ...props
}: GlassBadgeProps) {
  const variantStyles = {
    green: "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 shadow-[0_0_12px_rgba(0,255,65,0.15)]",
    purple: "bg-[#BF40FF]/10 text-[#BF40FF] border-[#BF40FF]/30 shadow-[0_0_12px_rgba(191,64,255,0.15)]",
    cyan: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]",
    amber: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30 shadow-[0_0_12px_rgba(255,184,0,0.15)]",
    red: "bg-[#FF2A6D]/10 text-[#FF2A6D] border-[#FF2A6D]/30 shadow-[0_0_12px_rgba(255,42,109,0.15)]",
    neutral: "bg-white/5 text-[#9499B3] border-white/10",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md transition-all select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-ping shrink-0",
            variant === "green" && "bg-[#00FF41]",
            variant === "purple" && "bg-[#BF40FF]",
            variant === "cyan" && "bg-[#00F0FF]",
            variant === "amber" && "bg-[#FFB800]",
            variant === "red" && "bg-[#FF2A6D]",
            variant === "neutral" && "bg-white"
          )}
        />
      )}
      {children}
    </div>
  );
}
