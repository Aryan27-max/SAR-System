const BASE_URL = "http://localhost:3001/api";

async function getJson<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}

async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}

async function patchJson<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export const api = {
    // Auth
    login: (employeeId: string, password: string) =>
        postJson<{ employeeId: string; name: string; role: "Analyst" | "Supervisor" | "Auditor"; department: string; email: string }>(
            "/auth/login",
            { employeeId, password }
        ),

    // Dashboard
    getDashboard: () =>
        getJson<{
            metrics: { totalActive: number; highRisk: number; pendingApprovals: number; avgDraftTime: string };
            recentCases: Array<{ id: string; customer: string; customerId: string; riskLevel: string; status: string; amount: string; date: string }>;
            riskDistribution: Array<{ name: string; value: number; color: string }>;
            complianceBacklog: Array<{ month: string; cases: number }>;
        }>("/dashboard"),

    // Cases
    getCases: (params?: { search?: string; risk?: string; status?: string }) => {
        const q = new URLSearchParams(params as Record<string, string>).toString();
        return getJson<Array<{ id: string; customer: string; customerId: string; riskLevel: string; status: string; amount: string; date: string; analyst: string }>>(`/cases${q ? `?${q}` : ""}`);
    },

    getCase: (id: string) =>
        getJson<{
            id: string; customer: string; customerId: string; riskLevel: string; status: string;
            amount: string; date: string; analyst: string; narrative: string | null;
            llmMetadata: Record<string, unknown> | null;
            auditLogs: Array<{ id: string; timestamp: string; action: string; user: string; details: string }>;
        }>(`/cases/${id}`),

    updateCaseStatus: (id: string, status: string, userName: string) =>
        patchJson<{ success: boolean; status: string }>(`/cases/${id}/status`, { status, userName }),

    generateNarrative: (id: string) =>
        postJson<{ narrative: string; executionId: string; modelVersion: string; templateVersion: string; processingTime: string; confidenceScore: number; tokensUsed: string; timestamp: string; temperature: number }>(
            `/cases/${id}/generate-narrative`,
            {}
        ),

    // Users
    getUsers: () =>
        getJson<Array<{ id: string; name: string; employeeId: string; role: string; department: string; email: string; lastLogin: string; casesHandled: number }>>("/users"),

    // System Logs
    getSystemLogs: (params?: { search?: string; level?: string }) => {
        const q = new URLSearchParams(params as Record<string, string>).toString();
        return getJson<Array<{ id: string; timestamp: string; level: string; category: string; message: string; user: string; ipAddress: string; details: string }>>(`/system-logs${q ? `?${q}` : ""}`);
    },

    // Analytics
    getAnalytics: () =>
        getJson<{
            riskTrend: Array<{ month: string; high: number; medium: number; low: number }>;
            typologyDistribution: Array<{ name: string; value: number; color: string }>;
            processingTime: Array<{ month: string; manual: number; ai: number }>;
            jurisdictionRisk: Array<{ jurisdiction: string; cases: number; avgRisk: number }>;
            keyMetrics: { timeSavedPerReport: string; timeSavedPercentage: string; reportsFiled: number; reportsFiledChange: string; avgConfidenceScore: string };
        }>("/analytics"),
};
