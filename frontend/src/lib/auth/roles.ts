export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  DATA_ANALYSIST: "data_analyst",
  PRODUCT_INSIGHT_ANALYSIST: "product_insight_analyst",
  COMPANY_ADMIN: "company_admin",
  SYSTEM_ADMIN: "system_admin",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export function parseRoles(roleStr: string | null | undefined): Role[] {
  if (!roleStr) return [];
  return roleStr
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean) as Role[];
}

export function hasRole(roles: Role[], role: Role): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: Role[], candidates: Role[]): boolean {
  return candidates.some((r) => roles.includes(r));
}
