"use client";

import { useRef, useEffect, useState } from "react";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Sparkles, Network } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  links: string[];
}

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export default function KnowledgeGraphCanvas({
  nodes: initialNodes,
  selectedNodeId,
  onSelectNode,
}: KnowledgeGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);

  // Initialize node positions in a circular formation with physics velocities
  useEffect(() => {
    const width = 800;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;

    nodesRef.current = initialNodes.map((n, i) => {
      const angle = (i / initialNodes.length) * 2 * Math.PI;
      const radius = 120 + (i % 3) * 45;
      return {
        ...n,
        x: centerX + Math.cos(angle) * radius + (Math.random() * 20 - 10),
        y: centerY + Math.sin(angle) * radius + (Math.random() * 20 - 10),
        vx: 0,
        vy: 0,
      };
    });
  }, [initialNodes]);

  // Physics animation loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      // Draw subtle background grid
      ctx.strokeStyle = "rgba(0, 255, 65, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width * 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x - canvas.width / 2, -canvas.height);
        ctx.lineTo(x - canvas.width / 2, canvas.height * 2);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height * 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-canvas.width, y - canvas.height / 2);
        ctx.lineTo(canvas.width * 2, y - canvas.height / 2);
        ctx.stroke();
      }

      const nodes = nodesRef.current;

      // Draw Links (edges) between nodes
      ctx.lineWidth = 1.2;
      for (const node of nodes) {
        for (const targetId of node.links) {
          const target = nodes.find((n) => n.id === targetId);
          if (target) {
            const isHighlighted = selectedNodeId === node.id || selectedNodeId === target.id;
            ctx.strokeStyle = isHighlighted ? "rgba(0, 240, 255, 0.6)" : "rgba(255, 255, 255, 0.12)";
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      for (const node of nodes) {
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;

        // Glow ring if selected
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = `${node.color}30`;
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node title text
        ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
        ctx.fillStyle = isSelected ? "#00FF41" : "#D1D5DB";
        ctx.textAlign = "center";
        ctx.fillText(node.title.length > 18 ? node.title.slice(0, 16) + "..." : node.title, node.x, node.y + node.radius + 14);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [zoom, offset, selectedNodeId, hoveredNode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / zoom;
    const mouseY = (e.clientY - rect.top - offset.y) / zoom;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Detect hovered node
    const found = nodesRef.current.find((n) => {
      const dist = Math.hypot(n.x - mouseX, n.y - mouseY);
      return dist <= n.radius + 4;
    });

    setHoveredNode(found || null);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      cyberAudio.play("click");
      onSelectNode(hoveredNode.id);
    }
  };

  return (
    <div className="relative w-full h-[420px] rounded-2xl bg-[#06070b] border border-emerald-500/20 overflow-hidden font-mono select-none">
      {/* Floating HUD Controls */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white">
        <Network className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-bold text-emerald-400">OBSIDIAN 2D KNOWLEDGE GRAPH</span>
        <span className="text-[10px] text-slate-400">({initialNodes.length} nodes)</span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => {
            cyberAudio.play("click");
            setZoom((z) => Math.min(2, z + 0.15));
          }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cyberAudio.play("click");
            setZoom((z) => Math.max(0.4, z - 0.15));
          }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            cyberAudio.play("click");
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {hoveredNode && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/40 text-[11px] text-white pointer-events-none animate-fade-in shadow-xl">
          <div className="font-bold text-cyan-400">{hoveredNode.title}</div>
          <div className="text-[10px] text-slate-400">Category: {hoveredNode.category}</div>
          <div className="text-[10px] text-emerald-400">Links: {hoveredNode.links.length} connections</div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={900}
        height={420}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
