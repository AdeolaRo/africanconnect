import { auth } from "@/lib/auth";
import { ROLES, type UserRole, isAdmin, isModerator } from "@/lib/roles";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function requireRole(allowed: UserRole[]) {
  const session = await requireAuth();
  if (!session) return { error: "Non autorisé", status: 401 as const, session: null };
  const role = (session.user.role ?? ROLES.USER) as UserRole;
  if (!allowed.includes(role)) {
    return { error: "Accès refusé", status: 403 as const, session: null };
  }
  return { error: null, status: 200 as const, session };
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return { error: "Non autorisé", status: 401 as const, session: null };
  if (!isAdmin(session.user.role)) {
    return { error: "Accès admin requis", status: 403 as const, session: null };
  }
  return { error: null, status: 200 as const, session };
}

export async function requireModerator() {
  const session = await requireAuth();
  if (!session) return { error: "Non autorisé", status: 401 as const, session: null };
  if (!isModerator(session.user.role)) {
    return { error: "Accès modération requis", status: 403 as const, session: null };
  }
  return { error: null, status: 200 as const, session };
}
