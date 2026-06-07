"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import StaffPageNav from "@/components/StaffPageNav";
import { fetchJson } from "@/lib/fetch-json";
import { isAdmin, ROLES } from "@/lib/roles";
import {
  Users,
  Heart,
  MessageSquare,
  Flag,
  Eye,
  Shield,
  Search,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
} from "lucide-react";

interface Stats {
  users: number;
  profiles: number;
  matches: number;
  messages: number;
  pendingReports: number;
  visits: number;
  byRole: Record<string, number>;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: { completed: boolean; location: string | null };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
    if (status === "authenticated" && !isAdmin(session?.user?.role)) router.push("/decouvrir");
  }, [status, session, router]);

  useEffect(() => {
    if (!isAdmin(session?.user?.role)) return;
    fetchJson<Stats>("/api/admin/stats").then(({ data }) => data && setStats(data));
    fetchJson<{ users: AdminUser[] }>("/api/admin/users").then(({ data }) => data && setUsers(data.users));
  }, [session]);

  async function updateUser(id: string, patch: { role?: string; isActive?: boolean }) {
    setUpdatingId(id);
    await fetchJson(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const { data } = await fetchJson<{ users: AdminUser[] }>("/api/admin/users");
    if (data) setUsers(data.users);
    setUpdatingId(null);
  }

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.profile?.location?.toLowerCase().includes(q) ?? false);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  function roleBadgeClass(role: string) {
    if (role === "ADMIN") return "bg-plum/15 text-plum ring-plum/25";
    if (role === "MODERATOR") return "bg-rose/15 text-rose ring-rose/25";
    return "bg-warm/8 text-warm-muted ring-rose/15";
  }

  if (status === "loading" || !stats) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  const cards = [
    { label: "Utilisateurs", value: stats.users, icon: Users },
    { label: "Profils complets", value: stats.profiles, icon: Heart },
    { label: "Matchs", value: stats.matches, icon: Heart },
    { label: "Messages", value: stats.messages, icon: MessageSquare },
    { label: "Signalements", value: stats.pendingReports, icon: Flag },
    { label: "Visites profil", value: stats.visits, icon: Eye },
  ];

  return (
    <>
      <Header user={session?.user} />
      <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <StaffPageNav backHref="/" backLabel="Retour accueil" role={session?.user?.role} />

        <div className="mb-8 flex items-center gap-3">
          <BrandBadge size="lg" />
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-warm">
              <Shield className="h-6 w-6 text-plum" />
              Administration
            </h1>
            <p className="text-sm text-warm-muted">Tableau de bord AfricanConnect</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-rose/15 bg-white/90 p-5 shadow-sm">
              <c.icon className="h-5 w-5 text-rose" />
              <p className="mt-2 text-2xl font-bold text-warm">{c.value}</p>
              <p className="text-sm text-warm-muted">{c.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 overflow-hidden rounded-2xl border border-rose/15 bg-white/95 shadow-md shadow-rose/5">
          <div className="border-b border-rose/10 bg-gradient-to-r from-cream/80 to-white px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-warm">Gestion des utilisateurs</h2>
                <p className="mt-1 text-sm text-warm-muted">
                  {filteredUsers.length} sur {users.length} membres affichés
                </p>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, email ou ville…"
                  className="w-full rounded-xl border border-rose/20 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["ALL", ...Object.values(ROLES)] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    roleFilter === r
                      ? "gradient-pulse text-white shadow-sm"
                      : "border border-rose/15 bg-white text-warm-muted hover:bg-cream/80"
                  }`}
                >
                  {r === "ALL" ? "Tous" : r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-rose/10 bg-cream/40 text-xs font-semibold uppercase tracking-wide text-warm-muted">
                  <th className="px-6 py-4 sm:px-8">Membre</th>
                  <th className="px-4 py-4">Profil</th>
                  <th className="px-4 py-4">Inscription</th>
                  <th className="px-4 py-4">Rôle</th>
                  <th className="px-4 py-4">Statut</th>
                  <th className="px-6 py-4 sm:px-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-warm-muted">
                      Aucun utilisateur ne correspond à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b border-rose/8 transition-colors hover:bg-rose/5 ${
                        i % 2 === 0 ? "bg-white" : "bg-cream/20"
                      } ${updatingId === u.id ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-5 sm:px-8">
                        <div className="flex items-center gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum/20 to-rose/20 font-serif text-base font-bold text-plum">
                            {u.firstName.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-warm">{u.firstName}</p>
                            <p className="truncate text-sm text-warm-muted">{u.email}</p>
                            {u.profile?.location && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-muted">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {u.profile.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                            u.profile?.completed
                              ? "bg-plum/10 text-plum ring-plum/20"
                              : "bg-rose/8 text-warm ring-rose/15"
                          }`}
                        >
                          {u.profile?.completed ? (
                            <><UserCheck className="h-3.5 w-3.5" /> Complet</>
                          ) : (
                            <><UserX className="h-3.5 w-3.5" /> Incomplet</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="flex items-center gap-1.5 text-sm text-warm-muted">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) => updateUser(u.id, { role: e.target.value })}
                          className={`rounded-xl border-0 px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-rose/30 ${roleBadgeClass(u.role)}`}
                        >
                          {Object.values(ROLES).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-red-50 text-red-700 ring-1 ring-red-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {u.isActive ? "Actif" : "Désactivé"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right sm:px-8">
                        <button
                          type="button"
                          disabled={updatingId === u.id}
                          onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                            u.isActive
                              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? "Désactiver" : "Réactiver"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </>
  );
}
