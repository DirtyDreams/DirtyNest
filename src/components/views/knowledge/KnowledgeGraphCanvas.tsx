"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Network,
  Search,
  SlidersHorizontal,
  Play,
  Pause,
  Compass,
  X,
  ArrowUpRight,
  Orbit,
  Layers,
  Box,
  Circle,
  Eye,
  Sliders,
  Globe,
  Radio,
  Share2,
  Tag,
  Shield,
  Zap,
  Filter,
  EyeOff,
  Focus,
} from "lucide-react";
import { cyberAudio } from "@/lib/cyberAudio";

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  color: string;
  radius: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  links: string[];
  tags?: string[];
  slug?: string;
  tokens?: number;
  obsidianPath?: string;
  embeddingSnippet?: number[];
  isKarpathySkill?: boolean;
}

export type ConstellationPreset = "LIVE_VAULT" | "KARPATHY_TREE" | "CYBER_DEFENSE" | "MEGA_CORTEX";
export type LabelLodMode = "ADAPTIVE" | "HUBS" | "FOCUS" | "ALL";

// Sector Definition Interface
interface SectorDef {
  id: string;
  name: string;
  center: THREE.Vector3;
  color: string;
  radius: number;
  categories: string[];
}

const SECTORS: SectorDef[] = [
  {
    id: "sec-01",
    name: "SECTOR ALPHA // KARPATHY AI NEURAL CORE",
    center: new THREE.Vector3(-180, 80, -40),
    color: "#FFB800",
    radius: 110,
    categories: ["Karpathy Skills"],
  },
  {
    id: "sec-02",
    name: "SECTOR BETA // ZERO-TRUST THREAT RADAR",
    center: new THREE.Vector3(180, 90, 40),
    color: "#FF2A6D",
    radius: 115,
    categories: ["Threat Intel", "System Arch"],
  },
  {
    id: "sec-03",
    name: "SECTOR GAMMA // AUTONOMOUS SWARM ORCHESTRATOR",
    center: new THREE.Vector3(0, -150, 110),
    color: "#00F0FF",
    radius: 120,
    categories: ["Neural Memory", "API Contracts"],
  },
  {
    id: "sec-04",
    name: "SECTOR DELTA // OBSIDIAN VAULT & VECTOR CORE",
    center: new THREE.Vector3(-140, -100, -130),
    color: "#3B82F6",
    radius: 110,
    categories: ["Obsidian Wiki"],
  },
  {
    id: "sec-05",
    name: "SECTOR EPSILON // SRE INFRASTRUCTURE & RUNBOOKS",
    center: new THREE.Vector3(150, -110, -110),
    color: "#BF40FF",
    radius: 115,
    categories: ["Code Runbooks"],
  },
];

// Mega 60+ Node Demo Dataset for Mega Neural Cortex
const MEGA_CORTEX_NODES: GraphNode[] = [
  // Sector Alpha: Karpathy Core (Gold)
  { id: "mc-01", title: "NanoGPT KV-Cache Optimization", category: "Karpathy Skills", color: "#FFB800", radius: 15, links: ["mc-02", "mc-03", "mc-04", "mc-10"], isKarpathySkill: true },
  { id: "mc-02", title: "BPE Tokenizer from Scratch", category: "Karpathy Skills", color: "#FFB800", radius: 12, links: ["mc-01", "mc-03", "mc-05"], isKarpathySkill: true },
  { id: "mc-03", title: "Autoresearch Autonomous Loop", category: "Karpathy Skills", color: "#FFB800", radius: 16, links: ["mc-01", "mc-02", "mc-04", "mc-06", "mc-21"], isKarpathySkill: true },
  { id: "mc-04", title: "LLM-OS Kernel Architecture", category: "Karpathy Skills", color: "#FFB800", radius: 18, links: ["mc-01", "mc-03", "mc-05", "mc-07", "mc-30"], isKarpathySkill: true },
  { id: "mc-05", title: "Micrograd Computational Graph", category: "Karpathy Skills", color: "#FFB800", radius: 11, links: ["mc-02", "mc-04", "mc-08"], isKarpathySkill: true },
  { id: "mc-06", title: "RLHF PPO Reward Modeling", category: "Karpathy Skills", color: "#FFB800", radius: 13, links: ["mc-03", "mc-07", "mc-09"], isKarpathySkill: true },
  { id: "mc-07", title: "Direct Preference Optimization (DPO)", category: "Karpathy Skills", color: "#FFB800", radius: 12, links: ["mc-04", "mc-06", "mc-08"], isKarpathySkill: true },
  { id: "mc-08", title: "RoPE Rotational Positional Embedding", category: "Karpathy Skills", color: "#FFB800", radius: 10, links: ["mc-05", "mc-07", "mc-09"], isKarpathySkill: true },
  { id: "mc-09", title: "FlashAttention-3 Kernel Fusion", category: "Karpathy Skills", color: "#FFB800", radius: 14, links: ["mc-06", "mc-08", "mc-10", "mc-40"], isKarpathySkill: true },
  { id: "mc-10", title: "Mixture-of-Experts (MoE) Routing", category: "Karpathy Skills", color: "#FFB800", radius: 15, links: ["mc-01", "mc-09", "mc-50"], isKarpathySkill: true },

  // Sector Beta: Cyber Defense (Crimson / Green)
  { id: "mc-11", title: "Zero-Trust eBPF Kernel Filter", category: "System Arch", color: "#00FF41", radius: 16, links: ["mc-12", "mc-13", "mc-14", "mc-04"] },
  { id: "mc-12", title: "WireGuard Flat Overlay Mesh", category: "System Arch", color: "#00FF41", radius: 12, links: ["mc-11", "mc-13", "mc-15"] },
  { id: "mc-13", title: "mTLS Ephemeral Token Gateways", category: "System Arch", color: "#00FF41", radius: 13, links: ["mc-11", "mc-12", "mc-16"] },
  { id: "mc-14", title: "CVE-2026-9811 Threat Mitigation", category: "Threat Intel", color: "#FF2A6D", radius: 15, links: ["mc-11", "mc-15", "mc-17"] },
  { id: "mc-15", title: "Autonomous Red-Team Recon Daemon", category: "Threat Intel", color: "#FF2A6D", radius: 14, links: ["mc-12", "mc-14", "mc-18"] },
  { id: "mc-16", title: "Hardware Security Module (HSM) Vault", category: "Threat Intel", color: "#FF2A6D", radius: 11, links: ["mc-13", "mc-17", "mc-19"] },
  { id: "mc-17", title: "BGP Anycast DDoS Deflector", category: "Threat Intel", color: "#FF2A6D", radius: 13, links: ["mc-14", "mc-16", "mc-18"] },
  { id: "mc-18", title: "MITRE ATT&CK Matrix Sentinel", category: "Threat Intel", color: "#FF2A6D", radius: 16, links: ["mc-15", "mc-17", "mc-19", "mc-21"] },
  { id: "mc-19", title: "Memory Safety Sanitizer Hook", category: "System Arch", color: "#00FF41", radius: 10, links: ["mc-16", "mc-18"] },
  { id: "mc-20", title: "Sandboxed WebAssembly Worker Pool", category: "System Arch", color: "#00FF41", radius: 14, links: ["mc-03", "mc-18", "mc-22"] },

  // Sector Gamma: Autonomous Swarm & Hermes Brain (Cyan / Purple)
  { id: "mc-21", title: "Hermes Master Brain Orchestrator", category: "Neural Memory", color: "#00F0FF", radius: 22, links: ["mc-20", "mc-22", "mc-23", "mc-24", "mc-04", "mc-50"] },
  { id: "mc-22", title: "Swarm DAG Directed Acyclic Pipeline", category: "API Contracts", color: "#00F0FF", radius: 15, links: ["mc-21", "mc-23", "mc-25"] },
  { id: "mc-23", title: "Paperclip Company CEO Control Plane", category: "API Contracts", color: "#00F0FF", radius: 17, links: ["mc-21", "mc-22", "mc-26"] },
  { id: "mc-24", title: "HITL Dynamic Clearance Gate", category: "API Contracts", color: "#00F0FF", radius: 13, links: ["mc-21", "mc-25", "mc-27"] },
  { id: "mc-25", title: "JSON-RPC 2.0 Binary WebSocket IPC", category: "API Contracts", color: "#00F0FF", radius: 12, links: ["mc-22", "mc-24", "mc-28"] },
  { id: "mc-26", title: "Multi-Agent Consensus Raft Engine", category: "API Contracts", color: "#00F0FF", radius: 14, links: ["mc-23", "mc-27", "mc-29"] },
  { id: "mc-27", title: "Autonomous Token Budget Governor", category: "Neural Memory", color: "#00F0FF", radius: 11, links: ["mc-24", "mc-26", "mc-28"] },
  { id: "mc-28", title: "Tool-Call Clearance Sandbox", category: "Neural Memory", color: "#00F0FF", radius: 13, links: ["mc-25", "mc-27", "mc-29"] },
  { id: "mc-29", title: "Agent Memory Hierarchical Summarizer", category: "Neural Memory", color: "#00F0FF", radius: 15, links: ["mc-26", "mc-28", "mc-30"] },
  { id: "mc-30", title: "Long-Term Episodic Vector Buffer", category: "Neural Memory", color: "#00F0FF", radius: 18, links: ["mc-04", "mc-29", "mc-31"] },

  // Sector Delta: Obsidian Vault & Knowledge Engineering (Blue)
  { id: "mc-31", title: "SQLite-Vec High-D Embeddings Core", category: "Obsidian Wiki", color: "#3B82F6", radius: 16, links: ["mc-30", "mc-32", "mc-33", "mc-34"] },
  { id: "mc-32", title: "Bi-Directional [[WikiLink]] Graph", category: "Obsidian Wiki", color: "#3B82F6", radius: 14, links: ["mc-31", "mc-33", "mc-35"] },
  { id: "mc-33", title: "YAML Frontmatter Schema Validator", category: "Obsidian Wiki", color: "#3B82F6", radius: 11, links: ["mc-31", "mc-32", "mc-36"] },
  { id: "mc-34", title: "Local Chokidar Vault File Watcher", category: "Obsidian Wiki", color: "#3B82F6", radius: 13, links: ["mc-31", "mc-35", "mc-37"] },
  { id: "mc-35", title: "Semantic RAG Probe & Cosine Ranker", category: "Obsidian Wiki", color: "#3B82F6", radius: 15, links: ["mc-32", "mc-34", "mc-38"] },
  { id: "mc-36", title: "Markdown AST MathJax & KaTeX Parser", category: "Obsidian Wiki", color: "#3B82F6", radius: 10, links: ["mc-33", "mc-37", "mc-39"] },
  { id: "mc-37", title: "Hierarchical Obsidian Folder Tree", category: "Obsidian Wiki", color: "#3B82F6", radius: 12, links: ["mc-34", "mc-36", "mc-40"] },
  { id: "mc-38", title: "Vector Cluster Projection (UMAP/t-SNE)", category: "Obsidian Wiki", color: "#3B82F6", radius: 13, links: ["mc-35", "mc-39"] },
  { id: "mc-39", title: "Cross-Vault Deduplication Index", category: "Obsidian Wiki", color: "#3B82F6", radius: 11, links: ["mc-36", "mc-38"] },
  { id: "mc-40", title: "Karpathy Recipe Execution Harness", category: "Obsidian Wiki", color: "#3B82F6", radius: 17, links: ["mc-09", "mc-37", "mc-41"] },

  // Sector Epsilon: Dev Runbooks & Infrastructure SRE (Purple / Magenta)
  { id: "mc-41", title: "Kubernetes Canary Rollback Circuit", category: "Code Runbooks", color: "#BF40FF", radius: 15, links: ["mc-40", "mc-42", "mc-43", "mc-44"] },
  { id: "mc-42", title: "Docker Compose Microservice Stack", category: "Code Runbooks", color: "#BF40FF", radius: 13, links: ["mc-41", "mc-43", "mc-45"] },
  { id: "mc-43", title: "PostgreSQL pgvector Index Optimizer", category: "Code Runbooks", color: "#BF40FF", radius: 14, links: ["mc-41", "mc-42", "mc-46"] },
  { id: "mc-44", title: "Prometheus P99 Latency Alerter", category: "Code Runbooks", color: "#BF40FF", radius: 12, links: ["mc-41", "mc-45", "mc-47"] },
  { id: "mc-45", title: "Turbopack Hot Module Replacer", category: "Code Runbooks", color: "#BF40FF", radius: 11, links: ["mc-42", "mc-44", "mc-48"] },
  { id: "mc-46", title: "Web Audio Synthesizer Oscillators", category: "Code Runbooks", color: "#BF40FF", radius: 13, links: ["mc-43", "mc-47", "mc-49"] },
  { id: "mc-47", title: "Web Speech Viseme Facial Animator", category: "Code Runbooks", color: "#BF40FF", radius: 14, links: ["mc-44", "mc-46", "mc-50"] },
  { id: "mc-48", title: "DiffViewer Syntax Highlighting Core", category: "Code Runbooks", color: "#BF40FF", radius: 10, links: ["mc-45", "mc-49"] },
  { id: "mc-49", title: "JWT Cryptographic Signature Verifier", category: "Code Runbooks", color: "#BF40FF", radius: 12, links: ["mc-46", "mc-48"] },
  { id: "mc-50", title: "DirtyNest Tactical Command Center", category: "Code Runbooks", color: "#BF40FF", radius: 24, links: ["mc-10", "mc-47", "mc-21", "mc-04", "mc-31"] },
];

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string, switchToEditor?: boolean) => void;
  onOpenVaultEditor?: (id: string) => void;
}

export default function KnowledgeGraphCanvas({
  nodes: initialNodes,
  selectedNodeId,
  onSelectNode,
  onOpenVaultEditor,
}: KnowledgeGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  // High-Level Configuration
  const [preset, setPreset] = useState<ConstellationPreset>("LIVE_VAULT");
  const [lodMode, setLodMode] = useState<LabelLodMode>("ADAPTIVE");
  const [showSectorHalos, setShowSectorHalos] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Visual Tuning State
  const [tuning, setTuning] = useState({
    autoRotateSpeed: 0.7,
    starfieldDensity: 2400,
    laserBrightness: 1.2,
    particleSpeed: 1.1,
    haloOpacity: 0.12,
  });

  // Current Active Nodes based on Preset
  const activeDataset: GraphNode[] = useMemo(() => {
    if (preset === "MEGA_CORTEX") return MEGA_CORTEX_NODES;
    if (preset === "KARPATHY_TREE")
      return initialNodes.filter((n) => n.category === "Karpathy Skills" || n.isKarpathySkill);
    if (preset === "CYBER_DEFENSE")
      return initialNodes.filter((n) => n.category === "Threat Intel" || n.category === "System Arch");
    return initialNodes;
  }, [preset, initialNodes]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeObjectsRef = useRef<{
    id: string;
    mesh: THREE.Group;
    sphere: THREE.Mesh;
    ring: THREE.Line;
    sprite: THREE.Sprite;
    radius: number;
    links: string[];
  }[]>([]);
  const sectorHalosRef = useRef<THREE.Group[]>([]);
  const lineMeshRef = useRef<THREE.LineSegments | null>(null);
  const activeLineMeshRef = useRef<THREE.LineSegments | null>(null);
  const particlesSystemRef = useRef<THREE.Points | null>(null);
  const starfieldRef = useRef<THREE.Points | null>(null);

  // Camera Orbit State
  const orbitState = useRef({
    isMouseDown: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotX: 0.25,
    rotY: 0.45,
    distance: 520,
    targetDistance: 520,
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
  });

  // Ref tracking current active selection for 60FPS loop
  const activeSelectionRef = useRef<{ selectedId: string | null; hoveredId: string | null }>({
    selectedId: selectedNodeId,
    hoveredId: hoveredNodeId,
  });

  useEffect(() => {
    activeSelectionRef.current = { selectedId: selectedNodeId, hoveredId: hoveredNodeId };
  }, [selectedNodeId, hoveredNodeId]);

  // --- THREE.JS INITIALIZATION ---
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 900;
    const height = mount.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020306, 0.0006);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 1, 4000);
    camera.position.set(0, 60, 520);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 2.8, 1200);
    cyanPoint.position.set(250, 350, 250);
    scene.add(cyanPoint);

    const greenPoint = new THREE.PointLight(0x00ff41, 2.2, 1200);
    greenPoint.position.set(-250, -250, -250);
    scene.add(greenPoint);

    const purplePoint = new THREE.PointLight(0xbf40ff, 2.4, 1200);
    purplePoint.position.set(0, -350, 350);
    scene.add(purplePoint);

    // 5. Deep Space Cyber Nebula Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0x00ff41),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xbf40ff),
      new THREE.Color(0xffb800),
      new THREE.Color(0xff2a6d),
      new THREE.Color(0x3b82f6),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 350 + Math.random() * 1400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
    starfieldRef.current = starfield;

    // Resize Handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // --- HELPER: CREATE HIGH-DPI BILLBOARD SPRITE TEXTURE ---
  const createTextSprite = (text: string, colorHex: string, category: string, isHub: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Sprite();

    // Background pill with cyberpunk glow border
    ctx.fillStyle = "rgba(4, 6, 12, 0.92)";
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = isHub ? 4 : 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 124, 16);
    ctx.fill();
    ctx.stroke();

    // Category Tag
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = colorHex;
    ctx.fillText(`[ ${category.toUpperCase()} ]`, 28, 40);

    // Main Title (Smart wrapping)
    ctx.font = "bold 25px monospace";
    ctx.fillStyle = "#FFFFFF";
    const words = text.split(" ");
    let line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    let line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

    if (words.length <= 2 || text.length < 20) {
      line1 = text;
      line2 = "";
    }

    ctx.fillText(line1, 28, 78);
    if (line2) {
      ctx.fillText(line2.length > 26 ? line2.slice(0, 24) + "..." : line2, 28, 112);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(36, 9.8, 1);
    return sprite;
  };

  // --- POPULATE 3D SECTORS, NODES & SYNAPSE LASERS ---
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean previous objects
    nodeObjectsRef.current.forEach((obj) => scene.remove(obj.mesh));
    nodeObjectsRef.current = [];
    sectorHalosRef.current.forEach((g) => scene.remove(g));
    sectorHalosRef.current = [];
    if (lineMeshRef.current) scene.remove(lineMeshRef.current);
    if (activeLineMeshRef.current) scene.remove(activeLineMeshRef.current);
    if (particlesSystemRef.current) scene.remove(particlesSystemRef.current);

    const nodes = activeDataset;

    // 1. Position Nodes Harmoniously grouped by category cluster
    const nodePositions: { [id: string]: THREE.Vector3 } = {};
    const nodeColorMap: { [id: string]: THREE.Color } = {};

    // Group nodes by matching sector
    const sectorBuckets: { [secId: string]: GraphNode[] } = {};
    SECTORS.forEach((s) => (sectorBuckets[s.id] = []));

    nodes.forEach((n) => {
      let matchedSec = SECTORS.find((s) => s.categories.includes(n.category));
      if (!matchedSec) matchedSec = SECTORS[0];
      sectorBuckets[matchedSec.id].push(n);
    });

    SECTORS.forEach((sec) => {
      const bucket = sectorBuckets[sec.id];
      const count = bucket.length;
      if (count === 0) return;

      bucket.forEach((n, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const innerRadius = Math.min(sec.radius * 0.72, 35 + Math.sqrt(i) * 26);

        const localPos = new THREE.Vector3(
          innerRadius * Math.sin(phi) * Math.cos(theta),
          innerRadius * Math.sin(phi) * Math.sin(theta) * 0.85,
          innerRadius * Math.cos(phi)
        );

        const worldPos = new THREE.Vector3().copy(sec.center).add(localPos);
        nodePositions[n.id] = worldPos;
        nodeColorMap[n.id] = new THREE.Color(n.color);

        // Build Hologram Node
        const nodeGroup = new THREE.Group();
        nodeGroup.position.copy(worldPos);

        const baseRadius = Math.max(5, (n.radius || 10) * 0.45);
        const isHub = (n.links && n.links.length >= 3) || n.radius > 14;

        // Core Sphere
        const sphereGeo = new THREE.SphereGeometry(baseRadius, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: n.color,
          emissive: n.color,
          emissiveIntensity: 1.3,
          roughness: 0.2,
          metalness: 0.8,
          transparent: true,
          opacity: 1.0,
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        nodeGroup.add(sphereMesh);

        // Gyroscopic Ring
        const ringRadius = baseRadius * 1.7;
        const ringGeo = new THREE.BufferGeometry();
        const ringPts: THREE.Vector3[] = [];
        for (let j = 0; j <= 36; j++) {
          const a = (j / 36) * Math.PI * 2;
          ringPts.push(new THREE.Vector3(Math.cos(a) * ringRadius, Math.sin(a) * ringRadius, 0));
        }
        ringGeo.setFromPoints(ringPts);
        const ringMat = new THREE.LineBasicMaterial({
          color: n.color,
          transparent: true,
          opacity: 0.5,
        });
        const ringLine = new THREE.Line(ringGeo, ringMat);
        ringLine.rotation.x = Math.random() * Math.PI;
        ringLine.rotation.y = Math.random() * Math.PI;
        nodeGroup.add(ringLine);

        // 3D Billboard Sprite Label
        const sprite = createTextSprite(n.title, n.color, n.category, isHub);
        sprite.position.set(0, baseRadius + 8.5, 0);
        nodeGroup.add(sprite);

        scene.add(nodeGroup);

        nodeObjectsRef.current.push({
          id: n.id,
          mesh: nodeGroup,
          sphere: sphereMesh,
          ring: ringLine,
          sprite,
          radius: baseRadius,
          links: n.links || [],
        });
      });
    });

    // 3. Build 3D Laser Synapse Mesh
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const photonTraversals: { p1: THREE.Vector3; p2: THREE.Vector3; color: THREE.Color; progress: number; speed: number; srcId: string; tgtId: string }[] = [];

    nodes.forEach((src) => {
      const p1 = nodePositions[src.id];
      if (!p1) return;
      const srcCol = nodeColorMap[src.id];

      src.links.forEach((tgtId) => {
        const p2 = nodePositions[tgtId];
        if (!p2) return;
        const tgtCol = nodeColorMap[tgtId] || srcCol;

        linePositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        lineColors.push(srcCol.r, srcCol.g, srcCol.b, tgtCol.r, tgtCol.g, tgtCol.b);

        photonTraversals.push({
          srcId: src.id,
          tgtId: tgtId,
          p1,
          p2,
          color: srcCol,
          progress: Math.random(),
          speed: 0.0035 + Math.random() * 0.006,
        });
      });
    });

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);
    lineMeshRef.current = lineSegments;

    // 4. Build 3D Travelling Photons
    const photonCount = photonTraversals.length;
    const photonGeo = new THREE.BufferGeometry();
    const photonPositions = new Float32Array(photonCount * 3);
    const photonColors = new Float32Array(photonCount * 3);

    photonTraversals.forEach((pt, i) => {
      photonColors[i * 3] = pt.color.r;
      photonColors[i * 3 + 1] = pt.color.g;
      photonColors[i * 3 + 2] = pt.color.b;
    });

    photonGeo.setAttribute("position", new THREE.BufferAttribute(photonPositions, 3));
    photonGeo.setAttribute("color", new THREE.BufferAttribute(photonColors, 3));

    const photonMat = new THREE.PointsMaterial({
      size: 4.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    const photons = new THREE.Points(photonGeo, photonMat);
    (photons as any).traversals = photonTraversals;
    scene.add(photons);
    particlesSystemRef.current = photons;
  }, [activeDataset, tuning.haloOpacity]);

  // --- 60FPS ANIMATION LOOP & DYNAMIC LOD/FOCUS SOLVER ---
  useEffect(() => {
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      if (!scene || !camera || !renderer) return;

      const orbit = orbitState.current;
      const { selectedId, hoveredId } = activeSelectionRef.current;
      const activeId = hoveredId || selectedId;

      // 1. Auto-rotation
      if (isAutoRotating && !orbit.isMouseDown) {
        orbit.rotY += 0.0018 * tuning.autoRotateSpeed;
      }

      // 2. Camera Interpolation
      orbit.distance += (orbit.targetDistance - orbit.distance) * 0.1;
      orbit.currentLookAt.lerp(orbit.targetLookAt, 0.08);

      camera.position.x =
        orbit.currentLookAt.x + orbit.distance * Math.sin(orbit.rotY) * Math.cos(orbit.rotX);
      camera.position.y = orbit.currentLookAt.y + orbit.distance * Math.sin(orbit.rotX);
      camera.position.z =
        orbit.currentLookAt.z + orbit.distance * Math.cos(orbit.rotY) * Math.cos(orbit.rotX);
      camera.lookAt(orbit.currentLookAt);

      // 3. Determine Active Focus Neighborhood Set
      const activeNodeObj = nodeObjectsRef.current.find((n) => n.id === activeId);
      const neighborSet = new Set<string>();
      if (activeNodeObj) {
        neighborSet.add(activeNodeObj.id);
        activeNodeObj.links.forEach((id) => neighborSet.add(id));
      }

      // 5. Update Nodes, Gyroscopic Rings & Label LOD Density
      nodeObjectsRef.current.forEach((obj) => {
        obj.ring.rotation.x += 0.018;
        obj.ring.rotation.y += 0.014;

        const isSelected = selectedId === obj.id;
        const isHovered = hoveredId === obj.id;
        const isNeighbor = neighborSet.has(obj.id);
        const isDimmed = activeId && !isNeighbor;

        // Node Opacity & Emissive in Focus Mode
        const sphereMat = obj.sphere.material as THREE.MeshStandardMaterial;
        if (sphereMat) {
          if (isSelected || isHovered) {
            sphereMat.opacity = 1.0;
            sphereMat.emissiveIntensity = 2.6;
            const s = 1.0 + Math.sin(Date.now() * 0.007) * 0.2;
            obj.mesh.scale.set(s, s, s);
          } else if (isNeighbor) {
            sphereMat.opacity = 0.95;
            sphereMat.emissiveIntensity = 1.8;
            obj.mesh.scale.set(1.08, 1.08, 1.08);
          } else if (isDimmed) {
            sphereMat.opacity = 0.12;
            sphereMat.emissiveIntensity = 0.3;
            obj.mesh.scale.set(0.85, 0.85, 0.85);
          } else {
            sphereMat.opacity = 1.0;
            sphereMat.emissiveIntensity = 1.3;
            obj.mesh.scale.set(1.0, 1.0, 1.0);
          }
        }

        // 3D Billboard Label Visibility based on LOD Mode
        const spriteMat = obj.sprite.material as THREE.SpriteMaterial;
        if (spriteMat) {
          if (isDimmed) {
            spriteMat.opacity = 0.0;
          } else if (isSelected || isHovered) {
            spriteMat.opacity = 1.0;
          } else if (lodMode === "FOCUS") {
            spriteMat.opacity = isNeighbor ? 0.9 : 0.0;
          } else if (lodMode === "HUBS") {
            const isHub = obj.links.length >= 3 || obj.radius > 6;
            spriteMat.opacity = isHub || isNeighbor ? 0.85 : 0.0;
          } else if (lodMode === "ADAPTIVE") {
            const distToCam = camera.position.distanceTo(obj.mesh.position);
            const targetAlpha = THREE.MathUtils.clamp(1.0 - (distToCam - 200) / 450, 0.05, 0.95);
            spriteMat.opacity = isNeighbor ? 1.0 : targetAlpha;
          } else {
            // ALL
            spriteMat.opacity = 0.9;
          }
        }
      });

      // 6. Update Travelling 3D Photons
      if (particlesSystemRef.current) {
        const traversals = (particlesSystemRef.current as any).traversals;
        const posAttr = particlesSystemRef.current.geometry.attributes.position as THREE.BufferAttribute;
        if (traversals && posAttr) {
          traversals.forEach((pt: any, i: number) => {
            const isConnectedToActive = activeId && (pt.srcId === activeId || pt.tgtId === activeId);
            const speedMultiplier = isConnectedToActive ? 2.2 : 1.0;

            pt.progress += pt.speed * tuning.particleSpeed * speedMultiplier;
            if (pt.progress >= 1) pt.progress = 0;

            const x = pt.p1.x + (pt.p2.x - pt.p1.x) * pt.progress;
            const y = pt.p1.y + (pt.p2.y - pt.p1.y) * pt.progress;
            const z = pt.p1.z + (pt.p2.z - pt.p1.z) * pt.progress;

            posAttr.setXYZ(i, x, y, z);
          });
          posAttr.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating, tuning, lodMode, showSectorHalos]);

  // --- MOUSE ORBIT CONTROLS & RAYCASTING ---
  const handleMouseDown = (e: React.MouseEvent) => {
    orbitState.current.isMouseDown = true;
    orbitState.current.prevMouseX = e.clientX;
    orbitState.current.prevMouseY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const orbit = orbitState.current;
    if (orbit.isMouseDown) {
      const dx = e.clientX - orbit.prevMouseX;
      const dy = e.clientY - orbit.prevMouseY;

      orbit.rotY -= dx * 0.0055;
      orbit.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, orbit.rotX + dy * 0.0055));

      orbit.prevMouseX = e.clientX;
      orbit.prevMouseY = e.clientY;
    }

    // Raycast hover detection
    const mount = mountRef.current;
    const camera = cameraRef.current;
    if (!mount || !camera) return;

    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const meshes = nodeObjectsRef.current.map((n) => n.sphere);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = nodeObjectsRef.current.find((n) => n.sphere === intersects[0].object);
      if (hit) setHoveredNodeId(hit.id);
    } else {
      setHoveredNodeId(null);
    }
  };

  const handleMouseUp = () => {
    orbitState.current.isMouseDown = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    orbitState.current.targetDistance = Math.max(
      100,
      Math.min(1200, orbitState.current.targetDistance + e.deltaY * 0.65)
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    if (!mount || !camera) return;

    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const meshes = nodeObjectsRef.current.map((n) => n.sphere);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = nodeObjectsRef.current.find((n) => n.sphere === intersects[0].object);
      if (hit) {
        cyberAudio.play("click");
        onSelectNode(hit.id, false);

        // Camera Fly-To target
        orbitState.current.targetLookAt.copy(hit.mesh.position);
        orbitState.current.targetDistance = 220;
      }
    }
  };

  // Fly-To Search Match in 3D
  const handleSearchFlyTo = (nodeId: string) => {
    const targetObj = nodeObjectsRef.current.find((n) => n.id === nodeId);
    if (targetObj) {
      cyberAudio.play("click");
      onSelectNode(nodeId, false);
      orbitState.current.targetLookAt.copy(targetObj.mesh.position);
      orbitState.current.targetDistance = 200;
    }
  };

  const handleResetCamera = () => {
    cyberAudio.play("click");
    orbitState.current.rotX = 0.25;
    orbitState.current.rotY = 0.45;
    orbitState.current.targetDistance = 520;
    orbitState.current.targetLookAt.set(0, 0, 0);
  };

  // Active Selected Node & Neighbors
  const activeSelectedNode = useMemo(() => {
    const id = selectedNodeId || hoveredNodeId;
    return activeDataset.find((n) => n.id === id);
  }, [selectedNodeId, hoveredNodeId, activeDataset]);

  const activeNeighbors = useMemo(() => {
    if (!activeSelectedNode) return [];
    return activeDataset.filter((n) => activeSelectedNode.links.includes(n.id));
  }, [activeSelectedNode, activeDataset]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl bg-[#020306] border border-emerald-500/20 overflow-hidden font-mono select-none shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[640px]"
      }`}
    >
      {/* TOP HUD BAR */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Universe Title & Preset Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs shadow-xl">
            <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "16s" }} />
            <span className="font-bold text-emerald-400 tracking-wider">3D KNOWLEDGE UNIVERSE</span>
            <span className="text-[10px] text-cyan-300">
              ({activeDataset.length} nodes • {SECTORS.length} sectors)
            </span>
          </div>

          {/* Constellation Presets */}
          <div className="hidden lg:flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px]">
            <button
              onClick={() => {
                cyberAudio.play("click");
                setPreset("LIVE_VAULT");
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                preset === "LIVE_VAULT"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vault (Live)
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setPreset("KARPATHY_TREE");
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                preset === "KARPATHY_TREE"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(255,184,0,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Karpathy Skills
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setPreset("CYBER_DEFENSE");
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                preset === "CYBER_DEFENSE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_8px_rgba(255,42,109,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cyber Defense
            </button>
            <button
              onClick={() => {
                cyberAudio.play("click");
                setPreset("MEGA_CORTEX");
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                preset === "MEGA_CORTEX"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  : "text-cyan-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Mega Cortex (60+)</span>
            </button>
          </div>
        </div>

        {/* Center: Search & 3D Fly-To */}
        <div className="relative pointer-events-auto min-w-[200px] max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 3D nodes..."
            className="w-full pl-8 pr-7 py-1.5 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {searchQuery && (
            <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto bg-black/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-1.5 shadow-2xl z-30 space-y-1">
              {activeDataset
                .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((match) => (
                  <button
                    key={match.id}
                    onClick={() => handleSearchFlyTo(match.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-cyan-500/20 text-xs flex items-center justify-between text-slate-200 hover:text-cyan-300 transition-colors"
                  >
                    <span className="truncate max-w-[180px]">{match.title}</span>
                    <span className="text-[10px] text-slate-400">{match.category}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Right: Label LOD Selector & Camera Controls */}
        <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs pointer-events-auto shadow-xl">
          {/* Label LOD Switcher */}
          <div className="hidden sm:flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-0.5">
            <span className="text-[10px] text-slate-400 px-1">LOD:</span>
            {(["FOCUS", "HUBS", "ADAPTIVE", "ALL"] as LabelLodMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  cyberAudio.play("click");
                  setLodMode(mode);
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  lodMode === mode
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsAutoRotating((r) => !r);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isAutoRotating
                ? "bg-emerald-500/20 text-emerald-400"
                : "hover:bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title={isAutoRotating ? "Pause 360° Auto-Rotation" : "Start 360° Auto-Rotation"}
          >
            <Orbit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              orbitState.current.targetDistance = Math.max(120, orbitState.current.targetDistance - 80);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom In 3D"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              orbitState.current.targetDistance = Math.min(1100, orbitState.current.targetDistance + 80);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out 3D"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Reset 3D Camera & Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setShowSettingsDrawer((s) => !s);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              showSettingsDrawer
                ? "bg-cyan-500/20 text-cyan-400"
                : "hover:bg-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Visual & Readability Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              cyberAudio.play("click");
              setIsFullscreen((f) => !f);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Universe"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D VISUAL SETTINGS DRAWER */}
      {showSettingsDrawer && (
        <div className="absolute top-14 right-3 z-30 w-72 bg-black/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 text-xs font-mono text-slate-200 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              READABILITY & VFX SUITE
            </span>
            <button onClick={() => setShowSettingsDrawer(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>360° Orbit Speed</span>
                <span className="text-cyan-300">{tuning.autoRotateSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.2"
                value={tuning.autoRotateSpeed}
                onChange={(e) => setTuning((t) => ({ ...t, autoRotateSpeed: Number(e.target.value) }))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Photon Flow Velocity</span>
                <span className="text-cyan-300">{tuning.particleSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.2"
                value={tuning.particleSpeed}
                onChange={(e) => setTuning((t) => ({ ...t, particleSpeed: Number(e.target.value) }))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE NODE INSPECTION DOSSIER (3D HUD) */}
      {activeSelectedNode && (
        <div className="absolute bottom-3 left-3 z-20 max-w-sm w-full bg-black/95 backdrop-blur-xl p-4 rounded-2xl border border-cyan-500/40 text-xs text-white shadow-2xl pointer-events-auto animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px]"
                  style={{ backgroundColor: activeSelectedNode.color }}
                />
                <span className="font-bold text-cyan-300 text-sm leading-tight">
                  {activeSelectedNode.title}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {activeSelectedNode.category}
                </span>
                <span className="text-emerald-400 font-bold">
                  {activeSelectedNode.links.length} Connected Synapses
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                cyberAudio.play("click");
                onSelectNode(activeSelectedNode.id, true);
                if (onOpenVaultEditor) onOpenVaultEditor(activeSelectedNode.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-[0_0_8px_rgba(0,255,65,0.2)]"
            >
              <span>OPEN</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Connected Synapses 1-Click Hop Pills */}
          {activeNeighbors.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/10">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Direct Synaptic Connections ({activeNeighbors.length}):</span>
                <span className="text-cyan-400 text-[8px]">CLICK TO FLY-TO</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-none">
                {activeNeighbors.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSearchFlyTo(n.id)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[9px] text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
                    <span className="truncate max-w-[110px]">{n.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* THREE.JS WEBGL CANVAS MOUNT */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-radial from-[#040711] via-[#020306] to-[#010204]"
      />
    </div>
  );
}
