import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/common/app-shell";
import { permissions } from "@/config/access-control";
import { CallbackPage } from "@/features/auth/callback-page";
import { LoginPage } from "@/features/auth/login-page";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { UnauthorizedPage } from "@/features/auth/unauthorized-page";
import { ApplicationsPage } from "@/features/applications/applications-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import type { UserRole } from "@/types/auth";
import { OpportunitiesPage } from "@/features/opportunities/opportunities-page";
import { AdministrationPage, AnalyticsPage, FollowUpPage, StudentProfilePage } from "@/features/workspaces/workspace-pages";

const staff: readonly UserRole[] = [
  "career-staff",
  "career-manager",
  "university-superadmin",
];
const employer: readonly UserRole[] = [
  "employer-user",
  "university-superadmin",
];
const reporting: readonly UserRole[] = [
  "career-staff",
  "career-manager",
  "department-stakeholder",
  "university-stakeholder",
  "university-superadmin",
];

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/login/callback", element: <CallbackPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          {
            element: (
              <ProtectedRoute
                allowedRoles={["student"]}
                allowedPermissions={[
                  permissions.manageOwnProfile,
                  permissions.manageOwnDocuments,
                ]}
              />
            ),
            children: [
              {
                path: "/profile",
                element: <StudentProfilePage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={["student", "employer-user", ...staff]}
                allowedPermissions={[
                  permissions.browseOpportunities,
                  permissions.manageEmployerOpportunities,
                  permissions.reviewOpportunities,
                ]}
              />
            ),
            children: [
              {
                path: "/opportunities",
                element: <OpportunitiesPage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={["student", ...staff]}
                allowedPermissions={[
                  permissions.viewOwnApplications,
                  permissions.screenApplications,
                ]}
              />
            ),
            children: [
              {
                path: "/applications",
                element: <ApplicationsPage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={employer}
                allowedPermissions={[
                  permissions.manageEmployerOpportunities,
                  permissions.viewEmployerApplicants,
                ]}
              />
            ),
            children: [
              {
                path: "/employer",
                element: <OpportunitiesPage mode="employer" />,
              },
              {
                path: "/candidates",
                element: <ApplicationsPage employerView />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={staff}
                allowedPermissions={[
                  permissions.reviewOpportunities,
                  permissions.manageFollowUp,
                ]}
              />
            ),
            children: [
              {
                path: "/approvals",
                element: <OpportunitiesPage mode="approval" />,
              },
              {
                path: "/follow-up",
                element: <FollowUpPage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={reporting}
                allowedPermissions={[
                  permissions.viewUniversityAnalytics,
                  permissions.viewDepartmentAnalytics,
                  permissions.viewAggregateAnalytics,
                ]}
              />
            ),
            children: [
              {
                path: "/analytics",
                element: <AnalyticsPage />,
              },
            ],
          },
          {
            element: (
              <ProtectedRoute
                allowedRoles={["university-superadmin"]}
                allowedPermissions={[permissions.manageAccess]}
              />
            ),
            children: [
              {
                path: "/administration",
                element: <AdministrationPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
