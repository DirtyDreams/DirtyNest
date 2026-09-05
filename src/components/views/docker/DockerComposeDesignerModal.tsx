"use client";

import { useState } from "react";
<<<<<<< HEAD
import {
  X,
  Boxes,
  Plus,
  Copy,
  Check,
  Download,
  Database,
  Shield,
  Server,
  Zap,
  FileCode,
  Layers,
} from "lucide-react";
=======
import { X, Boxes, Plus, Copy, Check, Download, Database, Shield, Server, Zap, FileCode, Layers } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { cyberAudio } from "@/lib/cyberAudio";

interface DockerComposeDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES: Record<string, string> = {
  postgres_vec: `  dirtynest-db-vector:
    image: pgvector/pgvector:pg16
    container_name: dirtynest-postgres-vec
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: dirtynest
      POSTGRES_USER: tactical_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD:-dirtynest_secret}
    volumes:
      - pgvector_data:/var/lib/postgresql/data
    networks:
      - dirtynest_mesh`,

  qdrant: `  dirtynest-qdrant-memory:
    image: qdrant/qdrant:v1.9.0
    container_name: dirtynest-qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    networks:
      - dirtynest_mesh`,

  ollama: `  dirtynest-ollama-cuda:
    image: ollama/ollama:latest
    container_name: dirtynest-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - dirtynest_mesh`,

  redis: `  dirtynest-redis-cache:
    image: redis:7.2-alpine
    container_name: dirtynest-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    networks:
      - dirtynest_mesh`,

  caddy: `  dirtynest-auth-gateway:
    image: caddy:2.7-alpine
    container_name: dirtynest-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - dirtynest_mesh`,
};

const BASE_COMPOSE = `version: "3.9"

services:
  dirtynest-core:
    image: dirtynest/core:v2.4.0
    container_name: dirtynest-core-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: sqlite:///data/dirtynest.db
    volumes:
      - ./data:/app/data
    networks:
      - dirtynest_mesh

networks:
  dirtynest_mesh:
    driver: bridge

volumes:
  pgvector_data:
  qdrant_storage:
  ollama_models:
  redis_data:
  caddy_data:
  caddy_config:
`;

export default function DockerComposeDesignerModal({
  isOpen,
  onClose,
}: DockerComposeDesignerModalProps) {
  const [composeYaml, setComposeYaml] = useState(BASE_COMPOSE);
  const [copied, setCopied] = useState(false);
  const [addedServices, setAddedServices] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleInjectTemplate = (key: string, name: string) => {
    cyberAudio.play("click");
    if (addedServices.includes(key)) return;

    const templateText = TEMPLATES[key];
    if (!templateText) return;

    const servicesIdx = composeYaml.indexOf("services:");
    if (servicesIdx === -1) {
      setComposeYaml((prev) => prev + "\n" + templateText);
    } else {
      const networksIdx = composeYaml.indexOf("networks:");
      if (networksIdx !== -1) {
        const before = composeYaml.slice(0, networksIdx);
        const after = composeYaml.slice(networksIdx);
        setComposeYaml(`${before}\n${templateText}\n\n${after}`);
      } else {
        setComposeYaml((prev) => prev + "\n" + templateText);
      }
    }

    setAddedServices((prev) => [...prev, key]);
    cyberAudio.play("chime");
  };

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(composeYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    cyberAudio.play("chime");
    const blob = new Blob([composeYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compose.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-[#080910] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-white">
        {/* Header */}
        <div className="p-5 bg-[#05060b] border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                DOCKER COMPOSE // <span className="text-cyan-400">STACK ARCHITECT</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Visual microservice composer with one-click tactical cluster templates
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Service Ingestion Presets (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>INJECT MICROSERVICES</span>
            </div>

            <div className="space-y-2">
              {[
                { key: "postgres_vec", name: "PostgreSQL 16 + pgvector", icon: Database, color: "#00FF41" },
                { key: "qdrant", name: "Qdrant Vector DB (v1.9)", icon: Layers, color: "#BF40FF" },
                { key: "ollama", name: "Ollama CUDA GPU Sandbox", icon: Zap, color: "#FFB800" },
                { key: "redis", name: "Redis 7.2 Cache & IPC", icon: Server, color: "#FF2A6D" },
                { key: "caddy", name: "Caddy Zero-Trust Proxy", icon: Shield, color: "#00F0FF" },
              ].map((svc) => {
                const isAdded = addedServices.includes(svc.key);
                const Icon = svc.icon;
                return (
                  <button
                    key={svc.key}
                    onClick={() => handleInjectTemplate(svc.key, svc.name)}
                    disabled={isAdded}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isAdded
                        ? "bg-black/30 border-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-black/50 border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:bg-cyan-500/5 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" style={{ color: isAdded ? "#64748B" : svc.color }} />
                      <span className="font-bold text-[11px]">{svc.name}</span>
                    </div>
                    {isAdded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
              <span className="font-bold text-cyan-400 block mb-1">PRO-TIP:</span>
              Services are automatically mapped to the shared <code className="text-white">dirtynest_mesh</code> bridge with persistent named volumes.
            </div>
          </div>

          {/* YAML Editor & Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMPOSE.YAML MANIFEST</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "COPIED" : "COPY YAML"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 text-[10px] font-bold transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT FILE</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black/80 rounded-xl border border-slate-800 p-3 overflow-hidden flex flex-col">
              <textarea
                value={composeYaml}
                onChange={(e) => setComposeYaml(e.target.value)}
                rows={16}
                className="w-full h-full bg-transparent font-mono text-[11px] text-cyan-300 outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#05060b] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Active Stack Services: <strong className="text-cyan-400">{1 + addedServices.length}</strong>
          </span>
          <button
            onClick={() => {
              cyberAudio.play("click");
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold transition-colors"
          >
            CLOSE DESIGNER
          </button>
        </div>
      </div>
    </div>
  );
}
