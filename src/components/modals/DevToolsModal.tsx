"use client";

import { useState } from "react";
import {
  Wrench,
  Copy,
  Check,
  RefreshCw,
  Hash,
  Binary,
  Clock,
  Code2,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "base64" | "uuid" | "epoch" | "json" | "hash";

export default function DevToolsModal({ isOpen, onClose }: DevToolsModalProps) {
  const [activeTab, setActiveTab] = useState<string>("base64");
  const [copied, setCopied] = useState<string | null>(null);

  // Base64 state
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");

  // UUID state
  const [uuidCount, _setUuidCount] = useState(3);
  const [uuids, setUuids] = useState<string[]>([
    "4ea6216b-116a-4504-9890-7152216d03a1",
  ]);

  // Epoch state
  const [epochInput, setEpochInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [epochResult, setEpochResult] = useState<string>("");

  // JSON state
  const [jsonInput, setJsonInput] = useState('{"status":"active","code":200,"service":"dirtynest"}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Hash state
  const [hashInput, setHashInput] = useState("");
  const [hashOutput, setHashOutput] = useState("");

  const copyToClipboard = (text: string, id: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore
    }
    setCopied(id);
    toast.success("COPIED TO CLIPBOARD");
    setTimeout(() => setCopied(null), 1500);
  };

  // Base64 handlers
  const handleEncodeB64 = () => {
    try {
      setB64Output(btoa(b64Input));
    } catch {
      setB64Output("Error: Failed to encode to Base64");
    }
  };

  const handleDecodeB64 = () => {
    try {
      setB64Output(atob(b64Input));
    } catch {
      setB64Output("Error: Invalid Base64 string");
    }
  };

  // UUID generator
  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          list.push(crypto.randomUUID());
        } else {
          list.push(
            "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            })
          );
        }
      } catch {
        list.push(Math.random().toString(36).substring(2, 15));
      }
    }
    setUuids(list);
  };

  // Epoch handler
  const handleConvertEpoch = () => {
    try {
      const num = parseInt(epochInput, 10);
      if (isNaN(num)) {
        setEpochResult("Invalid Epoch timestamp");
        return;
      }
      const ms = epochInput.length <= 10 ? num * 1000 : num;
      const date = new Date(ms);
      setEpochResult(
        `UTC: ${date.toUTCString()}\nLOCAL: ${date.toLocaleString()}\nISO: ${date.toISOString()}`
      );
    } catch {
      setEpochResult("Error parsing timestamp");
    }
  };

  // JSON Formatter handler
  const handleFormatJson = (minify = false) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON syntax");
    }
  };

  // Hash SHA-256 handler
  const handleHash = async () => {
    try {
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(hashInput);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setHashOutput(hashHex);
      } else {
        setHashOutput("Web Crypto API unavailable");
      }
    } catch {
      setHashOutput("Error generating hash");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#090B14] border-[#00F0FF]/30 text-[#F1F3F9] font-mono p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
              <Wrench size={16} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-[#F1F3F9] uppercase tracking-wider">
                Tactical Developer Utilities
              </DialogTitle>
              <p className="text-[10px] text-[#4F536E]">
                DIRTYNEST // RAPID CIPHER, UUID & SERIALIZER SUITE
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-black/40 px-3 h-10 gap-1">
            <TabsTrigger value="base64" className="text-xs data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
              <Binary size={13} className="mr-1.5" /> Base64
            </TabsTrigger>
            <TabsTrigger value="uuid" className="text-xs data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
              <Key size={13} className="mr-1.5" /> UUIDs
            </TabsTrigger>
            <TabsTrigger value="epoch" className="text-xs data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
              <Clock size={13} className="mr-1.5" /> Epoch
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
              <Code2 size={13} className="mr-1.5" /> JSON
            </TabsTrigger>
            <TabsTrigger value="hash" className="text-xs data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
              <Hash size={13} className="mr-1.5" /> SHA-256
            </TabsTrigger>
          </TabsList>

          <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
            {/* Base64 */}
            <TabsContent value="base64" className="space-y-3 mt-0">
              <Textarea
                value={b64Input}
                onChange={(e) => setB64Input(e.target.value)}
                placeholder="Plain text or Base64 string..."
                className="h-24 bg-[#07070B] border-white/10 text-xs text-[#F1F3F9]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleEncodeB64}
                  size="sm"
                  className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold"
                >
                  ENCODE BASE64
                </Button>
                <Button
                  onClick={handleDecodeB64}
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-[#9499B3]"
                >
                  DECODE BASE64
                </Button>
              </div>
              {b64Output && (
                <div className="relative mt-2">
                  <div className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#00FF41] break-all max-h-36 overflow-y-auto">
                    {b64Output}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(b64Output, "b64")}
                    className="absolute top-2 right-2 h-7 w-7 text-[#9499B3] hover:text-[#00FF41]"
                  >
                    {copied === "b64" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* UUID */}
            <TabsContent value="uuid" className="space-y-3 mt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9499B3]">GENERATE RFC4122 V4 UUIDs:</span>
                <Button
                  onClick={generateUuids}
                  size="sm"
                  className="gap-1.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 font-bold"
                >
                  <RefreshCw size={12} />
                  <span>REGENERATE</span>
                </Button>
              </div>

              <div className="space-y-1.5">
                {uuids.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-[#07070B] rounded-xl border border-white/5 group hover:border-[#00F0FF]/30 transition-all"
                  >
                    <span className="text-xs text-[#F1F3F9] font-mono select-all">{u}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(u, `uuid-${i}`)}
                      className="h-6 w-6 text-[#9499B3] hover:text-[#00F0FF]"
                    >
                      {copied === `uuid-${i}` ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Epoch */}
            <TabsContent value="epoch" className="space-y-3 mt-0">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={epochInput}
                  onChange={(e) => setEpochInput(e.target.value)}
                  placeholder="Unix timestamp in seconds or ms..."
                  className="flex-1 bg-[#07070B] text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEpochInput(Math.floor(Date.now() / 1000).toString())}
                  className="text-xs"
                >
                  NOW
                </Button>
                <Button
                  size="sm"
                  onClick={handleConvertEpoch}
                  className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold"
                >
                  CONVERT
                </Button>
              </div>

              {epochResult && (
                <pre className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#00F0FF] leading-relaxed">
                  {epochResult}
                </pre>
              )}
            </TabsContent>

            {/* JSON */}
            <TabsContent value="json" className="space-y-3 mt-0">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste raw JSON here..."
                className="h-44 bg-[#07070B] text-xs font-mono resize-none"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleFormatJson(false)}
                  className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold"
                >
                  PRETTIFY (2 SPACES)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFormatJson(true)}
                  className="text-xs"
                >
                  MINIFY
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(jsonInput, "json")}
                  className="ml-auto text-xs text-[#9499B3] hover:text-[#00FF41]"
                >
                  {copied === "json" ? <Check size={12} className="text-[#00FF41] mr-1" /> : <Copy size={12} className="mr-1" />}
                  <span>COPY JSON</span>
                </Button>
              </div>
              {jsonError && (
                <div className="p-2.5 rounded-lg bg-[#FF2A6D]/10 border border-[#FF2A6D]/30 text-xs font-mono text-[#FF2A6D]">
                  {jsonError}
                </div>
              )}
            </TabsContent>

            {/* SHA-256 */}
            <TabsContent value="hash" className="space-y-3 mt-0">
              <Input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="String to hash with SHA-256..."
                className="bg-[#07070B] text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleHash()}
              />
              <Button
                size="sm"
                onClick={handleHash}
                className="bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30 hover:bg-[#00FF41]/25 font-bold"
              >
                COMPUTE SHA-256
              </Button>
              {hashOutput && (
                <div className="relative mt-2">
                  <div className="p-3 bg-[#07070B] rounded-xl border border-white/10 text-xs font-mono text-[#BF40FF] break-all">
                    {hashOutput}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(hashOutput, "hash")}
                    className="absolute top-2 right-2 h-7 w-7 text-[#9499B3] hover:text-[#00FF41]"
                  >
                    {copied === "hash" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
