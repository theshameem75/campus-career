import { useAuth } from "@/features/auth/use-auth";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";

export function usePermission(permission: string): boolean {
  const { session } = useAuth();
  return Boolean(session && hasPermission(session.permissions, permission));
}

export function useAnyPermission(permissions: readonly string[]): boolean {
  const { session } = useAuth();
  return Boolean(session && hasAnyPermission(session.permissions, permissions));
}
