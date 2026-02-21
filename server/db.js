/**
 * db.js — JSON file-based datastore (no native dependencies)
 * Initialises and persists all application data to data.json in the server/ directory.
 */

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "data.json");

// ─── Default seed data ───────────────────────────────────────────────────────

function createSeedData() {
  const users = [
    {
      id: uuidv4(), employee_id: "ex123", password: "analyst123",
      name: "Emily Watson", role: "Analyst",
      department: "AML Compliance", email: "emily.watson@barclays.com",
      last_login: "2026-02-21 08:45:12", cases_handled: 47,
    },
    {
      id: uuidv4(), employee_id: "ex456", password: "supervisor123",
      name: "James Patel", role: "Supervisor",
      department: "AML Compliance", email: "james.patel@barclays.com",
      last_login: "2026-02-21 09:12:34", cases_handled: 124,
    },
    {
      id: uuidv4(), employee_id: "ex789", password: "auditor123",
      name: "Sarah Chen", role: "Auditor",
      department: "Internal Audit", email: "sarah.chen@barclays.com",
      last_login: "2026-02-20 16:30:00", cases_handled: 0,
    },
    {
      id: uuidv4(), employee_id: "ex321", password: "analyst321",
      name: "Michael Rodriguez", role: "Analyst",
      department: "AML Compliance", email: "michael.rodriguez@barclays.com",
      last_login: "2026-02-21 07:55:00", cases_handled: 38,
    },
    {
      id: uuidv4(), employee_id: "ex654", password: "analyst654",
      name: "Priya Sharma", role: "Analyst",
      department: "Financial Crime", email: "priya.sharma@barclays.com",
      last_login: "2026-02-21 10:05:23", cases_handled: 52,
    },
  ];

  const cases = [
    {
      id: "SAR-2026-00234", customer_name: "Jonathan Martinez", customer_id: "CUS-892456",
      risk_level: "High", status: "Under Review", amount: "£1,245,000", date: "2026-02-14",
      analyst: "Emily Watson",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-02-14 09:23:11", updated_at: "2026-02-18 14:32:00",
    },
    {
      id: "SAR-2026-00231", customer_name: "Priya Sharma", customer_id: "CUS-445212",
      risk_level: "High", status: "Approved", amount: "£890,500", date: "2026-02-12",
      analyst: "Emily Watson",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-02-12 11:10:00", updated_at: "2026-02-15 09:20:00",
    },
    {
      id: "SAR-2026-00227", customer_name: "Wang Trading Ltd", customer_id: "CUS-778934",
      risk_level: "Medium", status: "Draft", amount: "£445,200", date: "2026-02-09",
      analyst: "Michael Rodriguez",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-02-09 14:00:00", updated_at: "2026-02-09 14:00:00",
    },
    {
      id: "SAR-2026-00219", customer_name: "Robert Klein", customer_id: "CUS-223451",
      risk_level: "High", status: "Filed", amount: "£2,100,000", date: "2026-02-05",
      analyst: "Emily Watson",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-02-05 10:00:00", updated_at: "2026-02-10 16:45:00",
    },
    {
      id: "SAR-2026-00215", customer_name: "Amari Financial Services", customer_id: "CUS-667823",
      risk_level: "Medium", status: "Submitted", amount: "£678,900", date: "2026-02-03",
      analyst: "Priya Sharma",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-02-03 09:30:00", updated_at: "2026-02-06 11:00:00",
    },
    {
      id: "SAR-2026-00208", customer_name: "Elena Volkov", customer_id: "CUS-334567",
      risk_level: "Low", status: "Filed", amount: "£123,400", date: "2026-01-29",
      analyst: "Michael Rodriguez",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-01-29 13:00:00", updated_at: "2026-02-02 10:00:00",
    },
    {
      id: "SAR-2026-00201", customer_name: "Nadia Okonkwo", customer_id: "CUS-889023",
      risk_level: "High", status: "Rejected", amount: "£567,800", date: "2026-01-25",
      analyst: "Priya Sharma",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-01-25 08:00:00", updated_at: "2026-01-28 15:30:00",
    },
    {
      id: "SAR-2026-00195", customer_name: "Goldstream Corp", customer_id: "CUS-112345",
      risk_level: "Medium", status: "Under Review", amount: "£892,100", date: "2026-01-20",
      analyst: "Emily Watson",
      narrative: null, execution_id: null, model_version: null, template_version: null,
      processing_time: null, confidence_score: null, tokens_used: null,
      created_at: "2026-01-20 12:00:00", updated_at: "2026-01-22 09:00:00",
    },
  ];

  const audit_logs = [
    {
      id: uuidv4(), case_id: "SAR-2026-00234",
      timestamp: "2026-02-14 09:23:11", action: "Alert Ingested",
      user_name: "System", details: "Alert ALT-2026-04821 ingested from Transaction Monitoring System",
    },
    {
      id: uuidv4(), case_id: "SAR-2026-00234",
      timestamp: "2026-02-14 09:25:02", action: "Risk Scoring Completed",
      user_name: "System (AI)", details: "Initial risk score: 78/100 — High Risk",
    },
    {
      id: uuidv4(), case_id: "SAR-2026-00234",
      timestamp: "2026-02-14 09:25:15", action: "Case Assigned",
      user_name: "System", details: "Assigned to Analyst: Emily Watson",
    },
    {
      id: uuidv4(), case_id: "SAR-2026-00234",
      timestamp: "2026-02-18 10:45:00", action: "Submitted for Review",
      user_name: "Emily Watson", details: "SAR draft submitted for supervisor review",
    },
  ];

  const system_logs = [
    {
      id: uuidv4(), timestamp: "2026-02-21 10:05:23", level: "Success",
      category: "Authentication", message: "User login successful",
      user_name: "Priya Sharma", ip_address: "192.168.1.45", details: "ex654 authenticated via SSO",
    },
    {
      id: uuidv4(), timestamp: "2026-02-21 09:12:34", level: "Success",
      category: "Authentication", message: "User login successful",
      user_name: "James Patel", ip_address: "192.168.1.23", details: "ex456 authenticated via SSO",
    },
    {
      id: uuidv4(), timestamp: "2026-02-21 08:45:12", level: "Success",
      category: "Authentication", message: "User login successful",
      user_name: "Emily Watson", ip_address: "192.168.1.67", details: "ex123 authenticated via SSO",
    },
    {
      id: uuidv4(), timestamp: "2026-02-20 16:30:00", level: "Info",
      category: "SAR Generation", message: "SAR narrative generation initiated",
      user_name: "Emily Watson", ip_address: "192.168.1.67", details: "Case: SAR-2026-00231",
    },
    {
      id: uuidv4(), timestamp: "2026-02-20 15:52:11", level: "Warning",
      category: "Rule Engine", message: "High-risk alert threshold breached",
      user_name: "System", ip_address: "10.0.0.5", details: "Case SAR-2026-00234: Score 78/100",
    },
    {
      id: uuidv4(), timestamp: "2026-02-20 14:20:33", level: "Error",
      category: "API Integration", message: "External sanctions screening API timeout",
      user_name: "System", ip_address: "10.0.0.5", details: "Endpoint: /api/sanctions-check — Timeout after 30s. Retrying…",
    },
    {
      id: uuidv4(), timestamp: "2026-02-20 12:05:44", level: "Info",
      category: "Case Management", message: "Case status updated",
      user_name: "James Patel", ip_address: "192.168.1.23", details: "SAR-2026-00231: Under Review → Approved",
    },
    {
      id: uuidv4(), timestamp: "2026-02-19 11:30:22", level: "Success",
      category: "Data Export", message: "Compliance report exported",
      user_name: "Sarah Chen", ip_address: "192.168.1.89", details: "Monthly SAR report exported as PDF",
    },
    {
      id: uuidv4(), timestamp: "2026-02-19 09:15:55", level: "Info",
      category: "System", message: "Scheduled database backup completed",
      user_name: "System", ip_address: "10.0.0.1", details: "Backup size: 2.3 GB — stored in S3",
    },
    {
      id: uuidv4(), timestamp: "2026-02-18 16:45:00", level: "Warning",
      category: "Authentication", message: "Failed login attempt",
      user_name: "Unknown", ip_address: "203.0.113.42", details: "3 consecutive failed login attempts — IP monitored",
    },
  ];

  return { users, cases, audit_logs, system_logs };
}

// ─── Load/save helpers ───────────────────────────────────────────────────────

function load() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
      // corrupt file — reinit
    }
  }
  const data = createSeedData();
  save(data);
  console.log("✅ Database seeded (data.json)");
  return data;
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ─── Singleton state ─────────────────────────────────────────────────────────

let _data = load();

const db = {
  // Expose raw getters / setters
  get data() { return _data; },

  // Helpers
  findUser(employeeId, password) {
    return _data.users.find((u) => u.employee_id === employeeId && u.password === password) || null;
  },
  updateUserLogin(id) {
    const u = _data.users.find((u) => u.id === id);
    if (u) u.last_login = new Date().toISOString().replace("T", " ").substring(0, 19);
    save(_data);
  },
  getUsers() {
    return _data.users;
  },

  getCases(search, risk, status) {
    let result = [..._data.cases];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(s) ||
          c.customer_name.toLowerCase().includes(s) ||
          c.customer_id.toLowerCase().includes(s)
      );
    }
    if (risk) result = result.filter((c) => c.risk_level === risk);
    if (status) result = result.filter((c) => c.status === status);
    result.sort((a, b) => b.date.localeCompare(a.date));
    return result;
  },
  getCase(id) {
    return _data.cases.find((c) => c.id === id) || null;
  },
  updateCaseStatus(id, newStatus) {
    const c = _data.cases.find((c) => c.id === id);
    if (c) {
      c.status = newStatus;
      c.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
      save(_data);
    }
    return c;
  },
  updateCaseNarrative(id, { narrative, executionId, modelVersion, templateVersion, processingTime, confidenceScore, tokensUsed }) {
    const c = _data.cases.find((c) => c.id === id);
    if (c) {
      Object.assign(c, {
        narrative, execution_id: executionId, model_version: modelVersion,
        template_version: templateVersion, processing_time: processingTime,
        confidence_score: confidenceScore, tokens_used: tokensUsed,
        updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      save(_data);
    }
    return c;
  },

  getAuditLogs(caseId) {
    return _data.audit_logs.filter((l) => l.case_id === caseId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  },
  addAuditLog(log) {
    _data.audit_logs.push(log);
    save(_data);
  },

  getSystemLogs(search, level) {
    let result = [..._data.system_logs];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(s) ||
          l.category.toLowerCase().includes(s) ||
          (l.user_name || "").toLowerCase().includes(s)
      );
    }
    if (level) result = result.filter((l) => l.level === level);
    result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return result;
  },
  addSystemLog(log) {
    _data.system_logs.unshift(log);
    save(_data);
  },
};

module.exports = db;
