import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useRole } from "../context/RoleContext";
import { Shield, AlertCircle, Loader2 } from "lucide-react";

export const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(employeeId, password);
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Prototype Stamp */}
      <div className="absolute top-8 right-8">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600/10 blur-xl rounded-full"></div>
          <div className="relative bg-red-600/90 text-white px-6 py-3 rounded-lg border-4 border-red-500 shadow-2xl">
            <span className="text-2xl font-bold tracking-wider uppercase">PROTOTYPE</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary" />
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Barclays</div>
              <div className="text-xs text-muted-foreground">AML Compliance Platform</div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">SAR Narrative Generator</h1>
          <p className="text-sm text-muted-foreground">Internal AML Compliance Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-foreground mb-2">
                Employee ID
              </label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ex123"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-input rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary bg-input-background border-input rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-foreground">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-4">
          <p className="text-xs text-muted-foreground text-center">
            Authorized internal use only. All activity is monitored and logged.
          </p>

          {/* Demo Credentials */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-primary mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Demo Credentials
            </h3>
            <div className="space-y-2 text-xs text-foreground">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground font-medium">Role</span>
                <span className="text-muted-foreground font-medium">Employee ID</span>
                <span className="text-muted-foreground font-medium">Password</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-foreground">Analyst</span>
                <span className="font-mono text-primary">ex123</span>
                <span className="font-mono text-primary">analyst123</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-foreground">Supervisor</span>
                <span className="font-mono text-primary">ex456</span>
                <span className="font-mono text-primary">supervisor123</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-foreground">Auditor</span>
                <span className="font-mono text-primary">ex789</span>
                <span className="font-mono text-primary">auditor123</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded border border-primary/20">
              Cloud Environment
            </span>
            <span className="text-xs text-muted-foreground">v2.3.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};