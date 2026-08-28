"use client";

import { useHermesStore } from "./hermesStore";

export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export interface HostTelemetry {
  hostname: string;
  cpu_percent: number;
  memory_percent: number;
}

export interface ServiceTelemetry {
  port: number;
  status: "UP" | "DOWN" | "checking";
  latency_ms: number;
  name: string;
}

export interface MinionNode {
  id: string;
  name: string;
  role: string;
  status: "IDLE" | "ACTIVE" | "OFFLINE" | "ERROR";
  model: string;
  load: number;
  last_ping: string;
}

export interface CronJobItem {
  name: string;
  schedule: string;
  script: string;
  status: string;
  last_run: string;
}

export interface TelemetryPayload {
  type: string;
  timestamp: number;
  host: HostTelemetry;
  services: Record<string, ServiceTelemetry>;
  minions: MinionNode[];
  active_tasks?: Array<{ id: string; command: string; target_minion: string; status: string }>;
  active_tasks_count?: number;
}

class HermesSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isExplicitClose = false;
  private statusListeners: Array<(status: ConnectionStatus) => void> = [];
  private telemetryListeners: Array<(data: TelemetryPayload) => void> = [];
  private acpListeners: Array<(event: any) => void> = [];
  public currentStatus: ConnectionStatus = "DISCONNECTED";
  public latestTelemetry: TelemetryPayload | null = null;

  public onAcpEvent(cb: (event: any) => void): () => void {
    this.acpListeners.push(cb);
    return () => {
      this.acpListeners = this.acpListeners.filter((c) => c !== cb);
    };
  }

  public getSidecarBaseUrl(): string {
    if (typeof window === "undefined") return "http://localhost:8000";
    return process.env.NEXT_PUBLIC_SIDECAR_URL || "http://localhost:8000";
  }

  public getWsUrl(): string {
    const httpUrl = this.getSidecarBaseUrl();
    const wsUrl = httpUrl.replace(/^http/, "ws");
    return `${wsUrl}/ws/telemetry`;
  }

  public connect(): void {
    if (typeof window === "undefined") return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitClose = false;
    this.setStatus("CONNECTING");

    try {
      const url = this.getWsUrl();
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.setStatus("CONNECTED");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          const data: TelemetryPayload = rawData;
          this.latestTelemetry = data;
          this.notifyTelemetry(data);
          
          // Forward ACP events to registered listeners
          if (typeof rawData.type === "string" && (rawData.type.startsWith("ACP_") || rawData.type.startsWith("SWARM_"))) {
            this.acpListeners.forEach((cb) => cb(rawData));
          }

          // Update zustand store if connected
          if (data.type === "TELEMETRY_UPDATE" || data.type === "INITIAL_SNAPSHOT") {
            const store = useHermesStore.getState();
            if (data.services) {
              store.updateServicesStatus(data.services);
            }
            if (data.minions) {
              store.updateMinionsList(data.minions);
            }
            if (data.host) {
              store.updateHostTelemetry(data.host);
            }
          }
        } catch {
          // ignore non-json
        }
      };

      this.socket.onerror = () => {
        this.setStatus("ERROR");
      };

      this.socket.onclose = () => {
        this.setStatus("DISCONNECTED");
        if (!this.isExplicitClose) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.setStatus("ERROR");
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isExplicitClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus("DISCONNECTED");
  }

  public send(action: string, payload: Record<string, unknown> = {}): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...payload }));
      return true;
    }
    return false;
  }

  public subscribeStatus(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public subscribeTelemetry(callback: (data: TelemetryPayload) => void): () => void {
    this.telemetryListeners.push(callback);
    if (this.latestTelemetry) {
      callback(this.latestTelemetry);
    }
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((cb) => cb !== callback);
    };
  }

  private setStatus(status: ConnectionStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private notifyTelemetry(data: TelemetryPayload): void {
    this.telemetryListeners.forEach((cb) => cb(data));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }
}

export const hermesSocket = new HermesSocketClient();
