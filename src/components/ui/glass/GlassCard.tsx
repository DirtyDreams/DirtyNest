"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "green" | "purple" | "cyan" | "amber" | "none";
  blur?: "sm" | "md" | "lg" | "xl";
  bordered?: boolean;
}

export function GlassCard({
  className,
  glow = "none",
  blur = "md",
  bordered = true,
  children,
  ...props
}: GlassCardProps) {
  const glowStyles = {
    green: "hover:border-[#00FF41]/40 hover:shadow-[0_0_25px_rgba(0,255,65,0.12)]",
    purple: "hover:border-[#BF40FF]/40 hover:shadow-[0_0_25px_rgba(191,64,255,0.12)]",
    cyan: "hover:border-[#00F0FF]/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.12)]",
    amber: "hover:border-[#FFB800]/40 hover:shadow-[0_0_25px_rgba(255,184,0,0.12)]",
    none: "hover:border-white/20",
  };

  const blurStyles = {
    sm: "backdrop-blur-xs",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-[#090A14]/75 text-[#F1F3F9] transition-all duration-300",
        blurStyles[blur],
        bordered && "border border-white/10",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between p-4 pb-2 border-b border-white/5", className)}
      {...props}
    />
  );
}

export function GlassContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function GlassFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between p-4 pt-2 border-t border-white/5", className)}
      {...props}
    />
  );
}
