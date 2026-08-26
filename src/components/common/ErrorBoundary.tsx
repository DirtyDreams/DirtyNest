"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DirtyNest ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#07070B] border border-[#FF003C]/30 rounded-xl m-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FF003C]/10 border border-[#FF003C]/40 flex items-center justify-center text-[#FF003C] mb-4 shadow-[0_0_20px_rgba(255,0,60,0.3)] animate-pulse">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-xl font-mono font-bold text-[#FF003C] tracking-wide mb-2">
            {this.props.fallbackTitle || "TACTICAL SUBSYSTEM MALFUNCTION"}
          </h2>

          <p className="text-xs font-mono text-[#9499B3] max-w-md mb-6 leading-relaxed">
            An unhandled runtime anomaly occurred inside this deck component. The error has been isolated to prevent total cockpit failure.
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg bg-black/60 border border-[#FF003C]/20 rounded p-3 mb-6 text-left overflow-auto max-h-36">
              <div className="text-[10px] font-mono text-[#FF003C] font-semibold mb-1">EXCEPTION PAYLOAD:</div>
              <pre className="text-[11px] font-mono text-[#F1F3F9] whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF003C]/20 border border-[#FF003C]/50 hover:bg-[#FF003C]/30 text-[#FF003C] rounded font-mono text-xs transition-all shadow-[0_0_10px_rgba(255,0,60,0.2)]"
            >
              <RefreshCw size={14} />
              <span>RESTART SUBSYSTEM</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-[#9499B3] hover:text-[#F1F3F9] rounded font-mono text-xs transition-all"
            >
              <span>HARD RELOAD</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
