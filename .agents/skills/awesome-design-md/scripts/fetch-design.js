#!/usr/bin/env node
/**
 * fetch-design.js
 * CLI tool for exploring, inspecting, and applying DESIGN.md systems from awesome-design-md.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const LOCAL_CACHE = "C:/Users/coyot/.gemini/tmp/awesome-design-md/design-md";
const REPO_RAW_BASE = "https://raw.githubusercontent.com/DirtyDreams/awesome-design-md/main/design-md";

function fetchRemote(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRemote(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function getDesignContent(brand) {
  const localFile = path.join(LOCAL_CACHE, brand, "DESIGN.md");
  if (fs.existsSync(localFile)) {
    return fs.readFileSync(localFile, "utf8");
  }
  const url = `${REPO_RAW_BASE}/${brand}/DESIGN.md`;
  return await fetchRemote(url);
}

function listBrands() {
  if (fs.existsSync(LOCAL_CACHE)) {
    return fs.readdirSync(LOCAL_CACHE).filter(f => fs.statSync(path.join(LOCAL_CACHE, f)).isDirectory());
  }
  return [
    "airbnb", "airtable", "apple", "binance", "bmw", "bmw-m", "bugatti", "cal", "claude", "clay",
    "clickhouse", "cohere", "coinbase", "composio", "cursor", "dell-1996", "elevenlabs", "expo",
    "ferrari", "figma", "framer", "hashicorp", "hp", "ibm", "intercom", "kraken", "lamborghini",
    "linear.app", "lovable", "mastercard", "meta", "minimax", "mintlify", "miro", "mistral.ai",
    "mongodb", "nike", "nintendo-2001", "notion", "nvidia", "ollama", "opencode.ai", "pinterest",
    "playstation", "posthog", "raycast", "renault", "replicate", "resend", "revolut", "runwayml",
    "sanity", "sentry", "shopify", "slack", "spacex", "spotify", "starbucks", "stripe", "supabase",
    "superhuman", "tesla", "theverge", "together.ai", "uber", "vercel", "vodafone", "voltagent",
    "warp", "webflow", "wired", "wise", "x.ai", "zapier"
  ];
}

function extractColors(content) {
  const colors = {};
  const yamlMatch = content.match(/^colors:\s*([\s\S]*?)(?=\n[a-z]+:|\n---)/m);
  if (yamlMatch) {
    const lines = yamlMatch[1].split("\n");
    for (const line of lines) {
      const m = line.match(/^\s*([a-zA-Z0-9_-]+):\s*["']?([#a-zA-Z0-9_().,% -]+)["']?/);
      if (m) colors[m[1]] = m[2];
    }
  } else {
    const matches = content.matchAll(/([a-zA-Z0-9 -]+)\s*\((#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\)/g);
    for (const m of matches) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "-");
      if (!colors[key]) colors[key] = m[2];
    }
  }
  return colors;
}

function generateCssVariables(brand, content) {
  const colors = extractColors(content);
  let css = `/* Generated from DESIGN.md: ${brand} */\n:root {\n`;
  for (const [k, v] of Object.entries(colors)) {
    css += `  --color-${k}: ${v};\n`;
  }
  css += `}\n`;
  return css;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`
Usage:
  node fetch-design.js list [filter]        List available brand design systems
  node fetch-design.js info <brand>         Inspect brand atmosphere and colors
  node fetch-design.js css <brand>          Output CSS custom properties (--color-*)
  node fetch-design.js apply <brand> [dest] Copy DESIGN.md into project root (default: ./DESIGN.md)
  node fetch-design.js dump <brand>         Print full DESIGN.md to stdout
`);
    return;
  }

  if (command === "list") {
    const filter = args[1] ? args[1].toLowerCase() : "";
    const brands = listBrands().filter(b => b.toLowerCase().includes(filter));
    console.log(`Available brands (${brands.length}):`);
    brands.forEach(b => console.log(`  - ${b}`));
    return;
  }

  const brand = args[1] || args[0];
  try {
    const content = await getDesignContent(brand);

    if (command === "info" || (command !== "list" && command !== "apply" && command !== "css" && command !== "dump")) {
      const nameMatch = content.match(/^name:\s*(.+)$/m) || content.match(/^#\s*(.+)$/m);
      const descMatch = content.match(/^description:\s*"?([^"\n]+)/m) || content.match(/## 1\.\s*Visual Theme[^\n]*\n+([^\n]+)/m);
      const colors = extractColors(content);

      console.log(`Brand: ${nameMatch ? nameMatch[1].trim() : brand}`);
      console.log(`Description: ${descMatch ? descMatch[1].trim() : "N/A"}\n`);
      console.log("Extracted Color Tokens:");
      for (const [k, v] of Object.entries(colors)) {
        console.log(`  ${k.padEnd(20)}: ${v}`);
      }
      return;
    }

    if (command === "css") {
      console.log(generateCssVariables(brand, content));
      return;
    }

    if (command === "dump") {
      process.stdout.write(content);
      return;
    }

    if (command === "apply") {
      const dest = args[2] || "DESIGN.md";
      fs.writeFileSync(dest, content, "utf8");
      console.log(`Successfully wrote ${brand} DESIGN.md to ${path.resolve(dest)}`);
      return;
    }
  } catch (err) {
    console.error(`Error for brand "${brand}":`, err.message);
    process.exit(1);
  }
}

main();
