export type AgentRuntimeAdapter =
  | "Claude Code CLI"
  | "OpenAI Codex"
  | "Hermes Local Engine"
  | "Custom MCP Server"
  | "HTTP Webhook REST";

export interface AgentTeamMember {
  id: string;
  name: string;
  role: string;
  status: "idle" | "heartbeat_active" | "waiting_approval";
  tokensBurned: number;
}

export interface AgentTeam {
  id: string;
  name: string;
  lead: string;
  icon: string;
  color: string;
  runtimeAdapter: AgentRuntimeAdapter;
  heartbeatIntervalSec: number;
  lastHeartbeatTime: string;
  nextHeartbeatInSec: number;
  dailyBudgetCents: number;
  spentBudgetCents: number;
  status: "running" | "paused" | "error";
  members: AgentTeamMember[];
  activeGoal: string;
  tasksCompleted: number;
}

export interface GoalNode {
  id: string;
  level: "L1_COMPANY_OBJECTIVE" | "L2_DEPARTMENT_GOAL" | "L3_TEAM_EPIC" | "L4_AGENT_TASK";
  title: string;
  owner: string;
  progress: number;
  status: "ON_TRACK" | "AT_RISK" | "COMPLETED";
  children?: GoalNode[];
}

export interface PaperclipIssue {
  id: string;
  title: string;
  teamId: string;
  assignedAgent: string;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "DONE" | "FAILED_ESCALATED";
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  githubSyncId?: string;
  errorTrace?: string;
  retryCount: number;
  tokensUsed: number;
}

export type PipelineStage = "DEV" | "SEC" | "OPS" | "PKM" | "DONE";
export type ControlPlaneSubTab = "teams" | "goals_tree" | "issues" | "governance";
