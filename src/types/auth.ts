export const userRoles = [
  "pending-user",
  "student",
  "employer-user",
  "career-staff",
  "career-manager",
  "department-stakeholder",
  "university-stakeholder",
  "university-superadmin",
] as const;

export type UserRole = (typeof userRoles)[number];

export interface Session {
  user: { id: string; name: string; email: string };
  role: UserRole;
  roles: string[];
  permissions: string[];
  organization: { id: string; name: string };
}

export const roleLabels: Record<UserRole, string> = {
  "pending-user": "Pending verification",
  student: "Student",
  "employer-user": "Employer",
  "career-staff": "Career staff",
  "career-manager": "Career manager",
  "department-stakeholder": "Department stakeholder",
  "university-stakeholder": "University stakeholder",
  "university-superadmin": "University superadmin",
};

export function hasRole(roles: readonly string[], role: UserRole): boolean {
  return roles.some(
    (value) => value.trim().toLowerCase().replaceAll("_", "-") === role,
  );
}
