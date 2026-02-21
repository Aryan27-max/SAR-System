import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";
import { RiskBadge, RiskLevel } from "../components/RiskBadge";
import { StatusBadge, CaseStatus } from "../components/StatusBadge";
import { FileText, CheckCircle, XCircle, AlertTriangle, ArrowUpCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";

const CASE_ID = "SAR-2026-00234";

// Static display data (KYC / account / transaction / alert - prototype values)
const mockCustomerData = {
  customerId: "CUS-892456", fullName: "Jonathan Martinez",
  dateOfBirth: "1978-03-15", nationality: "USA",
  occupation: "Import/Export Trader", sourceOfFunds: "Business Income",
  riskRating: "Medium", pepStatus: "Non-PEP",
  sanctionsStatus: "Clear", expectedMonthlyTurnover: "$50,000",
};
const mockAccountData = {
  accountNumber: "GB29BARC20031234567890", accountType: "Business Current Account",
  openingDate: "2022-05-12", tenure: "3 years 9 months",
  averageBalance: "$85,400", linkedAccounts: "2 accounts",
};
const mockTransactionData = {
  totalCredits: "$1,245,000", totalDebits: "$1,187,600",
  incomingTransactions: 47, uniqueSenders: 23,
  timeWindow: "7 days", counterpartyGeography: "Multiple jurisdictions",
  crossBorder: true, destinationCountry: "Panama, UAE, Singapore",
  highRiskJurisdiction: true, paymentType: "SWIFT",
};
const mockAlertData = {
  alertId: "ALT-2026-04821", alertType: "Rapid Movement of Funds",
  triggeredRules: "R-301, R-405, R-512", initialRiskScore: 78,
  historicalAlerts: 3, triggerDate: "2026-02-14 09:23:11 UTC",
};

const workflowSteps = [
  { label: "Input Data", status: "complete" },
  { label: "Feature Extraction", status: "complete" },
  { label: "Rule Engine", status: "complete" },
  { label: "Risk Scoring", status: "complete" },
  { label: "LLM Generation", status: "complete" },
  { label: "Audit Trail", status: "complete" },
  { label: "Human Review", status: "active" },
  { label: "Approval", status: "pending" },
];

export const GenerateSAR = () => {
  const { user } = useRole();
  const [narrative, setNarrative] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [status, setStatus] = useState<CaseStatus>("Draft");
  const [generating, setGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const canEdit = user?.role === "Analyst" || user?.role === "Supervisor";
  const canApprove = user?.role === "Supervisor";

  // Fetch the real case status and narrative from the backend on mount
  useEffect(() => {
    api.getCase(CASE_ID)
      .then((caseData) => {
        setStatus(caseData.status as CaseStatus);
        if (caseData.narrative) {
          setNarrative(caseData.narrative);
          setIsGenerated(true);
        }
      })
      .catch(() => {
        // Silently fall back to defaults if fetch fails
      });
  }, []);
  const isReadOnly = user?.role === "Auditor";

  const handleGenerate = async () => {
    setGenerating(true);
    setActionError("");
    try {
      const result = await api.generateNarrative(CASE_ID);
      setNarrative(result.narrative);
      setIsGenerated(true);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    setActionLoading(true);
    setActionError("");
    try {
      await api.updateCaseStatus(CASE_ID, newStatus, user?.name || "Unknown");
      setStatus(newStatus);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Workflow Visualization */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-4">SAR Generation Workflow</h3>
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step.status === "complete"
                      ? "bg-[#10B981] text-white"
                      : step.status === "active"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step.status === "complete" ? "✓" : index + 1}
                </div>
                <span className="text-xs text-muted-foreground mt-2 text-center">{step.label}</span>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step.status === "complete" ? "bg-[#10B981]" : "bg-muted"}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Input Data */}
        <div className="space-y-6">
          {[
            { title: "Customer (KYC) Data", data: mockCustomerData },
            { title: "Account Information", data: mockAccountData },
            { title: "Transaction Data", data: mockTransactionData },
            { title: "Monitoring Alert Data", data: mockAlertData },
          ].map(({ title, data }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                    </label>
                    <p className="text-sm text-foreground mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Generate Button */}
          {!isGenerated && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-primary text-primary-foreground py-3 rounded font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                <><FileText className="w-5 h-5" /> Generate SAR Draft</>
              )}
            </button>
          )}
        </div>

        {/* RIGHT COLUMN - Output */}
        <div className="space-y-6">
          {isGenerated && (
            <>
              {/* Risk Score Summary */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Risk Assessment</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Overall Risk Score</p>
                    <p className="text-3xl font-semibold text-foreground">78/100</p>
                  </div>
                  <RiskBadge level="High" score={78} />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Velocity Risk", score: 85, color: "#DC2626" },
                    { label: "Structuring Risk", score: 72, color: "#F59E0B" },
                    { label: "Cross-Border Risk", score: 81, color: "#DC2626" },
                    { label: "Behavioral Deviation", score: 76, color: "#F59E0B" },
                  ].map(({ label, score, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs text-foreground">{score}/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full" style={{ width: `${score}%`, backgroundColor: color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Status */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Case Status</h3>
                <div className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-xs text-muted-foreground">{CASE_ID}</span>
                </div>
              </div>

              {/* SAR Narrative */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">SAR Narrative Draft</h3>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full h-96 px-4 py-3 bg-input-background border border-input rounded text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                  style={{ lineHeight: "1.6" }}
                />
                {isReadOnly && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Read-only mode: Auditors cannot edit narratives
                  </p>
                )}
              </div>

              {/* Error */}
              {actionError && (
                <p className="text-xs text-destructive text-center">{actionError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("Approved")}
                  disabled={!canApprove || status === "Approved" || actionLoading}
                  className="flex-1 bg-[#10B981] text-white py-3 rounded font-medium hover:bg-[#10B981]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange("Under Review")}
                  disabled={isReadOnly || status === "Under Review" || actionLoading}
                  className="flex-1 bg-[#F59E0B] text-white py-3 rounded font-medium hover:bg-[#F59E0B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ArrowUpCircle className="w-5 h-5" /> Escalate
                </button>
                <button
                  onClick={() => handleStatusChange("Rejected")}
                  disabled={isReadOnly || status === "Rejected" || actionLoading}
                  className="flex-1 bg-destructive text-destructive-foreground py-3 rounded font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>

              {!canApprove && !isReadOnly && (
                <p className="text-xs text-muted-foreground text-center">
                  Only Supervisors can approve SAR reports
                </p>
              )}
            </>
          )}

          {!isGenerated && (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Click "Generate SAR Draft" to create the narrative</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
