export const ROLES = ["student", "tutor", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const ROUTES = {
  home: "/",
  signIn: "/signIn",
  dashboard: "/dashboard",
} as const;

export const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/dashboard/student",
  tutor: "/dashboard/tutor",
  admin: "/dashboard/admin",
};

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (ROLES as readonly string[]).includes(value);

/** Session user theke role ber kore. Role invalid/missing hole null. */
export const getUserRole = (user: unknown): Role | null => {
  const role = (user as { role?: unknown } | null | undefined)?.role;
  return isRole(role) ? role : null;
};