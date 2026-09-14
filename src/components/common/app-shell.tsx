import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileUser,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { permissions, type Permission } from "@/config/access-control";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";
import { hasAnyPermission } from "@/lib/permissions";
import { hasRole, roleLabels, type UserRole } from "@/types/auth";

const navigation: Array<{
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: readonly UserRole[];
  permissions?: readonly Permission[];
}> = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  {
    label: "My profile & CVs",
    to: "/profile",
    icon: UserRound,
    roles: ["student"],
    permissions: [permissions.manageOwnProfile, permissions.manageOwnDocuments],
  },
  {
    label: "Opportunities",
    to: "/opportunities",
    icon: Search,
    permissions: [
      permissions.browseOpportunities,
      permissions.manageEmployerOpportunities,
      permissions.reviewOpportunities,
    ],
  },
  {
    label: "Applications",
    to: "/applications",
    icon: FileUser,
    roles: [
      "student",
      "career-staff",
      "career-manager",
      "university-superadmin",
    ],
    permissions: [
      permissions.viewOwnApplications,
      permissions.screenApplications,
    ],
  },
  {
    label: "Employer workspace",
    to: "/employer",
    icon: Building2,
    roles: ["employer-user", "university-superadmin"],
    permissions: [permissions.manageEmployerOpportunities],
  },
  {
    label: "Candidates & outcomes",
    to: "/candidates",
    icon: Users,
    roles: ["employer-user", "university-superadmin"],
    permissions: [
      permissions.viewEmployerApplicants,
      permissions.manageEmployerOutcomes,
    ],
  },
  {
    label: "Opportunity approvals",
    to: "/approvals",
    icon: ClipboardCheck,
    roles: ["career-staff", "career-manager", "university-superadmin"],
    permissions: [permissions.reviewOpportunities],
  },
  {
    label: "Follow-up queue",
    to: "/follow-up",
    icon: BriefcaseBusiness,
    roles: ["career-staff", "career-manager", "university-superadmin"],
    permissions: [permissions.manageFollowUp],
  },
  {
    label: "Analytics & reports",
    to: "/analytics",
    icon: BarChart3,
    roles: [
      "career-staff",
      "career-manager",
      "department-stakeholder",
      "university-stakeholder",
      "university-superadmin",
    ],
    permissions: [
      permissions.viewUniversityAnalytics,
      permissions.viewDepartmentAnalytics,
      permissions.viewAggregateAnalytics,
    ],
  },
  {
    label: "Administration",
    to: "/administration",
    icon: Settings,
    roles: ["university-superadmin"],
    permissions: [permissions.manageAccess],
  },
];

export function AppShell() {
  const { session, signOut } = useAuth();
  const visible = navigation
    .filter(
      (item) =>
        !item.roles ||
        item.roles.some((role) =>
          Boolean(session && hasRole(session.roles, role)),
        ),
    )
    .filter(
      (item) =>
        !item.permissions ||
        Boolean(
          session && hasAnyPermission(session.permissions, item.permissions),
        ),
    );
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b bg-sidebar p-4 text-sidebar-foreground lg:min-h-screen lg:border-b-0 lg:border-r lg:border-sidebar-border lg:p-5">
        <div className="flex items-center gap-3 text-sidebar-accent-foreground">
          <span className="grid size-10 place-items-center rounded-xl bg-primary">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="font-semibold">CampusCareer</p>
            <p className="text-xs text-sidebar-foreground">
              University careers
            </p>
          </div>
        </div>
        <nav
          className="mt-6 grid gap-1 sm:grid-cols-2 lg:grid-cols-1"
          aria-label="Primary navigation"
        >
          {visible.map(({ icon: Icon, ...item }) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b bg-card/80 px-5 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-medium">{session?.organization.name}</p>
            <p className="text-xs text-muted-foreground">
              {session ? roleLabels[session.role] : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-[100rem] p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
