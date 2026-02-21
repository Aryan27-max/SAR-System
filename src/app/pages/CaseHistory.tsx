import { useEffect, useState } from "react";
import { Link } from "react-router";
import { RiskBadge, RiskLevel } from "../components/RiskBadge";
import { StatusBadge, CaseStatus } from "../components/StatusBadge";
import { Search, Filter, Loader2, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

type Case = Awaited<ReturnType<typeof api.getCases>>[number];

export const CaseHistory = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "All">("All");

  const fetchCases = () => {
    setLoading(true);
    api.getCases({
      search: searchTerm || undefined,
      risk: riskFilter !== "All" ? riskFilter : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
    })
      .then(setCases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  // Fetch on filter changes (debounced via direct call on blur / select change)
  useEffect(() => {
    fetchCases();
  }, [riskFilter, statusFilter]);

  // Search on Enter or when user clears the field
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchCases();
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by case ID, customer name, or customer ID... (press Enter)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
              className="px-4 py-2.5 bg-input-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CaseStatus | "All")}
              className="px-4 py-2.5 bg-input-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Filed">Filed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Case History</h3>
            <span className="text-xs text-muted-foreground">{loading ? "Loading..." : `Showing ${cases.length} cases`}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading cases...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 flex-col gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Case ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Customer ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Risk Level</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Analyst</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((case_) => (
                  <tr key={case_.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{case_.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{case_.customer}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{case_.customerId}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{case_.amount}</td>
                    <td className="px-6 py-4"><RiskBadge level={case_.riskLevel as RiskLevel} /></td>
                    <td className="px-6 py-4"><StatusBadge status={case_.status as CaseStatus} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{case_.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{case_.analyst}</td>
                    <td className="px-6 py-4">
                      <Link to={`/audit-trail/${case_.id}`} className="text-xs text-primary hover:text-primary/80 transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
