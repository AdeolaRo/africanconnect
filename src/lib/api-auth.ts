import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES, type UserRole, isAdmin, isModerator } from "@/lib/roles";

/** Session valide + compte toujours actif en base */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });
  if (!user?.isActive) return null;

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
