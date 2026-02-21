import { useEffect, useState } from "react";
import { UserRole } from "../context/RoleContext";
import { Users, Shield, Eye, Loader2, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";

type UserProfile = Awaited<ReturnType<typeof api.getUsers>>[number];

const rolePermissions: Record<UserRole, string[]> = {
  Analyst: ["View cases", "Create SAR drafts", "Edit narratives", "Submit for review", "View audit trails"],
  Supervisor: ["All Analyst permissions", "Approve/Reject SARs", "Escalate cases", "Assign cases", "View team analytics", "Override risk scores"],
  Auditor: ["Read-only access to all cases", "Full audit trail visibility", "Export compliance reports", "View system logs", "No editing permissions"],
};

const roleIcons: Record<UserRole, typeof Users> = {
  Analyst: Users,
  Supervisor: Shield,
  Auditor: Eye,
};

const roleColors: Record<UserRole, string> = {
  Analyst: "text-[#0EA5E9]",
  Supervisor: "text-[#8B5CF6]",
  Auditor: "text-[#F59E0B]",
};

export const RoleManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = selectedRole ? users.filter((u) => u.role === selectedRole) : users;

  return (
    <div className="p-6 space-y-6">
      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(rolePermissions) as UserRole[]).map((role) => {
          const Icon = roleIcons[role];
          const count = users.filter((u) => u.role === role).length;
          return (
            <div
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              className={`bg-card border rounded-lg p-6 cursor-pointer transition-all ${selectedRole === role ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${roleColors[role]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-semibold text-foreground">{loading ? "—" : count}</span>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">{role}</h3>
              <p className="text-xs text-muted-foreground">{loading ? "Loading..." : `${count} users assigned`}</p>
            </div>
          );
        })}
      </div>

      {/* Role Permissions */}
      {selectedRole && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">{selectedRole} Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rolePermissions[selectedRole].map((permission, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <span className="text-sm text-foreground">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">User Directory</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading users...</span>
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Employee ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Cases Handled</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const Icon = roleIcons[user.role as UserRole] || Users;
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{user.employeeId}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          <Icon className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.department}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{user.casesHandled}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{user.lastLogin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
