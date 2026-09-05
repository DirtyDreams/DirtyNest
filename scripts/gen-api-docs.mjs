#!/usr/bin/env node
/**
 * F7.7 — Generate the API catalog from code (source of truth), replacing the
 * hand-maintained docs/api-specification.md catalog.
 *
 * Scans:
 *   - src/app/api/**\/route.ts   → Next.js App Router route handlers (method + path + auth hints)
 *   - sidecar/main.py            → FastAPI endpoints (@app.get/post/put/delete/websocket)
 *
 * Writes docs/api-catalog.md (generated; DO NOT EDIT by hand — run
 * `node scripts/gen-api-docs.mjs` to regenerate).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API_DIR = join(ROOT, "src", "app", "api");
const SIDECAR = join(ROOT, "sidecar", "main.py");
const OUT = join(ROOT, "docs", "api-catalog.md");

// ---------- Next.js route handlers ----------

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (name === "route.ts" || name === "route.tsx") acc.push(p);
  }
  return acc;
}

function pathFromRouteFile(file) {
  // src/app/api/chat/sessions/[id]/route.ts -> /api/chat/sessions/:id
  const rel = relative(join(ROOT, "src", "app"), file).replace(/\\/g, "/");
  return "/" + rel.replace(/\/route\.tsx?$/, "").replace(/\[\.\.\.([^\]]+)\]/g, ":$1*").replace(/\[([^\]]+)\]/g, ":$1");
}

function authHintFor(path) {
  // App-level knowledge (ADR-0003/F2): everything under /api is behind Next
  // middleware except auth endpoints.
  if (path.startsWith("/api/auth/") && !path.includes("/me")) return "public (login/refresh/logout)";
  return "protected (JWT middleware)";
}
void authHintFor;

function extractNextRoutes() {
  const rows = [];
  for (const file of walk(API_DIR)) {
    let content = "";
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const path = pathFromRouteFile(file);
    const methods = [];
    for (const m of HTTP_METHODS) {
      if (new RegExp(`export\\s+(async\\s+function|const)\\s+${m}\\b`).test(content)) methods.push(m);
    }
    if (!methods.length) continue;
    const hasZod = /from "zod"/.test(content) || /\bz\.object\(/.test(content);
    const dynamic = /export const dynamic\s*=\s*'force-dynamic'/.test(content);
    rows.push({ surface: "next", path, methods, zod: hasZod, forceDynamic: dynamic, file: relative(ROOT, file).replace(/\\/g, "/") });
  }
  return rows;
}

// ---------- FastAPI (sidecar) ----------

function extractSidecarRoutes() {
  const content = readFileSync(SIDECAR, "utf8");
  const rows = [];
  const re = /@app\.(get|post|put|delete|patch|websocket)\(\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(content))) {
    rows.push({ surface: "sidecar", method: m[1].toUpperCase(), path: m[2], file: "sidecar/main.py" });
  }
  return rows;
}

function groupAndRender(adminRows) {
  const groups = new Map();
  for (const r of adminRows) {
    const seg = r.path.split("/").slice(0, r.surface === "next" ? 4 : 4).join("/");
    const key = r.surface === "next" ? `Next ${seg}` : `Sidecar ${seg.split("/").slice(0, 3).join("/")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const lines = [];
  for (const key of [...groups.keys()].sort()) {
    lines.push(`\n### ${key}\n`);
    lines.push("| Method | Path | Notes |");
    lines.push("|---|---|---|");
    for (const r of groups.get(key)) {
      if (r.surface === "next") {
        const m = r.methods.join(", ");
        const notes = [r.zod ? "zod-validated" : null, r.forceDynamic ? "force-dynamic" : null].filter(Boolean).join(", ") || "—";
        lines.push(`| ${m} | \`${r.path}\` | ${notes} |`);
      } else {
        const method = r.method === "WEBSOCKET" ? "WS" : r.method;
        const notes = r.path.includes("gate") ? "HITL" : r.path.includes("telemetry") ? "telemetry" : "—";
        lines.push(`| ${method === "ANY" ? "ANY" : method} | \`${r.path}\` | ${notes} |`);
      }
    }
  }
  return lines.join("\n");
}

try {
  const nextRoutes = extractNextRoutes();
  const sidecarRoutes = extractSidecarRoutes();
  const commit = (() => {
    try {
      return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim();
    } catch {
      return "unknown";
    }
  })();

  const doc = `# DirtyNest — API Catalog (generated)

> **GENERATED FILE — do not edit by hand.** Regenerate with \`node scripts/gen-api-docs.mjs\`.
> Source of truth: \`src/app/api/**/route.ts\` + \`sidecar/main.py\` decorators. Generated at commit \`${commit}\`.
> Aspirational contracts live in \`docs/api-specification.md\`; this file reflects **code reality**.
> ${nextRoutes.length} Next.js route files (${nextRoutes.reduce((a, r) => a + r.methods.length, 0)} handlers), ${sidecarRoutes.length} sidecar endpoints.
${groupAndRender([...nextRoutes, ...sidecarRoutes])}
`;
  writeFileSync(OUT, doc, "utf8");
  console.log(`wrote ${OUT}: ${nextRoutes.length} next files, ${sidecarRoutes.length} sidecar endpoints`);
} catch (err) {
  console.error("generation failed:", err);
  globalThis.process.exitCode = 1;
}