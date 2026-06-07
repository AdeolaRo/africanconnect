"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import { fetchJson } from "@/lib/fetch-json";
import { isAdmin, ROLES } from "@/lib/roles";
import { Users, Heart, MessageSquare, Flag, Eye, Shield } from "lucide-react";

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
    await fetchJson(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const { data } = await fetchJson<{ users: AdminUser[] }>("/api/admin/users");
    if (data) setUsers(data.users);
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
      <main className="mx-auto max-w-6xl px-4 py-10">
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

        <section className="mt-10 rounded-2xl border border-rose/15 bg-white/90 shadow-sm">
          <div className="border-b border-rose/10 px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-warm">Gestion des utilisateurs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/50 text-warm-muted">
                <tr>
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-rose/10">
                    <td className="px-4 py-3">
                      <p className="font-medium text-warm">{u.firstName}</p>
                      <p className="text-xs text-warm-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value })}
                        className="rounded-lg border border-rose/20 px-2 py-1"
                      >
                        {Object.values(ROLES).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.isActive ? "text-plum" : "text-rose"}>
                        {u.isActive ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                        className="text-xs text-rose hover:underline"
                      >
                        {u.isActive ? "Désactiver" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-center text-sm text-warm-muted">
          <a href="/moderation" className="text-rose hover:underline">Accéder à la modération →</a>
        </p>
      </main>
    </>
  );
}
