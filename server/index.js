const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

function now() {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
        return res.status(400).json({ error: "Employee ID and password are required." });
    }
    const user = db.findUser(employeeId, password);
    if (!user) return res.status(401).json({ error: "Invalid employee ID or password." });

    db.updateUserLogin(user.id);
    db.addSystemLog({
        id: uuidv4(), timestamp: now(), level: "Success",
        category: "Authentication", message: "User login successful",
        user_name: user.name, ip_address: "192.168.1.100",
        details: `${user.employee_id} authenticated successfully`,
    });

    return res.json({
        employeeId: user.employee_id,
        name: user.name,
        role: user.role,
        department: user.department,
        email: user.email,
    });
});

// ─── GET /api/dashboard ─────────────────────────────────────────────────────
app.get("/api/dashboard", (req, res) => {
    const allCases = db.getCases();
    const totalActive = allCases.filter((c) => !["Filed", "Rejected"].includes(c.status)).length;
    const highRisk = allCases.filter((c) => c.risk_level === "High").length;
    const pending = allCases.filter((c) => c.status === "Under Review").length;

    const recentCases = allCases.slice(0, 5).map((c) => ({
        id: c.id, customer: c.customer_name, customerId: c.customer_id,
        riskLevel: c.risk_level, status: c.status, amount: c.amount, date: c.date,
    }));

    const countByRisk = (level) => allCases.filter((c) => c.risk_level === level).length;
    const riskDistribution = [
        { name: "High", value: countByRisk("High"), color: "#DC2626" },
        { name: "Medium", value: countByRisk("Medium"), color: "#F59E0B" },
        { name: "Low", value: countByRisk("Low"), color: "#10B981" },
    ];

    res.json({
        metrics: { totalActive, highRisk, pendingApprovals: pending, avgDraftTime: "48 min" },
        recentCases,
        riskDistribution,
        complianceBacklog: [
            { month: "Sep", cases: 245 }, { month: "Oct", cases: 289 },
            { month: "Nov", cases: 312 }, { month: "Dec", cases: 267 },
            { month: "Jan", cases: 223 }, { month: "Feb", cases: totalActive },
        ],
    });
});

// ─── GET /api/cases ──────────────────────────────────────────────────────────
app.get("/api/cases", (req, res) => {
    const { search, risk, status } = req.query;
    const cases = db.getCases(search, risk !== "All" ? risk : null, status !== "All" ? status : null);
    res.json(cases.map((c) => ({
        id: c.id, customer: c.customer_name, customerId: c.customer_id,
        riskLevel: c.risk_level, status: c.status, amount: c.amount,
        date: c.date, analyst: c.analyst,
    })));
});

// ─── GET /api/cases/:id ──────────────────────────────────────────────────────
app.get("/api/cases/:id", (req, res) => {
    const c = db.getCase(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found." });

    const auditLogs = db.getAuditLogs(req.params.id).map((l) => ({
        id: l.id, timestamp: l.timestamp, action: l.action, user: l.user_name, details: l.details,
    }));

    res.json({
        id: c.id, customer: c.customer_name, customerId: c.customer_id,
        riskLevel: c.risk_level, status: c.status, amount: c.amount,
        date: c.date, analyst: c.analyst, narrative: c.narrative,
        llmMetadata: c.execution_id
            ? {
                executionId: c.execution_id, modelVersion: c.model_version,
                templateVersion: c.template_version, processingTime: c.processing_time,
                confidenceScore: c.confidence_score, tokensUsed: c.tokens_used,
                timestamp: c.updated_at, temperature: 0.3,
            }
            : null,
        auditLogs,
    });
});

// ─── PATCH /api/cases/:id/status ────────────────────────────────────────────
app.patch("/api/cases/:id/status", (req, res) => {
    const { status, userName } = req.body;
    const validStatuses = ["Draft", "Under Review", "Approved", "Submitted", "Filed", "Rejected"];
    if (!status || !validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status." });

    const c = db.getCase(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found." });
    const oldStatus = c.status;

    db.updateCaseStatus(req.params.id, status);

    db.addAuditLog({
        id: uuidv4(), case_id: req.params.id, timestamp: now(),
        action: "Status Changed", user_name: userName || "System",
        details: `Status: ${oldStatus} → ${status}`,
    });
    db.addSystemLog({
        id: uuidv4(), timestamp: now(), level: "Info",
        category: "Case Management", message: "Case status updated",
        user_name: userName || "System", ip_address: "192.168.1.100",
        details: `${req.params.id}: ${oldStatus} → ${status}`,
    });

    res.json({ success: true, status });
});

// ─── POST /api/cases/:id/generate-narrative ─────────────────────────────────
app.post("/api/cases/:id/generate-narrative", (req, res) => {
    const c = db.getCase(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found." });

    const execId = `exec-${uuidv4().substring(0, 20)}`;
    const riskLine = c.risk_level === "High" ? "78/100 (HIGH RISK)" : c.risk_level === "Medium" ? "55/100 (MEDIUM RISK)" : "32/100 (LOW RISK)";

    const narrative = `SUBJECT INFORMATION

Customer ${c.customer_name} (${c.customer_id}) maintains an account with Barclays that has been flagged for suspicious activity. The following analysis was generated by the AI-assisted SAR narrative system based on available KYC, account, and transaction data.

ACCOUNT OVERVIEW

The subject account has shown significant deviations from expected transaction patterns. Risk level has been classified as ${c.risk_level.toUpperCase()} based on the rule engine outputs and risk scoring model.

TRANSACTION ACTIVITY SUMMARY

Suspicious activity was detected involving transactions totaling ${c.amount} during the monitored period. Multiple rule triggers were identified including velocity anomalies and cross-border complexity.

PATTERN ANALYSIS

Analysis reveals concerning patterns consistent with potential money laundering typologies:

1. VELOCITY ANOMALY: Significant deviation from historical transaction patterns.
2. CROSS-BORDER COMPLEXITY: Funds transferred across multiple high-risk jurisdictions.
3. STRUCTURING INDICATORS: Possible structuring patterns detected below reporting thresholds.

RISK ASSESSMENT

Overall Risk Score: ${riskLine}

CONCLUSION

Based on the analysis of transaction patterns, customer behaviour, and applicable regulatory frameworks, it is recommended that this case be escalated for SAR filing with the Financial Intelligence Unit. Recommended Action: File SAR within 7 days per regulatory requirements.`;

    const metadata = {
        executionId: execId, modelVersion: "GPT-4-Turbo (1106)",
        templateVersion: "SAR-Template-v2.1", processingTime: "4.2 seconds",
        confidenceScore: 0.89, tokensUsed: "3,247 tokens",
        timestamp: now(), temperature: 0.3,
    };

    db.updateCaseNarrative(req.params.id, {
        narrative, executionId: execId, modelVersion: metadata.modelVersion,
        templateVersion: metadata.templateVersion, processingTime: metadata.processingTime,
        confidenceScore: metadata.confidenceScore, tokensUsed: metadata.tokensUsed,
    });

    db.addAuditLog({
        id: uuidv4(), case_id: req.params.id, timestamp: now(),
        action: "SAR Narrative Generated", user_name: "System (AI)",
        details: "LLM generated initial draft via AI-assisted pipeline",
    });
    db.addSystemLog({
        id: uuidv4(), timestamp: now(), level: "Info",
        category: "SAR Generation", message: "SAR narrative generated successfully",
        user_name: "System (AI)", ip_address: "10.0.2.15",
        details: `Case: ${req.params.id}, Execution: ${execId.substring(0, 24)}`,
    });

    res.json({ narrative, ...metadata });
});

// ─── GET /api/users ──────────────────────────────────────────────────────────
app.get("/api/users", (req, res) => {
    const users = db.getUsers().map((u) => ({
        id: u.id, name: u.name, employeeId: u.employee_id,
        role: u.role, department: u.department, email: u.email,
        lastLogin: u.last_login, casesHandled: u.cases_handled,
    }));
    res.json(users);
});

// ─── GET /api/system-logs ────────────────────────────────────────────────────
app.get("/api/system-logs", (req, res) => {
    const { search, level } = req.query;
    const logs = db.getSystemLogs(search, level !== "All" ? level : null).map((l) => ({
        id: l.id, timestamp: l.timestamp, level: l.level, category: l.category,
        message: l.message, user: l.user_name, ipAddress: l.ip_address, details: l.details,
    }));
    res.json(logs);
});

// ─── GET /api/analytics ──────────────────────────────────────────────────────
app.get("/api/analytics", (req, res) => {
    res.json({
        riskTrend: [
            { month: "Sep 2025", high: 18, medium: 42, low: 115 },
            { month: "Oct 2025", high: 21, medium: 46, low: 122 },
            { month: "Nov 2025", high: 25, medium: 51, low: 136 },
            { month: "Dec 2025", high: 19, medium: 48, low: 120 },
            { month: "Jan 2026", high: 20, medium: 45, low: 128 },
            { month: "Feb 2026", high: 23, medium: 48, low: 129 },
        ],
        typologyDistribution: [
            { name: "Trade-Based ML", value: 45, color: "#005EB8" },
            { name: "Structuring", value: 32, color: "#0EA5E9" },
            { name: "Layering", value: 28, color: "#8B5CF6" },
            { name: "Smurfing", value: 18, color: "#F59E0B" },
            { name: "Other", value: 12, color: "#10B981" },
        ],
        processingTime: [
            { month: "Sep", manual: 342, ai: 52 },
            { month: "Oct", manual: 358, ai: 48 },
            { month: "Nov", manual: 365, ai: 45 },
            { month: "Dec", manual: 351, ai: 51 },
            { month: "Jan", manual: 348, ai: 49 },
            { month: "Feb", manual: 354, ai: 48 },
        ],
        jurisdictionRisk: [
            { jurisdiction: "Panama", cases: 18, avgRisk: 82 },
            { jurisdiction: "UAE", cases: 15, avgRisk: 76 },
            { jurisdiction: "Singapore", cases: 12, avgRisk: 68 },
            { jurisdiction: "Cayman Islands", cases: 9, avgRisk: 79 },
            { jurisdiction: "Switzerland", cases: 7, avgRisk: 64 },
        ],
        keyMetrics: {
            timeSavedPerReport: "~5.2 hrs", timeSavedPercentage: "86%",
            reportsFiled: 127, reportsFiledChange: "23%", avgConfidenceScore: "89%",
        },
    });
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), cases: db.getCases().length });
});

app.listen(PORT, () => {
    console.log(`✅ SAR Backend running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
});
