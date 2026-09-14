import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/use-auth";
import { hasAnyPermission } from "@/lib/permissions";
import type { Permission } from "@/config/access-control";
import { hasRole, type UserRole } from "@/types/auth";

export function ProtectedRoute({
  allowedRoles,
  allowedPermissions,
}: {
  allowedRoles?: readonly UserRole[];
  allowedPermissions?: readonly Permission[];
}) {
  const { session, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main
        className="grid min-h-screen place-items-center bg-background"
        role="status"
      >
        <p className="text-sm text-muted-foreground">
          Checking your secure session…
        </p>
      </main>
    );
  }
  if (status === "unauthenticated" || !session) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }
  if (
    allowedRoles &&
    !allowedRoles.some((role) => hasRole(session.roles, role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }
  // Blocks IAM currently returns assigned application roles without expanding
  // their FrontendAction permissions in iam.me(). For an explicitly role-bound
  // route, the allowlist is the client gate and Blocks Data remains the server
  // authorization boundary.
  if (
    !allowedRoles?.length &&
    !hasAnyPermission(session.permissions, allowedPermissions)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
