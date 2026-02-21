import { useEffect, useState } from "react";
import { Search, Download, AlertCircle, CheckCircle, Info, XCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";

type LogLevel = "Info" | "Success" | "Warning" | "Error";
type SystemLog = Awaited<ReturnType<typeof api.getSystemLogs>>[number];

const logLevelStyles: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  Info: { icon: Info, color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10" },
  Success: { icon: CheckCircle, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Warning: { icon: AlertCircle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  Error: { icon: XCircle, color: "text-[#DC2626]", bg: "bg-[#DC2626]/10" },
};

export const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "All">("All");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    api.getSystemLogs({
      search: searchTerm || undefined,
      level: levelFilter !== "All" ? levelFilter : undefined,
    })
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchLogs();
  };

  const handleExport = () => {
    const csv = [
      ["ID", "Timestamp", "Level", "Category", "Message", "User", "IP", "Details"],
      ...logs.map((l) => [l.id, l.timestamp, l.level, l.category, l.message, l.user, l.ipAddress, l.details]),
    ].map((row) => row.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "system-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search logs... (press Enter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel | "All")}
            className="px-4 py-2.5 bg-input-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Levels</option>
            <option value="Info">Info</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.keys(logLevelStyles) as LogLevel[]).map((level) => {
          const count = logs.filter((l) => l.level === level).length;
          const { icon: Icon, color, bg } = logLevelStyles[level];
          return (
            <div key={level} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-semibold text-foreground">{loading ? "—" : count}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{level}</p>
            </div>
          );
        })}
      </div>

      {/* System Logs Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">System Activity Logs</h3>
            <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `${logs.length} entries`}</span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading logs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-destructive text-sm">{error}</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const { icon: Icon, color, bg } = logLevelStyles[log.level as LogLevel] ?? logLevelStyles.Info;
              const isExpanded = expandedLog === log.id;
              return (
                <div key={log.id} className="hover:bg-muted/5 transition-colors">
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="w-full px-6 py-4 flex items-start gap-4 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{log.message}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{log.category}</span>
                            {log.user && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{log.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</span>
                      </div>
                    </div>
                  </button>
                  {isExpanded && log.details && (
                    <div className="px-6 pb-4 pl-[72px]">
                      <div className="p-4 bg-background rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Details:</p>
                        <p className="text-sm text-foreground">{log.details}</p>
                        {log.ipAddress && (
                          <p className="text-xs text-muted-foreground mt-2">IP Address: <span className="font-mono">{log.ipAddress}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
