export type UserRole = "root" | "netrunner" | "analyst" | "guest";

export type ClearanceLevel = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  codename: string;
  title: string;
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  avatar: string;
  email: string;
  nodeAffiliation: string;
  permissions: string[];
  sessionStartedAt?: string;
  token?: string;
  pin?: string;
}

export interface AuthPresetPersona {
  id: string;
  name: string;
  codename: string;
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  description: string;
  avatar: string;
  color: string;
  pin: string;
  defaultPermissions: string[];
}

export const AUTH_PERSONAS: AuthPresetPersona[] = [
  {
    id: "root_operator",
    name: "Cipher Zero (SuperAdmin)",
    codename: "CIPHER_ZERO",
    role: "root",
    clearanceLevel: 5,
    description: "Unrestricted root clearance. Full system orchestrator, kernel access, and telemetry control.",
    avatar: "⚡",
    color: "#00FF41",
    pin: "1337",
    defaultPermissions: ["*"],
  },
  {
    id: "netrunner_devops",
    name: "Hex Blade (DevOps / Netrunner)",
    codename: "HEX_BLADE",
    role: "netrunner",
    clearanceLevel: 3,
    description: "DevOps & runtime specialist. Direct access to Docker engine, CLI matrix, tools, and agent workflows.",
    avatar: "🗡️",
    color: "#00F0FF",
    pin: "2077",
    defaultPermissions: [
      "view:overview",
      "view:chatbot",
      "view:control_room",
      "view:agents",
      "view:knowledge",
      "view:docker",
      "view:tools",
      "view:stats",
      "view:logs",
      "action:terminal_exec",
      "action:docker_manage",
    ],
  },
  {
    id: "data_analyst",
    name: "Oracle Eye (Intelligence Analyst)",
    codename: "ORACLE_EYE",
    role: "analyst",
    clearanceLevel: 2,
    description: "Data intelligence analyst. Access to telemetry metrics, historical analytics, chatbot, and event logs.",
    avatar: "👁️",
    color: "#BF40FF",
    pin: "4040",
    defaultPermissions: [
      "view:overview",
      "view:chatbot",
      "view:stats",
      "view:logs",
    ],
  },
  {
    id: "guest_drifter",
    name: "Ghost Drifter (Restricted Visitor)",
    codename: "GHOST_DRIFTER",
    role: "guest",
    clearanceLevel: 1,
    description: "Restricted guest clearance. Read-only access to public overview hardware gauges.",
    avatar: "👻",
    color: "#9499B3",
    pin: "0000",
    defaultPermissions: [
      "view:overview",
    ],
  },
];
