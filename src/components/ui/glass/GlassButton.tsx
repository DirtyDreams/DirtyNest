"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  glow?: "green" | "purple" | "cyan" | "amber" | "red" | "none";
  size?: "sm" | "md" | "lg" | "icon";
}

export function GlassButton({
  className,
  glow = "green",
  size = "md",
  children,
  ...props
}: GlassButtonProps) {
  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs gap-1.5 h-7",
    md: "px-3.5 py-1.5 text-xs gap-2 h-9",
    lg: "px-5 py-2.5 text-sm gap-2.5 h-11",
    icon: "h-8 w-8 p-0 justify-center",
  };

  const glowStyles = {
    green: "hover:bg-[#00FF41]/15 hover:border-[#00FF41]/50 text-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.25)]",
    purple: "hover:bg-[#BF40FF]/15 hover:border-[#BF40FF]/50 text-[#BF40FF] hover:shadow-[0_0_15px_rgba(191,64,255,0.25)]",
    cyan: "hover:bg-[#00F0FF]/15 hover:border-[#00F0FF]/50 text-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]",
    amber: "hover:bg-[#FFB800]/15 hover:border-[#FFB800]/50 text-[#FFB800] hover:shadow-[0_0_15px_rgba(255,184,0,0.25)]",
    red: "hover:bg-[#FF2A6D]/15 hover:border-[#FF2A6D]/50 text-[#FF2A6D] hover:shadow-[0_0_15px_rgba(255,42,109,0.25)]",
    none: "hover:bg-white/10 hover:border-white/20 text-[#F1F3F9]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-mono font-bold tracking-wider uppercase border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        sizeStyles[size],
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
