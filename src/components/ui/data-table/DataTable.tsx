"use client";

import {  } from "react";
import { useState, useMemo } from "react";
<<<<<<< HEAD
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
=======
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Download, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  exportFilename?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  exportFilename = "export-data",
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.searchable === false) return false;
          const val = row[col.key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
        })
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDirection === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [data, columns, search, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const activeCols = columns.filter((c) => visibleColumns[c.key]);
    const headerRow = activeCols.map((c) => `"${c.header}"`).join(",");
    const rows = filteredData.map((row) =>
      activeCols.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFilename}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("flex flex-col gap-3 w-full font-mono select-none", className)}>
      {/* Controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4F536E]" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9 bg-[#07070B] border-white/10 text-xs text-[#F1F3F9] placeholder:text-[#4F536E] h-9 focus-visible:border-[#00FF41]/50 focus-visible:ring-[#00FF41]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Column visibility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 bg-[#07070B] border-white/10 text-xs text-[#9499B3] hover:text-[#F1F3F9] hover:border-white/20"
              >
                <SlidersHorizontal size={13} />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0D0E17] border-white/10 text-[#F1F3F9]">
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={visibleColumns[col.key]}
                  onCheckedChange={(checked) =>
                    setVisibleColumns((prev) => ({ ...prev, [col.key]: !!checked }))
                  }
                  className="text-xs"
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export CSV button */}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 bg-[#07070B] border-white/10 text-xs text-[#9499B3] hover:text-[#00FF41] hover:border-[#00FF41]/30"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Badge variant="outline" className="h-9 px-2.5 bg-black/40 border-white/10 text-[11px] text-[#9499B3]">
            {filteredData.length} records
          </Badge>
        </div>
      </div>

      {/* Table grid */}
      <div className="rounded-xl border border-white/10 bg-[#080912] overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns
                .filter((c) => visibleColumns[c.key])
                .map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      "p-3 text-[11px] font-black uppercase text-[#9499B3] tracking-wider select-none",
                      col.sortable !== false && "cursor-pointer hover:text-[#F1F3F9] transition-colors",
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-[#4F536E]">
                          {sortKey === col.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={13} className="text-[#00FF41]" />
                            ) : (
                              <ChevronDown size={13} className="text-[#00FF41]" />
                            )
                          ) : (
                            <ChevronsUpDown size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-white/[0.03] transition-colors duration-150",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns
                    .filter((c) => visibleColumns[c.key])
                    .map((col) => (
                      <td key={col.key} className={cn("p-3 text-[#F1F3F9]", col.className)}>
                        {col.accessor ? col.accessor(row) : row[col.key]}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.filter((c) => visibleColumns[c.key]).length}
                  className="p-8 text-center text-[#4F536E]"
                >
                  No matching telemetry records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 text-xs text-[#9499B3]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 bg-[#07070B] border-white/10 text-[#F1F3F9] disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 bg-[#07070B] border-white/10 text-[#F1F3F9] disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
