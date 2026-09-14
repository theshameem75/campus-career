export function getEffectivePermissions(
  assignedPermissions: readonly string[],
): ReadonlySet<string> {
  return new Set(
    assignedPermissions.map((permission) => permission.trim().toLowerCase()),
  );
}

export function hasPermission(
  assignedPermissions: readonly string[],
  permission: string,
): boolean {
  return getEffectivePermissions(assignedPermissions).has(
    permission.toLowerCase(),
  );
}

export function hasAnyPermission(
  assignedPermissions: readonly string[],
  required?: readonly string[],
): boolean {
  if (!required?.length) return true;
  const effective = getEffectivePermissions(assignedPermissions);
  return required.some((permission) => effective.has(permission.toLowerCase()));
}
