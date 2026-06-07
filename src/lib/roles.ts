export const ROLES = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function isStaff(role?: string | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.MODERATOR;
}

export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN;
}

export function isModerator(role?: string | null): boolean {
  return role === ROLES.MODERATOR || role === ROLES.ADMIN;
}

export function staffHomePath(role?: string | null): string | null {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.MODERATOR) return "/moderation";
  return null;
}
