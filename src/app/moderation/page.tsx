"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import StaffPageNav from "@/components/StaffPageNav";
import ModerationThreadPanel, { ModerationThreadRow, type ModThread } from "@/components/ModerationThreadPanel";
import { fetchJson } from "@/lib/fetch-json";
import { isModerator } from "@/lib/roles";
import {
  Flag,
  Check,
  X,
  MessageSquare,
  Star,
  User,
  Trash2,
  EyeOff,
  Ban,
  Shield,
  Search,
  Calendar,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface Report {
  id: string;
  targetType: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { firstName: string };
}

interface Testimonial {
  id: string;
  content: string;
  rating: number | null;
  status: string;
  authorName: string;
  targetName: string;
  createdAt: string;
}

interface ModProfile {
  id: string;
  email: string;
  firstName: string;
  isActive: boolean;
  flagged: boolean;
  profile: {
    bio: string | null;
    profileTitle: string | null;
    location: string | null;
    profession: string | null;
    discoverVisible: boolean;
    completed: boolean;
    verified: boolean;
  } | null;
}

type Tab = "messages" | "commentaires" | "profils" | "signalements";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
    RESOLVED: "bg-plum/10 text-plum ring-plum/20",
    DISMISSED: "bg-warm/8 text-warm-muted ring-rose/15",
  };
  return map[status] ?? "bg-cream text-warm-muted ring-rose/15";
}

function SectionShell({
  title,
  subtitle,
  children,
  toolbar,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-rose/15 bg-white/95 shadow-md shadow-rose/5">
      <div className="border-b border-rose/10 bg-gradient-to-r from-cream/80 to-white px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-warm">{title}</h2>
            <p className="mt-1 text-sm text-warm-muted">{subtitle}</p>
          </div>
          {toolbar}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("messages");
  const [filter, setFilter] = useState("PENDING");
  const [reports, setReports] = useState<Report[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [msgThreads, setMsgThreads] = useState<ModThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ModThread | null>(null);
  const [profiles, setProfiles] = useState<ModProfile[]>([]);
  const [profileSearch, setProfileSearch] = useState("");
  const [msgSearch, setMsgSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
    if (status === "authenticated" && !isModerator(session?.user?.role)) router.push("/decouvrir");
  }, [status, session, router]);

  async function loadReports() {
    setLoading(true);
    const { data } = await fetchJson<{ reports: Report[] }>(`/api/moderation/reports?status=${filter}`);
    if (data) setReports(data.reports);
    setLoading(false);
  }

  async function loadTestimonials() {
    setLoading(true);
    const { data } = await fetchJson<{ testimonials: Testimonial[] }>(
      `/api/moderation/testimonials?status=${filter}`
    );
    if (data) setTestimonials(data.testimonials);
    setLoading(false);
  }

  async function loadMessages() {
    setLoading(true);
    const { data } = await fetchJson<{ threads: ModThread[] }>("/api/moderation/content/messages?limit=100");
    if (data) setMsgThreads(data.threads);
    setLoading(false);
  }

  async function loadProfiles() {
    setLoading(true);
    const q = profileSearch.trim();
    const url = q
      ? `/api/moderation/content/profiles?q=${encodeURIComponent(q)}`
      : "/api/moderation/content/profiles";
    const { data } = await fetchJson<{ profiles: ModProfile[] }>(url);
    if (data) setProfiles(data.profiles);
    setLoading(false);
  }

  useEffect(() => {
    if (!isModerator(session?.user?.role)) return;
    if (tab === "signalements") loadReports();
    else if (tab === "commentaires") loadTestimonials();
    else if (tab === "messages") loadMessages();
    else if (tab === "profils") loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, filter, tab]);

  useEffect(() => {
    if (tab !== "profils" || !isModerator(session?.user?.role)) return;
    const t = setTimeout(loadProfiles, profileSearch ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileSearch, tab, session]);

  async function deleteTestimonial(id: string) {
    if (!confirm("Supprimer définitivement ce commentaire ?")) return;
    await fetchJson(`/api/moderation/testimonials/${id}`, { method: "DELETE" });
    loadTestimonials();
  }

  async function profileAction(userId: string, action: string) {
    if (action === "deactivate" && !confirm("Désactiver ce compte ?")) return;
    await fetchJson(`/api/moderation/content/profiles/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadProfiles();
  }

  async function moderateTestimonial(id: string, action: "APPROVED" | "REJECTED") {
    await fetchJson(`/api/moderation/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadTestimonials();
  }

  async function resolveReport(id: string, action: "RESOLVED" | "DISMISSED") {
    await fetchJson(`/api/moderation/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, resolution: action === "RESOLVED" ? "Contenu traité" : "Non fondé" }),
    });
    loadReports();
  }

  const tabs: { id: Tab; label: string; icon: typeof MessageSquare; count?: number }[] = [
    { id: "messages", label: "Messages", icon: MessageSquare, count: msgThreads.length },
    { id: "commentaires", label: "Commentaires", icon: Star, count: testimonials.length },
    { id: "profils", label: "Profils", icon: User, count: profiles.length },
    { id: "signalements", label: "Signalements", icon: Flag, count: reports.length },
  ];

  const filteredThreads = msgThreads.filter((t) => {
    const q = msgSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      t.lastMessage.toLowerCase().includes(q) ||
      t.userA.firstName.toLowerCase().includes(q) ||
      t.userB.firstName.toLowerCase().includes(q) ||
      t.userA.email.toLowerCase().includes(q) ||
      t.userB.email.toLowerCase().includes(q)
    );
  });

  const filterOptions =
    tab === "commentaires"
      ? [
          { id: "PENDING", label: "En attente" },
          { id: "APPROVED", label: "Approuvés" },
          { id: "REJECTED", label: "Rejetés" },
          { id: "ALL", label: "Tous" },
        ]
      : [
          { id: "PENDING", label: "En attente" },
          { id: "RESOLVED", label: "Résolus" },
          { id: "DISMISSED", label: "Rejetés" },
          { id: "ALL", label: "Tous" },
        ];

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container-wide">
        <StaffPageNav
          backHref={session?.user?.role === "ADMIN" ? "/admin" : "/"}
          backLabel={session?.user?.role === "ADMIN" ? "Retour admin" : "Retour accueil"}
          role={session?.user?.role}
        />

        <div className="mb-8 flex items-center gap-3">
          <BrandBadge size="lg" />
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-warm">
              <Shield className="h-6 w-6 text-plum" />
              Modération
            </h1>
            <p className="text-sm text-warm-muted">
              Messages · Commentaires · Profils · Signalements — filtre automatique actif
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:mb-6 md:flex-wrap md:overflow-visible md:pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setFilter(t.id === "signalements" || t.id === "commentaires" ? "PENDING" : "ALL");
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors md:px-5 ${
                tab === t.id
                  ? "gradient-pulse text-white shadow-sm"
                  : "border border-rose/15 bg-white text-warm-muted hover:bg-cream/80"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {tab === t.id && t.count !== undefined && (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {(tab === "commentaires" || tab === "signalements") && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            {filterOptions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? "bg-rose/15 text-rose ring-1 ring-rose/20"
                    : "text-warm-muted hover:bg-cream/80 hover:text-warm"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="mb-4 text-sm text-warm-muted">Chargement…</p>
        )}

        {tab === "messages" && (
          <SectionShell
            title="Conversations à modérer"
            subtitle={`${filteredThreads.length} conversation${filteredThreads.length > 1 ? "s" : ""} — cliquez pour voir le fil`}
            toolbar={
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-muted" />
                <input
                  type="search"
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Filtrer par membre ou contenu…"
                  className="w-full rounded-xl border border-rose/20 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                />
              </div>
            }
          >
            <div className="divide-y divide-rose/8 p-2 md:p-0">
              {filteredThreads.length === 0 ? (
                <p className="px-5 py-12 text-center text-warm-muted">Aucune conversation</p>
              ) : (
                filteredThreads.map((t) => (
                  <ModerationThreadRow key={t.threadKey} thread={t} onOpen={setSelectedThread} />
                ))
              )}
            </div>
          </SectionShell>
        )}

        <ModerationThreadPanel
          thread={selectedThread}
          onClose={() => setSelectedThread(null)}
          onDeleted={loadMessages}
        />

        {tab === "commentaires" && (
          <SectionShell
            title="Commentaires / témoignages"
            subtitle={`${testimonials.length} élément${testimonials.length > 1 ? "s" : ""}`}
          >
            <div className="space-y-3 p-4 md:hidden">
              {testimonials.length === 0 ? (
                <p className="py-8 text-center text-sm text-warm-muted">Aucun commentaire</p>
              ) : (
                testimonials.map((t) => (
                  <article key={t.id} className="mobile-card">
                    <p className="text-sm font-semibold text-warm">{t.authorName} → {t.targetName}</p>
                    <p className="mt-2 line-clamp-4 text-sm italic text-warm-muted">&ldquo;{t.content}&rdquo;</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.rating && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-plum">
                          <Star className="h-3 w-3 fill-plum" /> {t.rating}/5
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusBadge(t.status)}`}>{t.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.status === "PENDING" && (
                        <>
                          <button type="button" onClick={() => moderateTestimonial(t.id, "APPROVED")} className="flex-1 rounded-full bg-emerald-50 py-2 text-xs font-medium text-emerald-700">Approuver</button>
                          <button type="button" onClick={() => moderateTestimonial(t.id, "REJECTED")} className="flex-1 rounded-full border py-2 text-xs text-warm-muted">Rejeter</button>
                        </>
                      )}
                      <button type="button" onClick={() => deleteTestimonial(t.id)} className="w-full rounded-full border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-700">Supprimer</button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-left">
                <thead>
                  <tr className="border-b border-rose/10 bg-cream/40 text-xs font-semibold uppercase tracking-wide text-warm-muted">
                    <th className="px-6 py-4 sm:px-8">Auteur → Cible</th>
                    <th className="px-4 py-4">Commentaire</th>
                    <th className="px-4 py-4">Note</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-6 py-4 sm:px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-warm-muted">
                        Aucun commentaire dans cette catégorie
                      </td>
                    </tr>
                  ) : (
                    testimonials.map((t, i) => (
                      <tr
                        key={t.id}
                        className={`border-b border-rose/8 hover:bg-rose/5 ${i % 2 === 0 ? "bg-white" : "bg-cream/20"}`}
                      >
                        <td className="px-6 py-5 sm:px-8">
                          <p className="text-sm font-semibold text-warm">{t.authorName}</p>
                          <p className="text-xs text-warm-muted">→ {t.targetName}</p>
                          <p className="mt-1 text-xs text-warm-muted">
                            {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </td>
                        <td className="max-w-sm px-4 py-5">
                          <p className="line-clamp-4 text-sm italic leading-relaxed text-warm">&ldquo;{t.content}&rdquo;</p>
                        </td>
                        <td className="px-4 py-5">
                          {t.rating ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-plum">
                              <Star className="h-4 w-4 fill-plum text-plum" /> {t.rating}/5
                            </span>
                          ) : (
                            <span className="text-xs text-warm-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 sm:px-8">
                          <div className="flex flex-wrap justify-end gap-2">
                            {t.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => moderateTestimonial(t.id, "APPROVED")}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approuver
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moderateTestimonial(t.id, "REJECTED")}
                                  className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-3 py-1.5 text-xs font-medium text-warm-muted hover:bg-cream"
                                >
                                  <X className="h-3.5 w-3.5" /> Rejeter
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteTestimonial(t.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionShell>
        )}

        {tab === "profils" && (
          <SectionShell
            title="Profils signalés"
            subtitle={`${profiles.length} profil${profiles.length > 1 ? "s" : ""}`}
            toolbar={
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-muted" />
                <input
                  type="search"
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Rechercher par prénom ou email…"
                  className="w-full rounded-xl border border-rose/20 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                />
              </div>
            }
          >
            <div className="space-y-3 p-4 md:hidden">
              {profiles.length === 0 ? (
                <p className="py-8 text-center text-sm text-warm-muted">Aucun profil trouvé</p>
              ) : (
                profiles.map((p) => (
                  <article key={p.id} className={`mobile-card ${p.flagged ? "border-amber-200 bg-amber-50/30" : ""}`}>
                    <p className="font-semibold text-warm">{p.firstName}</p>
                    <p className="truncate text-xs text-warm-muted">{p.email}</p>
                    {p.profile?.bio && <p className="mt-2 line-clamp-2 text-sm italic text-warm-muted">&ldquo;{p.profile.bio}&rdquo;</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className={p.isActive ? "text-emerald-700" : "text-red-700"}>{p.isActive ? "Actif" : "Désactivé"}</span>
                      {p.flagged && <span className="text-amber-800">Signalé</span>}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => profileAction(p.id, "hide_discover")} className="rounded-full border py-2 text-xs">Masquer</button>
                      <button type="button" onClick={() => profileAction(p.id, p.isActive ? "deactivate" : "reactivate")} className={`rounded-full py-2 text-xs font-medium ${p.isActive ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {p.isActive ? "Désactiver" : "Réactiver"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-rose/10 bg-cream/40 text-xs font-semibold uppercase tracking-wide text-warm-muted">
                    <th className="px-6 py-4 sm:px-8">Membre</th>
                    <th className="px-4 py-4">Profil</th>
                    <th className="px-4 py-4">État</th>
                    <th className="px-6 py-4 sm:px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-warm-muted">
                        Aucun profil trouvé
                      </td>
                    </tr>
                  ) : (
                    profiles.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`border-b border-rose/8 hover:bg-rose/5 ${
                          p.flagged ? "bg-amber-50/50" : i % 2 === 0 ? "bg-white" : "bg-cream/20"
                        }`}
                      >
                        <td className="px-6 py-5 sm:px-8">
                          <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum/20 to-rose/20 font-serif text-base font-bold text-plum">
                              {p.firstName.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 text-base font-semibold text-warm">
                                {p.firstName}
                                {p.flagged && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                    <AlertTriangle className="h-3 w-3" /> Signalé
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-sm text-warm-muted">{p.email}</p>
                              {p.profile?.location && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-muted">
                                  <MapPin className="h-3 w-3" /> {p.profile.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="max-w-sm px-4 py-5">
                          {p.profile?.profileTitle && (
                            <p className="text-sm font-medium text-rose">{p.profile.profileTitle}</p>
                          )}
                          {p.profile?.bio && (
                            <p className="mt-1 line-clamp-2 text-sm italic text-warm-muted">&ldquo;{p.profile.bio}&rdquo;</p>
                          )}
                          <p className="mt-1 text-xs text-warm-muted">
                            {[p.profile?.profession, p.profile?.verified && "Vérifié"].filter(Boolean).join(" · ")}
                          </p>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                p.isActive
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                  : "bg-red-50 text-red-700 ring-red-200"
                              }`}
                            >
                              {p.isActive ? "Actif" : "Désactivé"}
                            </span>
                            {!p.profile?.discoverVisible && (
                              <span className="inline-flex w-fit rounded-full bg-warm/8 px-3 py-1 text-xs text-warm-muted ring-1 ring-rose/15">
                                Masqué Découvrir
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 sm:px-8">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => profileAction(p.id, "clear_bio")}
                              className="rounded-full border border-rose/20 px-3 py-1.5 text-xs font-medium text-warm-muted hover:bg-cream"
                            >
                              Effacer bio
                            </button>
                            <button
                              type="button"
                              onClick={() => profileAction(p.id, "hide_discover")}
                              className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-3 py-1.5 text-xs font-medium text-warm-muted hover:bg-cream"
                            >
                              <EyeOff className="h-3 w-3" /> Masquer
                            </button>
                            {p.isActive ? (
                              <button
                                type="button"
                                onClick={() => profileAction(p.id, "deactivate")}
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                              >
                                <Ban className="h-3 w-3" /> Désactiver
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => profileAction(p.id, "reactivate")}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                              >
                                <Check className="h-3 w-3" /> Réactiver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionShell>
        )}

        {tab === "signalements" && (
          <SectionShell
            title="Signalements"
            subtitle={`${reports.length} signalement${reports.length > 1 ? "s" : ""}`}
          >
            <div className="space-y-3 p-4 md:hidden">
              {reports.length === 0 ? (
                <p className="py-8 text-center text-sm text-warm-muted">Aucun signalement</p>
              ) : (
                reports.map((r) => (
                  <article key={r.id} className="mobile-card">
                    <p className="font-semibold text-warm">{r.reason}</p>
                    <p className="mt-1 text-xs text-warm-muted">{r.targetType} · par {r.reporter.firstName}</p>
                    {r.details && <p className="mt-2 line-clamp-3 text-sm italic text-warm-muted">« {r.details} »</p>}
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusBadge(r.status)}`}>{r.status}</span>
                    {r.status === "PENDING" && (
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => resolveReport(r.id, "RESOLVED")} className="flex-1 rounded-full bg-emerald-50 py-2 text-xs font-medium text-emerald-700">Résoudre</button>
                        <button type="button" onClick={() => resolveReport(r.id, "DISMISSED")} className="flex-1 rounded-full border py-2 text-xs text-warm-muted">Rejeter</button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-rose/10 bg-cream/40 text-xs font-semibold uppercase tracking-wide text-warm-muted">
                    <th className="px-6 py-4 sm:px-8">Motif</th>
                    <th className="px-4 py-4">Détails</th>
                    <th className="px-4 py-4">Type · Auteur</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-6 py-4 sm:px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-warm-muted">
                        Aucun signalement
                      </td>
                    </tr>
                  ) : (
                    reports.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`border-b border-rose/8 hover:bg-rose/5 ${i % 2 === 0 ? "bg-white" : "bg-cream/20"}`}
                      >
                        <td className="px-6 py-5 sm:px-8">
                          <p className="text-base font-semibold text-warm">{r.reason}</p>
                          <p className="mt-1 text-xs text-warm-muted">
                            {new Date(r.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </td>
                        <td className="max-w-xs px-4 py-5">
                          <p className="line-clamp-3 text-sm italic text-warm-muted">
                            {r.details ? `« ${r.details} »` : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-5">
                          <span className="inline-flex rounded-full bg-cream px-3 py-1 text-xs font-medium text-warm">
                            {r.targetType}
                          </span>
                          <p className="mt-1 text-sm text-warm-muted">par {r.reporter.firstName}</p>
                        </td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadge(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 sm:px-8">
                          {r.status === "PENDING" ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => resolveReport(r.id, "RESOLVED")}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                              >
                                <Check className="h-4 w-4" /> Traiter
                              </button>
                              <button
                                type="button"
                                onClick={() => resolveReport(r.id, "DISMISSED")}
                                className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-4 py-2 text-sm font-medium text-warm-muted hover:bg-cream"
                              >
                                <X className="h-4 w-4" /> Rejeter
                              </button>
                            </div>
                          ) : (
                            <span className="block text-right text-xs text-warm-muted">Traité</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionShell>
        )}

      </main>
    </>
  );
}
