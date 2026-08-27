"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const VIEW_COLORS: Record<string, RGB> = {
  dashboard: { r: 0, g: 255, b: 65 },
  logs: { r: 0, g: 255, b: 65 },
  docker: { r: 0, g: 240, b: 255 },
  tools: { r: 0, g: 240, b: 255 },
  intel: { r: 0, g: 240, b: 255 },
  api_health: { r: 0, g: 240, b: 255 },
  ai_agents: { r: 191, g: 64, b: 255 },
  control_room: { r: 191, g: 64, b: 255 },
  persona_nexus: { r: 191, g: 64, b: 255 },
  schedule: { r: 255, g: 184, b: 0 },
  stats: { r: 0, g: 240, b: 255 },
  knowledge: { r: 0, g: 255, b: 65 },
  settings: { r: 148, g: 153, b: 179 },
  social_media: { r: 255, g: 42, b: 109 },
  sound_studio: { r: 191, g: 64, b: 255 },
  image_studio: { r: 0, g: 240, b: 255 },
};

export function ParticleMeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeView = useAppStore((s) => s.activeView);
  const fxConfig = useAppStore((s) => s.fxConfig);

  const targetColorRef = useRef<RGB>({ r: 0, g: 255, b: 65 });
  const currentColorRef = useRef<RGB>({ r: 0, g: 255, b: 65 });
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  // Update target color when activeView or colorMode changes
  useEffect(() => {
    if (fxConfig.particleColorMode === "green") {
      targetColorRef.current = { r: 0, g: 255, b: 65 };
    } else if (fxConfig.particleColorMode === "cyan") {
      targetColorRef.current = { r: 0, g: 240, b: 255 };
    } else if (fxConfig.particleColorMode === "purple") {
      targetColorRef.current = { r: 191, g: 64, b: 255 };
    } else {
      targetColorRef.current = VIEW_COLORS[activeView] || { r: 0, g: 255, b: 65 };
    }
  }, [activeView, fxConfig.particleColorMode]);

  useEffect(() => {
    if (fxConfig.backgroundFx === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Initialize particles
    const particleCount = fxConfig.particleCount || 65;
    const speedMultiplier = fxConfig.particleSpeed || 1.0;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7 * speedMultiplier,
        vy: (Math.random() - 0.5) * 0.7 * speedMultiplier,
        radius: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.2,
      });
    }

    const maxLineDist = 115;
    const mouseRadius = 140;

    const animate = () => {
      // Color interpolation for smooth tint transitions
      const cur = currentColorRef.current;
      const target = targetColorRef.current;
      cur.r += (target.r - cur.r) * 0.05;
      cur.g += (target.g - cur.g) * 0.05;
      cur.b += (target.b - cur.b) * 0.05;

      const r = Math.round(cur.r);
      const g = Math.round(cur.g);
      const b = Math.round(cur.b);

      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const interaction = fxConfig.particleInteraction;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse physics
        if (mouseX !== null && mouseY !== null && interaction !== "none") {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius && dist > 0) {
            const force = (mouseRadius - dist) / mouseRadius;
            if (interaction === "repulse") {
              p.x += (dx / dist) * force * 2.5;
              p.y += (dy / dist) * force * 2.5;
            } else if (interaction === "attract") {
              p.x -= (dx / dist) * force * 1.8;
              p.y -= (dy / dist) * force * 1.8;
            }
          }
        }

        // Standard movement
        p.x += p.vx;
        p.y += p.vy;

        // Boundary wrap / bounce
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby particles with lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;
          const lDist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (lDist < maxLineDist) {
            const alpha = (1 - lDist / maxLineDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [fxConfig]);

  if (fxConfig.backgroundFx === "none") {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}
