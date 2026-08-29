"use client";

import { useState } from "react";
import {
  Container,
  Copy,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

type StackPreset = "Next.js" | "FastAPI" | "Go Alpine" | "Node.js";

const DOCKERFILES: Record<StackPreset, string> = {
  "Next.js": `# Multi-stage Next.js Production Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`,

  FastAPI: `# Multi-stage Python FastAPI Dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir poetry
COPY pyproject.toml poetry.lock* ./
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM python:3.11-slim AS runner
WORKDIR /app
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,

  "Go Alpine": `# Multi-stage Go Static Binary Dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server .

FROM alpine:3.19 AS runner
WORKDIR /app
COPY --from=builder /app/server /app/server
EXPOSE 8080
CMD ["/app/server"]`,

  "Node.js": `# Production Node.js Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "index.js"]`,
};

const COMPOSE_FILES: Record<StackPreset, string> = {
  "Next.js": `version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  redis_data:`,

  FastAPI: `version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/nest_db
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: nest_db
    volumes:
      - pg_data:/var/lib/postgresql/data
volumes:
  pg_data:`,

  "Go Alpine": `version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    restart: always`,

  "Node.js": `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000`,
};

export default function DockerComposer() {
  const [selectedStack, setSelectedStack] = useState<StackPreset>("Next.js");
  const [viewTab, setViewTab] = useState<"dockerfile" | "compose">("dockerfile");
  const [copied, setCopied] = useState(false);

  const activeContent =
    viewTab === "dockerfile"
      ? DOCKERFILES[selectedStack]
      : COMPOSE_FILES[selectedStack];

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Container size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              DOCKERFILE & COMPOSE BUILDER
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Multi-Stage Production Container Manifest Generator
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "COPIED" : "COPY MANIFEST"}</span>
        </button>
      </div>

      {/* Stack Presets & File Switcher */}
      <div className="cyber-card p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Framework Selector */}
        <div className="flex items-center gap-1.5">
          {(["Next.js", "FastAPI", "Go Alpine", "Node.js"] as StackPreset[]).map((stack) => (
            <button
              key={stack}
              onClick={() => {
                cyberAudio.play("click");
                setSelectedStack(stack);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStack === stack
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-white/5 text-[#9499B3]"
              }`}
            >
              {stack}
            </button>
          ))}
        </div>

        {/* File Type Tab Switcher */}
        <div className="flex p-0.5 bg-black/60 rounded-xl border border-white/10 text-[10px]">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("dockerfile");
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewTab === "dockerfile"
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "text-[#9499B3]"
            }`}
          >
            Dockerfile
          </button>
          <button
            onClick={() => {
              cyberAudio.play("click");
              setViewTab("compose");
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              viewTab === "compose"
                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                : "text-[#9499B3]"
            }`}
          >
            docker-compose.yml
          </button>
        </div>
      </div>

      {/* Manifest Viewer */}
      <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold">
          <span>{selectedStack} // {viewTab === "dockerfile" ? "Dockerfile" : "docker-compose.yml"}</span>
          <span className="text-[#00FF41]">Production-Ready</span>
        </div>

        <pre className="w-full p-4 bg-black/80 border border-white/5 rounded-xl text-xs text-[#00FF41] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
          <code>{activeContent}</code>
        </pre>
      </div>
    </div>
  );
}
