"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface CyberCardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  spotlightColor?: string;
  showBrackets?: boolean;
}

export function CyberCardSpotlight({
  children,
  className,
  spotlightColor = "rgba(0, 255, 65, 0.08)",
  showBrackets = true,
  onMouseMove,
  style,
  ...props
}: CyberCardSpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
      }
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "luminous-surface-l2 group relative rounded-xl transition-all duration-200",
        className
      )}
      style={{
        ["--spotlight-color" as string]: spotlightColor,
        ...style,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color), transparent 60%)",
        }}
      />
      {showBrackets && (
        <>
          <span className="hud-corner-bracket tl transition-opacity duration-200 group-hover:opacity-90" />
          <span className="hud-corner-bracket br transition-opacity duration-200 group-hover:opacity-90" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default CyberCardSpotlight;
