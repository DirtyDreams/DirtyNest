"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Check } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  const fetchTodos = useCallback(() => {
    try {
      const saved = localStorage.getItem("dirtynest_todos");
      setTodos(saved ? JSON.parse(saved) : []);
    } catch {
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const nextTodos = [
      ...todos,
      {
        id: Date.now(),
        text: newTodo.trim(),
        completed: 0,
        sort_order: todos.length,
        priority: newPriority,
        due_date: newDueDate || null,
      },
    ];
    setTodos(nextTodos);
    localStorage.setItem("dirtynest_todos", JSON.stringify(nextTodos));
    {
      setNewTodo("");
      setNewPriority("normal");
      setNewDueDate("");
    }
  };

  const toggleTodo = (id: number, completed: boolean) => {
    const nextTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: completed ? 0 : 1 } : todo));
    setTodos(nextTodos);
    localStorage.setItem("dirtynest_todos", JSON.stringify(nextTodos));
  };

  const deleteTodo = (id: number) => {
    const nextTodos = todos.filter((todo) => todo.id !== id);
    setTodos(nextTodos);
    localStorage.setItem("dirtynest_todos", JSON.stringify(nextTodos));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return !!t.completed;
    return true;
  });

  const remainingCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="cyber-card p-4.5 relative select-none font-mono">
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="widget-header">
        <CheckSquare size={15} className="icon" />
        <h3>Action Directives</h3>
        <Badge
          variant="outline"
          className="ml-auto text-[10px] text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30 font-bold"
        >
          <NumberFlow value={remainingCount} /> PENDING
        </Badge>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="New operational directive..."
            className="flex-1 bg-[#07070B] text-xs h-9 border-white/10 text-[#F1F3F9] placeholder:text-[#4F536E] focus-visible:border-[#00FF41]/50 focus-visible:ring-[#00FF41]/20"
          />
          <Button
            onClick={addTodo}
            size="icon"
            className="h-9 w-9 bg-[#00FF41]/15 hover:bg-[#00FF41]/25 text-[#00FF41] border border-[#00FF41]/30 shrink-0 cursor-pointer transition-all active:scale-95"
          >
            <Plus size={15} />
          </Button>
        </div>
        <div className="flex gap-2 text-xs">
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as "low" | "normal" | "high")}
            className="bg-[#07070B] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-[#9499B3] focus:border-[#00FF41]/50 outline-none"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal</option>
            <option value="high">High Priority</option>
          </select>
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="bg-[#07070B] border-white/10 text-xs text-[#9499B3] h-8 flex-1 focus-visible:border-[#00FF41]/50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-2 bg-white/5 rounded-xl p-0.5 border border-white/5 text-[10px] font-mono">
        {[
          { key: "all" as const, label: `ALL (${todos.length})` },
          { key: "active" as const, label: `ACTIVE (${remainingCount})` },
          { key: "done" as const, label: `DONE (${todos.length - remainingCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "flex-1 py-1 rounded-lg transition-all text-center font-bold cursor-pointer",
              filter === tab.key
                ? "bg-[#00FF41]/20 text-[#00FF41] shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : "text-[#9499B3] hover:text-[#F1F3F9]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group transition-all duration-150 bg-white/[0.02] border border-white/5 hover:border-white/15"
          >
            <button
              onClick={() => toggleTodo(todo.id, !!todo.completed)}
              className={cn(
                "w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer",
                todo.completed
                  ? "border-[#00FF41] bg-[#00FF41]/20 shadow-[0_0_8px_rgba(0,255,65,0.4)]"
                  : "border-white/20 hover:border-white/40"
              )}
            >
              {todo.completed ? (
                <Check size={11} className="text-[#00FF41]" strokeWidth={3} />
              ) : null}
            </button>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <span
                className={cn(
                  "text-xs font-medium truncate transition-all duration-200",
                  todo.completed ? "text-[#4F536E] line-through" : "text-[#F1F3F9]"
                )}
              >
                {todo.text}
              </span>
              <div className="flex gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8px] font-mono uppercase px-1.5 py-0 border-transparent",
                    todo.priority === "high" && "bg-red-500/15 text-red-400",
                    todo.priority === "low" && "bg-cyan-500/15 text-cyan-400",
                    todo.priority === "normal" && "bg-white/5 text-[#9499B3]"
                  )}
                >
                  {todo.priority}
                </Badge>
                {todo.due_date && (
                  <span className="text-[9px] font-mono text-[#9499B3]">
                    DUE: {todo.due_date}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTodo(todo.id)}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#4F536E] hover:text-[#FF2A6D] hover:bg-white/5"
            >
              <Trash2 size={12} />
            </Button>
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
