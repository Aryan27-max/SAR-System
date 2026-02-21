import { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { RiskBadge, RiskLevel } from "../components/RiskBadge";
import { StatusBadge, CaseStatus } from "../components/StatusBadge";
import { FileText, AlertTriangle, Clock, TrendingDown, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "../lib/api";
import { getAllUsers, getHighRiskUsers } from "../../services/amlService";

type DashboardData = Awaited<ReturnType<typeof api.getDashboard>>;

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load dashboard: {error}</p>
          <p className="text-xs text-muted-foreground mt-1">Make sure the backend server is running on port 3001</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Active Cases"
          value={String(data.metrics.totalActive)}
          icon={FileText}
          trend={{ value: "12% from last month", isPositive: true }}
        />
        <MetricCard
          title="High Risk Cases"
          value={String(data.metrics.highRisk)}
          icon={AlertTriangle}
          color="text-[#DC2626]"
        />
        <MetricCard
          title="Pending Approvals"
          value={String(data.metrics.pendingApprovals)}
          icon={Clock}
          color="text-[#F59E0B]"
        />
        <MetricCard
          title="Avg. SAR Draft Time"
          value={data.metrics.avgDraftTime}
          icon={TrendingDown}
          trend={{ value: "85% reduction", isPositive: true }}
          color="text-[#10B981]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#E2E8F0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {data.riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Backlog */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Compliance Backlog Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.complianceBacklog}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#E2E8F0",
                  }}
                />
                <Bar dataKey="cases" fill="#005EB8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Cases Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Recent Cases</h3>
          <Link to="/case-history" className="text-xs text-primary hover:text-primary/80 transition-colors">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Case ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Risk Level</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCases.map((case_) => (
                <tr key={case_.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{case_.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{case_.customer}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{case_.amount}</td>
                  <td className="px-6 py-4">
                    <RiskBadge level={case_.riskLevel as RiskLevel} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={case_.status as CaseStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{case_.date}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/audit-trail/${case_.id}`}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
