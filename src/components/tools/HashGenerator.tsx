"use client";

import { useState, useEffect, useCallback } from "react";
import { Hash, Copy, Check, RefreshCw, Binary, Fingerprint, Globe } from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

// Helper for crypto hashes using browser SubtleCrypto
async function generateHash(text: string, algorithm: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Simple MD5 implementation in pure JS
function simpleMD5(string: string): string {
  function RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue: number) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = ConvertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

function generateNanoid(size = 21): string {
  const chars = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIj";
  let id = "";
  const randomValues = new Uint8Array(size);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < size; i++) {
    id += chars[randomValues[i] % chars.length];
  }
  return id;
}

export default function HashGenerator() {
  const [input, setInput] = useState("DirtyNest-Operational-Command-2026");
  const [hashes, setHashes] = useState<{
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
    base64Encode: string;
    base64Decode: string;
    urlEncode: string;
    urlDecode: string;
  }>({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
    base64Encode: "",
    base64Decode: "",
    urlEncode: "",
    urlDecode: "",
  });

  const [uuids, setUuids] = useState<string[]>([]);
  const [nanoids, setNanoids] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const calculateHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes({
        md5: "",
        sha1: "",
        sha256: "",
        sha512: "",
        base64Encode: "",
        base64Decode: "",
        urlEncode: "",
        urlDecode: "",
      });
      return;
    }

    try {
      const sha256 = await generateHash(text, "SHA-256");
      const sha512 = await generateHash(text, "SHA-512");
      const sha1 = await generateHash(text, "SHA-1");
      const md5 = simpleMD5(text);

      let b64Enc = "";
      let b64Dec = "";
      try {
        b64Enc = btoa(unescape(encodeURIComponent(text)));
      } catch {}
      try {
        b64Dec = decodeURIComponent(escape(atob(text)));
      } catch {
        b64Dec = "(Invalid Base64)";
      }

      setHashes({
        md5,
        sha1,
        sha256,
        sha512,
        base64Encode: b64Enc,
        base64Decode: b64Dec,
        urlEncode: encodeURIComponent(text),
        urlDecode: decodeURIComponent(text),
      });
    } catch {}
  }, []);

  useEffect(() => {
    calculateHashes(input);
  }, [input, calculateHashes]);

  const generateNewIds = () => {
    cyberAudio.play("click");
    setUuids([crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()]);
    setNanoids([generateNanoid(), generateNanoid(), generateNanoid()]);
  };

  useEffect(() => {
    generateNewIds();
  }, []);

  const copyVal = (val: string, id: string) => {
    cyberAudio.play("click");
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5 font-mono">
      {/* Input Box */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-[#9499B3] uppercase tracking-wider font-bold">
          Source Text / Payload for Hash & Encoding
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type text to generate cryptographic hashes..."
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#00FF41] text-xs font-mono text-[#F1F3F9] outline-none transition-all placeholder:text-[#4F536E] selection:bg-[#00FF41]/20"
        />
      </div>

      {/* Crypto Hashes Section */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[10px] text-[#00FF41] uppercase tracking-wider font-bold flex items-center gap-1.5">
          <Hash size={13} />
          <span>CRYPTOGRAPHIC HASHES</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {[
            { id: "sha256", label: "SHA-256", val: hashes.sha256, color: "#00FF41" },
            { id: "sha512", label: "SHA-512", val: hashes.sha512, color: "#00F0FF" },
            { id: "sha1", label: "SHA-1", val: hashes.sha1, color: "#BF40FF" },
            { id: "md5", label: "MD5", val: hashes.md5, color: "#FFB800" },
          ].map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2 group hover:border-white/15 transition-all"
            >
              <span className="text-xs font-bold shrink-0 w-24" style={{ color: item.color }}>
                {item.label}
              </span>
              <span className="text-xs text-[#9499B3] break-all flex-1 font-mono select-all">
                {item.val || "—"}
              </span>
              <button
                onClick={() => copyVal(item.val, item.id)}
                disabled={!item.val}
                className="self-end md:self-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9499B3] hover:text-[#F1F3F9] transition-all cursor-pointer shrink-0"
                title="Copy Hash"
              >
                {copiedId === item.id ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Encodings: Base64 & URL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1.5">
              <Binary size={13} />
              BASE64 ENCODE
            </span>
            <button
              onClick={() => copyVal(hashes.base64Encode, "b64enc")}
              className="text-[#9499B3] hover:text-[#00F0FF] cursor-pointer"
            >
              {copiedId === "b64enc" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
            </button>
          </div>
          <p className="text-xs text-[#9499B3] break-all font-mono select-all">
            {hashes.base64Encode || "—"}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[11px] font-bold text-[#BF40FF] flex items-center gap-1.5">
              <Globe size={13} />
              URL ENCODE
            </span>
            <button
              onClick={() => copyVal(hashes.urlEncode, "urlenc")}
              className="text-[#9499B3] hover:text-[#BF40FF] cursor-pointer"
            >
              {copiedId === "urlenc" ? <Check size={13} className="text-[#00FF41]" /> : <Copy size={13} />}
            </button>
          </div>
          <p className="text-xs text-[#9499B3] break-all font-mono select-all">
            {hashes.urlEncode || "—"}
          </p>
        </div>
      </div>

      {/* UUID & NanoID Generator */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-[#00FF41] flex items-center gap-1.5">
            <Fingerprint size={14} />
            UNIQUE IDENTIFIERS (UUID v4 & NANOID)
          </span>
          <button
            onClick={generateNewIds}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white/[0.03] border border-white/10 hover:border-[#00FF41]/40 text-[#9499B3] hover:text-[#00FF41] transition-all cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>RE-GENERATE</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* UUIDs */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold">UUID v4</span>
            {uuids.map((id, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs text-[#00F0FF] group"
              >
                <span className="truncate select-all">{id}</span>
                <button
                  onClick={() => copyVal(id, `uuid-${idx}`)}
                  className="p-1 text-[#9499B3] hover:text-[#00F0FF] cursor-pointer"
                >
                  {copiedId === `uuid-${idx}` ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>

          {/* NanoIDs */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-[#9499B3] uppercase font-bold">NanoID (21 Chars)</span>
            {nanoids.map((id, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs text-[#BF40FF] group"
              >
                <span className="truncate select-all">{id}</span>
                <button
                  onClick={() => copyVal(id, `nano-${idx}`)}
                  className="p-1 text-[#9499B3] hover:text-[#BF40FF] cursor-pointer"
                >
                  {copiedId === `nano-${idx}` ? <Check size={12} className="text-[#00FF41]" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
