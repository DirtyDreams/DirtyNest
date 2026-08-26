"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Check, Sparkles } from "lucide-react";

interface Todo {
  id: number;
  text: string;
  completed: number;
  sort_order: number;
  priority: "low" | "normal" | "high";
  due_date: string | null;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "normal" | "high">("normal");
  const [newDueDate, setNewDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (res.ok) setTodos(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: newTodo.trim(),
        priority: newPriority,
        due_date: newDueDate || null,
      }),
    });
    if (res.ok) {
      setTodos(await res.json());
      setNewTodo("");
      setNewPriority("normal");
      setNewDueDate("");
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
    if (res.ok) setTodos(await res.json());
  };

  const updateTodoPriority = async (id: number, priority: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    if (res.ok) setTodos(await res.json());
  };

  const deleteTodo = async (id: number) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) setTodos(await res.json());
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return !!t.completed;
    return true;
  });

  const remainingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="cyber-card p-4.5 relative">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <CheckSquare size={15} className="icon" />
        <h3>Action Directives</h3>
        <span className="ml-auto text-[10px] font-mono text-[#00FF41] px-2 py-0.5 rounded bg-[#00FF41]/10 border border-[#00FF41]/20">
          {remainingCount} PENDING
        </span>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="New operational directive..."
            className="flex-1 bg-[#07070B] outline-none text-xs px-3 py-2 rounded-xl text-[#F1F3F9] border border-white/10 focus:border-[#00FF41] placeholder:text-[#4F536E]"
          />
          <button
            onClick={addTodo}
            className="px-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center"
            style={{
              background: "rgba(0, 255, 65, 0.15)",
              color: "#00FF41",
              border: "1px solid rgba(0, 255, 65, 0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(0, 255, 65, 0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(0, 255, 65, 0.15)";
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex gap-2 text-xs">
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="bg-[#07070B] border border-white/10 rounded-lg px-2 py-1 text-[#9499B3] focus:border-[#00FF41] outline-none"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal</option>
            <option value="high">High Priority</option>
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="bg-[#07070B] border border-white/10 rounded-lg px-2 py-1 text-[#9499B3] focus:border-[#00FF41] outline-none flex-1"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-2 bg-white/5 rounded-lg p-0.5 border border-white/5 text-[9px] font-mono">
        {[
          { key: "all", label: `ALL (${todos.length})` },
          { key: "active", label: `ACTIVE (${remainingCount})` },
          { key: "done", label: `DONE (${todos.length - remainingCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-1 rounded transition-colors text-center ${
              filter === tab.key
                ? "bg-[#00FF41]/20 text-[#00FF41] font-bold"
                : "text-[#9499B3]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="space-y-1 max-h-[190px] overflow-y-auto pr-1">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150"
            style={{
              background: todo.completed
                ? "rgba(255, 255, 255, 0.01)"
                : "rgba(255, 255, 255, 0.025)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
            }}
          >
            <button
              onClick={() => toggleTodo(todo.id, !!todo.completed)}
              className="w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                borderColor: todo.completed ? "#00FF41" : "rgba(255, 255, 255, 0.2)",
                background: todo.completed ? "rgba(0, 255, 65, 0.2)" : "transparent",
                boxShadow: todo.completed ? "0 0 8px rgba(0, 255, 65, 0.5)" : "none",
              }}
            >
              {todo.completed ? (
                <Check size={11} className="text-[#00FF41]" strokeWidth={3} />
              ) : null}
            </button>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span
                className={`text-sm font-medium truncate transition-all duration-200 ${
                  todo.completed ? "text-[#4F536E] line-through" : "text-[#F1F3F9]"
                }`}
              >
                {todo.text}
              </span>
              <div className="flex gap-2 mt-0.5">
                <span className="text-[9px] font-mono uppercase px-1.5 rounded" style={{
                  background: todo.priority === 'high' ? 'rgba(255,0,0,0.1)' : todo.priority === 'low' ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  color: todo.priority === 'high' ? '#FF4040' : todo.priority === 'low' ? '#00F0FF' : '#9499B3'
                }}>
                  {todo.priority}
                </span>
                {todo.due_date && (
                  <span className="text-[9px] font-mono text-[#9499B3]">
                    DUE: {todo.due_date}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#4F536E] hover:text-[#FF2A6D]"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-[11px] font-mono text-center py-4 text-[#4F536E]">
            No directives match criteria
          </p>
        )}
      </div>
    </div>
  );
}
