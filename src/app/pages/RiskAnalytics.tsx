import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { Loader2, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

type AnalyticsData = Awaited<ReturnType<typeof api.getAnalytics>>;

export const RiskAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load analytics: {error}</p>
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#1E293B", border: "1px solid #334155", borderRadius: "8px", color: "#E2E8F0" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Risk Trend Over Time */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Risk Level Trend (6 Months)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.riskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="high" stackId="a" fill="#DC2626" name="High Risk" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium Risk" radius={[0, 0, 0, 0]} />
              <Bar dataKey="low" stackId="a" fill="#10B981" name="Low Risk" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Typology Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">SAR Typology Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.typologyDistribution}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80} dataKey="value"
                >
                  {data.typologyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Processing Time Comparison */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Avg. Processing Time (Minutes)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.processingTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: "12px" }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="manual" stroke="#DC2626" strokeWidth={2} name="Manual Process" dot={{ fill: "#DC2626", r: 4 }} />
                <Line type="monotone" dataKey="ai" stroke="#10B981" strokeWidth={2} name="AI-Assisted" dot={{ fill: "#10B981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#DC2626]"></div><span className="text-sm text-muted-foreground">Manual Process</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#10B981]"></div><span className="text-sm text-muted-foreground">AI-Assisted</span></div>
          </div>
        </div>
      </div>

      {/* High-Risk Jurisdiction Analysis */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">High-Risk Jurisdiction Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Jurisdiction</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Total Cases</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Avg. Risk Score</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Risk Visualization</th>
              </tr>
            </thead>
            <tbody>
              {data.jurisdictionRisk.map((row) => (
                <tr key={row.jurisdiction} className="border-b border-border hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{row.jurisdiction}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.cases}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.avgRisk}/100</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                        <div className="h-full bg-[#DC2626]" style={{ width: `${row.avgRisk}%` }}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{row.avgRisk}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs text-muted-foreground mb-2">Time Saved Per Report</p>
          <p className="text-3xl font-semibold text-foreground mb-1">{data.keyMetrics.timeSavedPerReport}</p>
          <p className="text-xs text-[#10B981]">↑ {data.keyMetrics.timeSavedPercentage} efficiency gain</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs text-muted-foreground mb-2">Reports Filed (Feb 2026)</p>
          <p className="text-3xl font-semibold text-foreground mb-1">{data.keyMetrics.reportsFiled}</p>
          <p className="text-xs text-[#10B981]">↑ {data.keyMetrics.reportsFiledChange} from last month</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs text-muted-foreground mb-2">Avg. Confidence Score</p>
          <p className="text-3xl font-semibold text-foreground mb-1">{data.keyMetrics.avgConfidenceScore}</p>
          <p className="text-xs text-muted-foreground">AI-generated narratives</p>
        </div>
      </div>
    </div>
  );
};
