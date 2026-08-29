"use client";

import { useState, useMemo } from "react";
import {
  FileCode,
  Copy,
  Check,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const DEFAULT_JSON = `{
  "id": "usr_948f7a",
  "name": "Aria Neon",
  "followers": 2450000,
  "isActive": true,
  "tags": ["fashion", "cyberpunk", "dj"],
  "metadata": {
    "agency": "DirtyNest",
    "tier": "VIP"
  }
}`;

function generateZodSchema(obj: any, name: string = "UserSchema"): string {
  function parseVal(val: any, indent: string = "  "): string {
    if (val === null) return "z.null()";
    if (typeof val === "string") return "z.string()";
    if (typeof val === "number") return "z.number()";
    if (typeof val === "boolean") return "z.boolean()";
    if (Array.isArray(val)) {
      const itemType = val.length > 0 ? parseVal(val[0], indent) : "z.any()";
      return `z.array(${itemType})`;
    }
    if (typeof val === "object") {
      const lines = Object.entries(val).map(
        ([k, v]) => `${indent}  ${k}: ${parseVal(v, indent + "  ")},`
      );
      return `z.object({\n${lines.join("\n")}\n${indent}})`;
    }
    return "z.any()";
  }

  const schemaBody = parseVal(obj);
  return `import { z } from "zod";\n\nexport const ${name} = ${schemaBody};\n\nexport type ${name.replace("Schema", "")} = z.infer<typeof ${name}>;`;
}

function generateTsInterface(obj: any, name: string = "User"): string {
  function parseVal(val: any, indent: string = "  "): string {
    if (val === null) return "null";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return "number";
    if (typeof val === "boolean") return "boolean";
    if (Array.isArray(val)) {
      const itemType = val.length > 0 ? parseVal(val[0], indent) : "any";
      return `${itemType}[]`;
    }
    if (typeof val === "object") {
      const lines = Object.entries(val).map(
        ([k, v]) => `${indent}  ${k}: ${parseVal(v, indent + "  ")};`
      );
      return `{\n${lines.join("\n")}\n${indent}}`;
    }
    return "any";
  }

  const ifaceBody = parseVal(obj);
  return `export interface ${name} ${ifaceBody}`;
}

export default function ZodSchemaSynthesizer() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [outputMode, setOutputMode] = useState<"ZOD" | "TYPESCRIPT">("ZOD");
  const [typeName, setTypeName] = useState("UserRecord");
  const [copied, setCopied] = useState(false);

  const { outputCode, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (outputMode === "ZOD") {
        return {
          outputCode: generateZodSchema(parsed, `${typeName}Schema`),
          error: null,
        };
      } else {
        return {
          outputCode: generateTsInterface(parsed, typeName),
          error: null,
        };
      }
    } catch (err: any) {
      return { outputCode: "", error: err.message };
    }
  }, [jsonInput, outputMode, typeName]);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <FileCode size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              ZOD & TYPESCRIPT SCHEMA SYNTHESIZER
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Infer Type-Safe Zod Schemas and TypeScript Interfaces from JSON
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-black/60 rounded-xl border border-white/10 text-[10px]">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setOutputMode("ZOD");
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                outputMode === "ZOD"
                  ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40"
                  : "text-[#9499B3]"
              }`}
            >
              ZOD SCHEMA
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setOutputMode("TYPESCRIPT");
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                outputMode === "TYPESCRIPT"
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                  : "text-[#9499B3]"
              }`}
            >
              TYPESCRIPT
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!!error}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "COPIED" : "COPY CODE"}</span>
          </button>
        </div>
      </div>

      {/* Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Input JSON */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold">
            <span>Input Sample JSON</span>
            <input
              type="text"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="Type name..."
              className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[#00FF41] outline-none"
            />
          </div>

          <textarea
            rows={14}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full flex-1 p-3 bg-black/60 border border-white/10 focus:border-[#00F0FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Right: Compiled Output */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#4F536E] uppercase font-bold">
            <span>Generated {outputMode} Definition</span>
            <span className="text-[#00FF41]">Zero-Runtime Overhead</span>
          </div>

          {error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              Syntax Error: {error}
            </div>
          ) : (
            <pre className="w-full flex-1 p-3 bg-black/80 border border-white/5 rounded-xl text-xs text-[#00FF41] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
              <code>{outputCode}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
