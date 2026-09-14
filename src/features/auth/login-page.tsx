import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/use-auth";
import { getMissingLoginConfig } from "@/lib/blocks/config";

export function LoginPage() {
  const { login, status } = useAuth();
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const missing = getMissingLoginConfig();
  const returnTo = params.get("returnTo") || "/dashboard";

  if (status === "authenticated") return <Navigate to="/dashboard" replace />;

  async function handleLogin() {
    setPending(true);
    setError("");
    try {
      await login(returnTo);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to start login.",
      );
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary">
            <GraduationCap />
          </span>
          <span className="text-lg font-semibold">CampusCareer</span>
        </div>
        <div className="relative max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight">
            From campus potential to career opportunity.
          </h1>
          <p className="mt-5 leading-7 text-sidebar-foreground">
            One governed workspace for students, employers, career teams,
            applications, outcomes, and placement insight.
          </p>
          <div className="mt-8 space-y-3 text-sm text-sidebar-foreground">
            {[
              "Verified university access",
              "Role-aware career workflows",
              "Auditable placement reporting",
            ].map((item) => (
              <p className="flex items-center gap-3" key={item}>
                <CheckCircle2 className="size-4 text-cyan-300" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-sidebar-foreground/60">
          Protected by SELISE Blocks IAM
        </p>
      </aside>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BriefcaseBusiness />
          </span>
          <p className="mt-7 text-sm font-semibold text-primary">Welcome</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Sign in to CampusCareer
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Continue through the university’s secure identity service.
          </p>
          {missing.length > 0 && (
            <div
              className="mt-5 rounded-lg border border-status-warning/40 bg-status-warning/10 p-3 text-sm"
              role="alert"
            >
              <p className="font-medium">
                Tenant login is awaiting activation.
              </p>
              <p className="mt-1 text-muted-foreground">
                Missing: {missing.join(", ")}
              </p>
            </div>
          )}
          {error && (
            <p
              className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button
            className="mt-6 w-full"
            disabled={pending || missing.length > 0 || status === "loading"}
            onClick={() => void handleLogin()}
          >
            <LogIn className="size-4" />
            {pending ? "Redirecting…" : "Continue to sign in"}
          </Button>
        </div>
      </section>
    </main>
  );
}
