import { createContext } from "react";
import type { Session } from "@/types/auth";

export interface AuthContextValue {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isAuthenticated: boolean;
  login: (returnTo?: string) => Promise<void>;
  refresh: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
