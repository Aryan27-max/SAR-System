import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ChevronDown, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

type CaseDetail = Awaited<ReturnType<typeof api.getCase>>;

const dataAttributionData = [
  { field: "Customer ID", source: "Core Banking System", timestamp: "2026-02-14 09:15:32", verified: true },
  { field: "Transaction History", source: "Transaction Monitoring System", timestamp: "2026-02-14 09:15:45", verified: true },
  { field: "Risk Rating", source: "KYC Database", timestamp: "2026-02-14 09:15:38", verified: true },
  { field: "Sanctions Status", source: "Sanctions Screening API", timestamp: "2026-02-14 09:15:41", verified: true },
];

const ruleMatches = [
  {
    ruleId: "R-301", ruleName: "Rapid Fund Movement",
    description: "Detects unusually high velocity of fund transfers within short timeframes",
    matched: true, confidence: 0.94,
    parameters: { threshold: "10 transactions/day", observed: "47 transactions/7 days", deviation: "+370%" },
  },
  {
    ruleId: "R-405", ruleName: "Structured Transactions",
    description: "Identifies patterns of transactions just below reporting thresholds",
    matched: true, confidence: 0.87,
    parameters: { threshold: "$50,000", matchingTransactions: 18, averageAmount: "$47,450" },
  },
  {
    ruleId: "R-512", ruleName: "High-Risk Jurisdiction",
    description: "Flags transactions involving FATF high-risk jurisdictions",
    matched: true, confidence: 0.92,
    parameters: { jurisdictions: "Panama, UAE", riskLevel: "High", complianceAlert: "Yes" },
  },
];

export const AuditTrail = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const effectiveCaseId = caseId || "SAR-2026-00234";

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getCase(effectiveCaseId)
      .then(setCaseData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [effectiveCaseId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading audit trail...</span>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load case: {error}</p>
        </div>
      </div>
    );
  }

  const llm = caseData.llmMetadata;
  const auditLogs = caseData.auditLogs;

  const promptSnapshot = `You are an expert AML analyst generating a Suspicious Activity Report (SAR) narrative.

CONTEXT:
- Customer: ${caseData.customer} (${caseData.customerId})
- Alert Type: Rapid Movement of Funds
- Risk Score: 78/100
- Triggered Rules: R-301, R-405, R-512

DATA INPUTS:
[Customer Data]: ${JSON.stringify({ customerId: caseData.customerId, name: caseData.customer })}
[Transaction Data]: 47 transactions, ${caseData.amount} credits in 7 days
[Rule Matches]: Velocity anomaly, structuring, high-risk jurisdictions

INSTRUCTIONS:
Generate a comprehensive SAR narrative following the standard template with sections:
1. Subject Information
2. Account Overview
3. Transaction Activity Summary
4. Pattern Analysis
5. Risk Assessment
6. Typology Linkage
7. Regulatory Context
8. Conclusion

Use professional regulatory language. Reference specific FATF typologies and RBI guidelines where applicable.`;

  return (
    <div className="p-6 space-y-6">
      {/* Case Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Case ID: {caseData.id}</h2>
            <p className="text-sm text-muted-foreground mt-1">{caseData.customer} • {caseData.customerId}</p>
          </div>
          {llm && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Execution ID</p>
              <p className="text-sm font-mono text-foreground">{String(llm.executionId)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Attribution Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Data Attribution</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Field</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Source System</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Verification Status</th>
              </tr>
            </thead>
            <tbody>
              {dataAttributionData.map((row, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{row.field}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.source}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{row.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                      ✓ Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rule Matching */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Rule Engine Match Results</h3>
        </div>
        <div className="p-6 space-y-4">
          {ruleMatches.map((rule) => (
            <div key={rule.ruleId} className="border border-border rounded-lg">
              <button
                onClick={() => setExpandedRule(expandedRule === rule.ruleId ? null : rule.ruleId)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">{rule.ruleId}</span>
                  <span className="text-sm text-foreground">{rule.ruleName}</span>
                  <span className="px-2 py-1 rounded text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Matched • {Math.round(rule.confidence * 100)}%
                  </span>
                </div>
                {expandedRule === rule.ruleId ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {expandedRule === rule.ruleId && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mt-4 mb-4">{rule.description}</p>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(rule.parameters).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground mb-1">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </p>
                        <p className="text-sm text-foreground font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LLM Metadata */}
      {llm && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">LLM Generation Metadata</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {Object.entries(llm).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    {key === "executionId" ? (
                      <span className="font-mono text-xs">{String(value)}</span>
                    ) : (
                      String(value)
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-6">
              <button
                onClick={() => setShowPrompt(!showPrompt)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showPrompt ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                View Prompt Snapshot
              </button>
              {showPrompt && (
                <div className="mt-4 p-4 bg-background rounded border border-border">
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">{promptSnapshot}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Case Activity Log</h3>
        </div>
        <div className="p-6">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity logged yet.</p>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log, index) => (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    {index < auditLogs.length - 1 && <div className="w-px h-full bg-border mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground font-mono">{log.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">by {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
