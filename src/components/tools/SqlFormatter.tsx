"use client";

import { useState } from "react";
import { Database, Copy, Check, Minimize2 } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN",
  "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "AND", "OR",
  "IN", "NOT IN", "EXISTS", "BETWEEN", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL",
  "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "PRIMARY KEY", "FOREIGN KEY",
  "INDEX", "UNION", "UNION ALL", "CASE", "WHEN", "THEN", "ELSE", "END", "AS"
];

function formatSql(raw: string, uppercase: boolean): string {
  let query = raw.trim();

  // Keyword capitalization
  if (uppercase) {
    SQL_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      query = query.replace(regex, kw);
    });
  }

  // Insert standard newlines before major clauses
  const majorClauses = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN",
    "INNER JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
    "SET", "VALUES"
  ];

  majorClauses.forEach((clause) => {
    const regex = new RegExp(`\\s+(${clause})\\b`, "gi");
    query = query.replace(regex, `\n$1`);
  });

  return query;
}

function minifySql(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export default function SqlFormatter() {
  const [sqlInput, setSqlInput] = useState(
    "select id, name, email, created_at from users left join user_profiles on users.id = user_profiles.user_id where status = 'active' and created_at > '2026-01-01' group by id, name order by created_at desc limit 50;"
  );
  const [dialect, setDialect] = useState<"PostgreSQL" | "SQLite" | "MySQL">("PostgreSQL");
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedSql = formatSql(sqlInput, uppercaseKeywords);

  const handleCopy = () => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(formattedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMinify = () => {
    cyberAudio.play("click");
    setSqlInput(minifySql(sqlInput));
  };

  return (
    <div className="flex flex-col gap-5 font-mono select-none animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="cyber-card p-4 bg-black/60 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#BF40FF]/10 border border-[#BF40FF]/30 flex items-center justify-center text-[#BF40FF]">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#F1F3F9] uppercase tracking-wider">
              SQL QUERY PRETTIFIER & FORMATTER
            </h3>
            <span className="text-[10px] text-[#4F536E]">
              Beautify, Capitalize Keywords & Minify SQL Queries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMinify}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-[#9499B3] hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Minify Query"
          >
            <Minimize2 size={12} />
            <span>MINIFY</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00FF41] text-black font-black text-xs hover:bg-[#00cc34] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,65,0.3)]"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "COPIED" : "COPY SQL"}</span>
          </button>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="cyber-card p-3 bg-black/40 border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Dialect:</span>
          {["PostgreSQL", "SQLite", "MySQL"].map((d) => (
            <button
              key={d}
              onClick={() => {
                cyberAudio.play("click");
                setDialect(d as any);
              }}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                dialect === d
                  ? "bg-[#BF40FF]/20 text-[#BF40FF] border border-[#BF40FF]/50 shadow-[0_0_10px_rgba(191,64,255,0.2)]"
                  : "bg-white/5 text-[#9499B3]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-[#9499B3] cursor-pointer">
          <input
            type="checkbox"
            checked={uppercaseKeywords}
            onChange={(e) => setUppercaseKeywords(e.target.checked)}
            className="accent-[#BF40FF]"
          />
          <span>UPPERCASE KEYWORDS</span>
        </label>
      </div>

      {/* Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw Query Input */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Raw SQL Input</span>
          <textarea
            rows={12}
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            className="w-full flex-1 p-3 bg-black/60 border border-white/10 focus:border-[#BF40FF] rounded-xl text-xs text-[#F1F3F9] font-mono outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Formatted Output */}
        <div className="cyber-card p-4 bg-[#080914] border border-white/10 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] text-[#4F536E] uppercase font-bold">Prettified SQL Output</span>
          <pre className="w-full flex-1 p-3 bg-black/80 border border-white/5 rounded-xl text-xs text-[#00FF41] font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
            <code>{formattedSql}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
