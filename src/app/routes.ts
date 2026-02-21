import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { GenerateSAR } from "./pages/GenerateSAR";
import { AuditTrail } from "./pages/AuditTrail";
import { CaseHistory } from "./pages/CaseHistory";
import { RiskAnalytics } from "./pages/RiskAnalytics";
import { RoleManagement } from "./pages/RoleManagement";
import { SystemLogs } from "./pages/SystemLogs";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "generate-sar", Component: GenerateSAR },
      { path: "audit-trail", Component: AuditTrail },
      { path: "audit-trail/:caseId", Component: AuditTrail },
      { path: "case-history", Component: CaseHistory },
      { path: "risk-analytics", Component: RiskAnalytics },
      { path: "role-management", Component: RoleManagement },
      { path: "system-logs", Component: SystemLogs },
    ],
  },
]);