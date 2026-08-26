"use client";

import { useState } from "react";
import { FileCode, ArrowRightLeft, Copy, Check, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const SAMPLE_JSON = `{
  "system": "DirtyNest",
  "version": "2.5.0",
  "cluster": {
    "nodes": 4,
    "region": "eu-central",
    "services": [
      "auth-mesh",
      "vector-db",
      "telemetry"
    ]
  },
  "security": {
    "airgap": true,
    "tls": "1.3"
  }
}`;

// Simple JSON to YAML converter
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = " ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    return obj.includes("\n") || obj.includes(":") || obj.includes("#")
      ? JSON.stringify(obj)
      : obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const inner = jsonToYaml(item, indent + 2).trimStart();
          return `${spaces}- ${inner}`;
        }
        return `${spaces}- ${jsonToYaml(item, 0)}`;
      })
      .join("\n");
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    return keys
      .map((k) => {
        const val = obj[k];
        if (typeof val === "object" && val !== null) {
          return `${spaces}${k}:\n${jsonToYaml(val, indent + 2)}`;
        }
        return `${spaces}${k}: ${jsonToYaml(val, 0)}`;
      })
      .join("\n");
  }
  return "";
}

// Simple YAML to JSON parser for basic key-value / lists
function yamlToJson(yamlStr: string): any {
  const lines = yamlStr.split("\n");
  const root: any = {};
  const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: root }];

  for (let line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.search(/\S/);
    const content = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const current = stack[stack.length - 1].obj;

    if (content.startsWith("- ")) {
      const val = content.slice(2).trim();
      const parentKey = stack[stack.length - 1].key;
      if (parentKey && !Array.isArray(current[parentKey])) {
        current[parentKey] = [];
      }
      const targetArr = parentKey ? current[parentKey] : current;
      if (Array.isArray(targetArr)) {
        targetArr.push(parseYamlValue(val));
      }
    } else if (content.includes(":")) {
      const colonIdx = content.indexOf(":");
      const key = content.slice(0, colonIdx).trim();
      const rawVal = content.slice(colonIdx + 1).trim();

      if (!rawVal) {
        current[key] = {};
        stack.push({ indent, obj: current, key });
      } else {
        current[key] = parseYamlValue(rawVal);
      }
    }
  }
  return root;
}

function parseYamlValue(val: string): any {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null") return null;
  if (!isNaN(Number(val)) && val !== "") return Number(val);
  if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
  if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
  return val;
}

export default function JsonYamlConverter() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [mode, setMode] = useState<"json2yaml" | "yaml2json">("json2yaml");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const processConvert = () => {
    cyberAudio.play("click");
    if (!input.trim()) {
      setOutput("");
      setStatus(null);
      return;
    }

    try {
      if (mode === "json2yaml") {
        const parsed = JSON.parse(input);
        const yaml = jsonToYaml(parsed);
        setOutput(yaml);
        setStatus({ type: "success", msg: "Valid JSON successfully converted to YAML" });
      } else {
        const parsed = yamlToJson(input);
        const json = JSON.stringify(parsed, null, 2);
        setOutput(json);
        setStatus({ type: "success", msg: "Valid YAML successfully converted to JSON" });
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: e.message || "Parsing Error" });
    }
  };

  const handleFormatJson = () => {
    cyberAudio.play("click");
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setStatus({ type: "success", msg: "JSON formatted successfully (2 spaces)" });
    } catch (e: any) {
      setStatus({ type: "error", msg: `Invalid JSON: ${e.message}` });
    }
  };

  const handleMinifyJson = () => {
    cyberAudio.play("click");
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setStatus({ type: "success", msg: "JSON minified successfully" });
    } catch (e: any) {
      setStatus({ type: "error", msg: `Invalid JSON: ${e.message}` });
    }
  };

  const copyOutput = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileCode size={16} className="text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            JSON ⇄ YAML Formatter & Converter
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setMode(mode === "json2yaml" ? "yaml2json" : "json2yaml");
              setInput(output || input);
              setOutput("");
              setStatus(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all cursor-pointer font-bold"
          >
            <ArrowRightLeft size={12} />
            <span>MODE: {mode === "json2yaml" ? "JSON ➔ YAML" : "YAML ➔ JSON"}</span>
          </button>

          {mode === "json2yaml" && (
            <>
              <button
                onClick={handleFormatJson}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
              >
                BEAUTIFY
              </button>
              <button
                onClick={handleMinifyJson}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
              >
                MINIFY
              </button>
            </>
          )}

          <button
            onClick={() => {
              cyberAudio.play("click");
              setInput("");
              setOutput("");
              setStatus(null);
            }}
            className="p-1.5 rounded-lg text-[#9499B3] hover:text-[#FF2A6D] hover:bg-white/5 transition-all cursor-pointer"
            title="Clear all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Input / Output Double Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
            <span>INPUT ({mode === "json2yaml" ? "JSON" : "YAML"})</span>
            <span>{input.length} CHARS</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json2yaml" ? "Paste JSON here..." : "Paste YAML here..."}
            rows={14}
            className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#00F0FF] text-xs font-mono text-[#F1F3F9] outline-none resize-none transition-all placeholder:text-[#4F536E] selection:bg-[#00F0FF]/20"
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
            <span>OUTPUT ({mode === "json2yaml" ? "YAML" : "JSON"})</span>
            {output && (
              <button
                onClick={copyOutput}
                className="flex items-center gap-1 text-[#00FF41] hover:underline cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "COPIED" : "COPY OUTPUT"}</span>
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Converted output will appear here..."
            rows={14}
            className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-[#00FF41] outline-none resize-none transition-all placeholder:text-[#4F536E] selection:bg-[#00FF41]/20"
          />
        </div>
      </div>

      {/* Action Convert Button & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={processConvert}
          className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
        >
          EXECUTE CONVERSION
        </button>

        {status && (
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs ${
              status.type === "success"
                ? "bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41]"
                : "bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-[#FF2A6D]"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{status.msg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
