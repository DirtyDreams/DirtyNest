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
  const tunnelOffsetRef = useRef(0);

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
        vx: (Math.random() - 0.5) * 0.5 * speedMultiplier,
        vy: (Math.random() - 0.5) * 0.5 * speedMultiplier,
        radius: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth color lerping
      const target = targetColorRef.current;
      const current = currentColorRef.current;
      current.r += (target.r - current.r) * 0.05;
      current.g += (target.g - current.g) * 0.05;
      current.b += (target.b - current.b) * 0.05;

      const r = Math.round(current.r);
      const g = Math.round(current.g);
      const b = Math.round(current.b);

      if (fxConfig.backgroundFx === "tunnel") {
        // 3D CYBERSPACE TUNNEL ENGINE
        tunnelOffsetRef.current += 0.015 * speedMultiplier;
        const offset = tunnelOffsetRef.current;

        // Vanishing point with mouse parallax deflection
        let vpX = width / 2;
        let vpY = height / 2;
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          vpX += (mouseRef.current.x - width / 2) * 0.12;
          vpY += (mouseRef.current.y - height / 2) * 0.12;
        }

        const numRings = 14;
        const maxRadius = Math.hypot(width, height) * 0.65;

        // Draw radial perspective rays
        const numRays = 16;
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const endX = vpX + Math.cos(angle) * maxRadius;
          const endY = vpY + Math.sin(angle) * maxRadius;

          ctx.beginPath();
          ctx.moveTo(vpX, vpY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }

        // Draw forward-moving concentric perspective rings
        for (let i = 0; i < numRings; i++) {
          const progress = ((i / numRings + offset) % 1);
          // Exponential distance scaling for realistic 3D depth
          const depth = Math.pow(progress, 2.5);
          const ringRadius = depth * maxRadius;
          const alpha = depth * 0.35;

          if (ringRadius > 2) {
            ctx.lineWidth = Math.max(1, depth * 2.5);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
            ctx.shadowBlur = depth > 0.6 ? 10 : 0;

            ctx.beginPath();
            ctx.arc(vpX, vpY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      } else {
        // PARTICLE MESH ENGINE
        const maxDist = 130;
        const mouseRadius = 140;
        const interaction = fxConfig.particleInteraction;

        // Update particle positions & interactions
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off bounds
          if (p.x < 0 || p.x > width) p.vx = -p.vx;
          if (p.y < 0 || p.y > height) p.vy = -p.vy;

          // Mouse physics
          if (mouseRef.current.x !== null && mouseRef.current.y !== null && interaction !== "none") {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist < mouseRadius && dist > 0) {
              const force = (1 - dist / mouseRadius) * 2;
              const angle = Math.atan2(dy, dx);
              if (interaction === "repulse") {
                p.x -= Math.cos(angle) * force;
                p.y -= Math.sin(angle) * force;
              } else if (interaction === "attract") {
                p.x += Math.cos(angle) * force * 0.5;
                p.y += Math.sin(angle) * force * 0.5;
              }
            }
          }

          // Draw node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.baseAlpha})`;
          ctx.fill();
        }

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.hypot(dx, dy);

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.18;
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [fxConfig.backgroundFx, fxConfig.particleCount, fxConfig.particleSpeed, fxConfig.particleInteraction]);

  if (fxConfig.backgroundFx === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
}
