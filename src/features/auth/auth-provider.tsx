import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "@/features/auth/auth-context";
import { endSession, startLogin } from "@/lib/blocks/auth";
import { getBlocksClient } from "@/lib/blocks/client";
import { isLoginConfigured } from "@/lib/blocks/config";
import { userRoles, type Session, type UserRole } from "@/types/auth";

const STATUS_POLL_MS = 5 * 60 * 1000;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function primaryRole(roles: string[]): UserRole {
  const normalized = roles.map((role) =>
    role.trim().toLowerCase().replaceAll("_", "-"),
  );
  return (
    [...userRoles].reverse().find((role) => normalized.includes(role)) ??
    "pending-user"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const refresh = useCallback(async () => {
    if (!isLoginConfigured()) {
      setSession(null);
      setStatus("unauthenticated");
      return false;
    }
    try {
      const blocks = getBlocksClient();
      if (!(await blocks.auth.isAuthenticated()))
        throw new Error("No active session");
      const [claims, response] = await Promise.all([
        blocks.auth.userInfo(),
        blocks.iam.me(),
      ]);
      const profile = response.data ?? {};
      const roles = profile.roles ?? [];
      const email = text(profile.email, text(claims.email));
      const name =
        [text(profile.firstName), text(profile.lastName)]
          .filter(Boolean)
          .join(" ") || text(claims.name, email || "CampusCareer user");
      setSession({
        user: {
          id: text(profile.itemId, text(claims.sub)),
          name,
          email,
        },
        role: primaryRole(roles),
        roles,
        permissions: profile.permissions ?? [],
        organization: {
          id: text(profile.organizationId),
          name: text(profile.organizationName, "University workspace"),
        },
      });
      setStatus("authenticated");
      return true;
    } catch {
      setSession(null);
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), STATUS_POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await endSession();
    } finally {
      setSession(null);
      setStatus("unauthenticated");
      window.location.assign("/login");
    }
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      isAuthenticated: status === "authenticated",
      login: startLogin,
      refresh,
      signOut,
    }),
    [refresh, session, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
