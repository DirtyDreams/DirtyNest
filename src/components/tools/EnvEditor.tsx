"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Plus, Trash2, Check, Upload, FileText, Code2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

interface EnvVar {
  id: string;
  key: string;
  value: string;
  comment?: string;
  isSecret?: boolean;
}

const DEFAULT_ENV: EnvVar[] = [
  { id: "e1", key: "NODE_ENV", value: "development", comment: "Application runtime environment", isSecret: false },
  { id: "e2", key: "DATABASE_URL", value: "sqlite://./data/dirtynest.db", comment: "Local SQLite database URI", isSecret: true },
  { id: "e3", key: "AUTH_JWT_SECRET", value: "dirtynest_super_secret_matrix_key_2026", comment: "HMAC signing secret", isSecret: true },
  { id: "e4", key: "PORT", value: "3000", comment: "Web server binding port", isSecret: false },
  { id: "e5", key: "AIRGAP_MODE", value: "true", comment: "Enforce zero outbound telemetry", isSecret: false },
];

export default function EnvEditor() {
  const [vars, setVars] = useState<EnvVar[]>(DEFAULT_ENV);
  const [showAllSecrets, setShowAllSecrets] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dirtynest_env_vault");
      if (saved) setVars(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToStorage = (updated: EnvVar[]) => {
    setVars(updated);
    try {
      localStorage.setItem("dirtynest_env_vault", JSON.stringify(updated));
    } catch {}
  };

  const addRow = () => {
    cyberAudio.play("click");
    const newVar: EnvVar = {
      id: crypto.randomUUID(),
      key: "NEW_ENV_VAR",
      value: "",
      comment: "",
      isSecret: false,
    };
    saveToStorage([...vars, newVar]);
  };

  const updateVar = (id: string, field: keyof EnvVar, val: any) => {
    const updated = vars.map((v) => (v.id === id ? { ...v, [field]: val } : v));
    saveToStorage(updated);
  };

  const deleteVar = (id: string) => {
    cyberAudio.play("click");
    saveToStorage(vars.filter((v) => v.id !== id));
  };

  const generateEnvString = () => {
    return vars
      .map((v) => {
        let line = "";
        if (v.comment) line += `# ${v.comment}\n`;
        line += `${v.key}=${v.value}`;
        return line;
      })
      .join("\n");
  };

  const generateJsonString = () => {
    const obj: Record<string, string> = {};
    vars.forEach((v) => (obj[v.key] = v.value));
    return JSON.stringify(obj, null, 2);
  };

  const generateDockerFlags = () => {
    return vars.map((v) => `-e ${v.key}="${v.value}"`).join(" \\\n  ");
  };

  const copyAs = (format: "env" | "json" | "docker") => {
    cyberAudio.play("click");
    let text = "";
    if (format === "env") text = generateEnvString();
    else if (format === "json") text = generateJsonString();
    else text = generateDockerFlags();

    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    cyberAudio.play("click");
    const lines = importText.split("\n");
    const parsed: EnvVar[] = [];
    let pendingComment = "";

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#")) {
        pendingComment = trimmed.slice(1).trim();
        continue;
      }
      if (trimmed.includes("=")) {
        const eqIdx = trimmed.indexOf("=");
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        parsed.push({
          id: crypto.randomUUID(),
          key,
          value,
          comment: pendingComment,
          isSecret: key.toLowerCase().includes("secret") || key.toLowerCase().includes("key") || key.toLowerCase().includes("pass"),
        });
        pendingComment = "";
      }
    }

    if (parsed.length > 0) {
      saveToStorage(parsed);
      setShowImport(false);
      setImportText("");
    }
  };

  const filtered = vars.filter(
    (v) =>
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      (v.comment && v.comment.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
            Environment Variables (`.env`) Vault
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowAllSecrets(!showAllSecrets);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-white/20 text-[#9499B3] hover:text-[#F1F3F9] transition-all cursor-pointer"
          >
            {showAllSecrets ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showAllSecrets ? "HIDE SECRETS" : "REVEAL ALL"}</span>
          </button>

          <button
            onClick={() => copyAs("env")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
          >
            {copiedFormat === "env" ? <Check size={13} className="text-[#00FF41]" /> : <FileText size={13} />}
            <span>{copiedFormat === "env" ? "COPIED" : "COPY .ENV"}</span>
          </button>

          <button
            onClick={() => copyAs("docker")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/40 text-[#9499B3] hover:text-[#00F0FF] transition-all cursor-pointer"
          >
            {copiedFormat === "docker" ? <Check size={13} className="text-[#00F0FF]" /> : <Code2 size={13} />}
            <span>{copiedFormat === "docker" ? "COPIED" : "COPY DOCKER -E"}</span>
          </button>

          <button
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-white/20 text-[#9499B3] hover:text-[#F1F3F9] transition-all cursor-pointer"
          >
            <Upload size={13} />
            <span>IMPORT RAW</span>
          </button>

          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF41]/15 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/25 text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.2)]"
          >
            <Plus size={13} />
            <span>ADD VARIABLE</span>
          </button>
        </div>
      </div>

      {/* Raw Import Box */}
      {showImport && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-[#00F0FF]/30 flex flex-col gap-3 animate-fade-in">
          <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
            Import Existing .env File
          </span>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste raw .env contents (KEY=VALUE)..."
            rows={5}
            className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-[#00F0FF] outline-none resize-none focus:border-[#00F0FF]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowImport(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#9499B3] hover:text-[#F1F3F9] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00F0FF]/20 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 cursor-pointer"
            >
              PARSE & REPLACE
            </button>
          </div>
        </div>
      )}

      {/* Variables Table */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <span className="text-[10px] text-[#9499B3] uppercase font-bold tracking-wider">
            KEY-VALUE MATRIX ({vars.length} VARIABLES)
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter keys or comments..."
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-[#F1F3F9] outline-none focus:border-[#00FF41] w-48"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-[#4F536E] text-xs">
              No environment variables match the search filter.
            </div>
          )}

          {filtered.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all items-center"
            >
              {/* Key Input */}
              <div className="md:col-span-4">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => updateVar(item.id, "key", e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                  className="w-full bg-transparent outline-none text-xs font-bold text-[#00FF41] font-mono select-all"
                  placeholder="KEY_NAME"
                />
              </div>

              {/* Value Input */}
              <div className="md:col-span-5 relative flex items-center">
                <input
                  type={item.isSecret && !showAllSecrets ? "password" : "text"}
                  value={item.value}
                  onChange={(e) => updateVar(item.id, "value", e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F9] font-mono outline-none focus:border-[#00F0FF] pr-8"
                  placeholder="variable_value"
                />
                <button
                  onClick={() => updateVar(item.id, "isSecret", !item.isSecret)}
                  className="absolute right-2 text-[#4F536E] hover:text-[#9499B3] cursor-pointer"
                  title={item.isSecret ? "Secret Masked" : "Plain Text"}
                >
                  {item.isSecret ? <Lock size={12} className="text-[#BF40FF]" /> : <Eye size={12} />}
                </button>
              </div>

              {/* Comment / Note */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={item.comment || ""}
                  onChange={(e) => updateVar(item.id, "comment", e.target.value)}
                  className="w-full bg-transparent text-[10px] text-[#9499B3] outline-none italic placeholder:text-[#4F536E]"
                  placeholder="Description..."
                />
              </div>

              {/* Action Delete */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  onClick={() => deleteVar(item.id)}
                  className="p-1 rounded text-[#4F536E] hover:text-[#FF2A6D] transition-colors cursor-pointer"
                  title="Remove variable"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
