"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import StaffPageNav from "@/components/StaffPageNav";
import { fetchJson } from "@/lib/fetch-json";
import { notifyMessagesRead } from "@/lib/message-notifications";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import MessageComposer from "@/components/MessageComposer";
import { isModerator, isStaff, ROLES } from "@/lib/roles";
import { Mail, Search, Send, Shield, MessageSquare, Users, Calendar, ArrowLeft } from "lucide-react";

function roleLabel(role: string) {
  if (role === ROLES.ADMIN) return "Admin";
  if (role === ROLES.MODERATOR) return "Modérateur";
  return "Membre";
}

function RoleBadge({ role }: { role: string }) {
  if (!isStaff(role)) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        role === ROLES.ADMIN ? "bg-plum/15 text-plum" : "bg-rose/15 text-rose"
      }`}
    >
      {roleLabel(role)}
    </span>
  );
}

interface Thread {
  userId: string;
  firstName: string;
  email: string;
  role: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

interface StaffMsg {
  id: string;
  content: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  deleted?: boolean;
  edited?: boolean;
  fromUser: { id: string; firstName: string; role: string };
}

interface UserOption {
  id: string;
  firstName: string;
  email: string;
  role: string;
}

export default function StaffMessageriePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<StaffMsg[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [teamUsers, setTeamUsers] = useState<UserOption[]>([]);
  const [activeUser, setActiveUser] = useState<UserOption | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [threadSearch, setThreadSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
    if (status === "authenticated" && !isModerator(session?.user?.role)) router.push("/decouvrir");
  }, [status, session, router]);

  async function loadThreads() {
    const { data } = await fetchJson<{ threads: Thread[] }>("/api/staff-messages");
    if (data) setThreads(data.threads);
  }

  useEffect(() => {
    if (isModerator(session?.user?.role)) loadThreads();
  }, [session]);

  useEffect(() => {
    if (!isModerator(session?.user?.role)) return;
    const q = search.trim();
    const url = q ? `/api/staff-messages/users?q=${encodeURIComponent(q)}` : "/api/staff-messages/users";
    const timer = setTimeout(() => {
      fetchJson<{ users: UserOption[]; team?: UserOption[] }>(url).then(({ data }) => {
        if (data) {
          setUsers(data.users);
          setTeamUsers(data.team ?? data.users.filter((u) => isStaff(u.role)));
        }
      });
    }, q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, session]);

  async function openThread(user: UserOption) {
    setActiveUser(user);
    setLoadingThread(true);
    const { data } = await fetchJson<{ messages: StaffMsg[] }>(`/api/staff-messages?with=${user.id}`);
    if (data) setMessages(data.messages);
    setLoadingThread(false);
    loadThreads();
    notifyMessagesRead();
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUser || !newMessage.trim()) return;
    setSending(true);
    const { error } = await fetchJson("/api/staff-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: activeUser.id, content: newMessage }),
    });
    setSending(false);
    if (!error) {
      setNewMessage("");
      openThread(activeUser);
    }
  }

  const filteredThreads = threads.filter((t) => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return true;
    return t.firstName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  const totalUnread = threads.reduce((n, t) => n + t.unread, 0);
  const mobileChatOpen = !!activeUser;

  function closeMobileChat() {
    setActiveUser(null);
    setMessages([]);
  }

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container-wide">
        <StaffPageNav backHref="/moderation" backLabel="Retour modération" role={session?.user?.role} />

        <div className="mb-6 flex items-center gap-3 md:mb-8">
          <BrandBadge size="lg" />
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 font-serif text-xl font-bold text-warm md:text-2xl">
              <Mail className="h-5 w-5 shrink-0 text-plum md:h-6 md:w-6" />
              <span className="truncate">Messagerie interne</span>
            </h1>
            <p className="text-xs text-warm-muted md:text-sm">
              Membres et équipe — {threads.length} conv.
              {totalUnread > 0 && ` · ${totalUnread} non lu${totalUnread > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-rose/15 bg-white/95 shadow-md shadow-rose/5">
          <div className="grid min-h-0 lg:min-h-[600px] lg:grid-cols-[340px_1fr]">
            <aside
              className={`flex flex-col border-b border-rose/10 lg:border-b-0 lg:border-r ${
                mobileChatOpen ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="border-b border-rose/10 bg-gradient-to-r from-cream/80 to-white px-5 py-4">
                <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-warm">
                  <MessageSquare className="h-5 w-5 text-rose" />
                  Conversations
                </h2>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-muted" />
                  <input
                    type="search"
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                    placeholder="Filtrer les conversations…"
                    className="w-full rounded-xl border border-rose/20 bg-white py-2 pl-10 pr-3 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                  />
                </div>
              </div>

              <ul className="max-h-[40vh] flex-1 overflow-y-auto lg:max-h-none">
                {filteredThreads.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-warm-muted">
                    Aucune conversation — recherchez un contact ci-dessous
                  </li>
                ) : (
                  filteredThreads.map((t) => (
                    <li key={t.userId}>
                      <button
                        type="button"
                        onClick={() =>
                          openThread({ id: t.userId, firstName: t.firstName, email: t.email, role: t.role })
                        }
                        className={`flex w-full items-start gap-3 border-b border-rose/8 px-5 py-4 text-left transition-colors hover:bg-rose/5 ${
                          activeUser?.id === t.userId ? "bg-rose/10" : ""
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum/20 to-rose/20 font-serif text-sm font-bold text-plum">
                          {t.firstName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-1.5 font-semibold text-warm">
                              <span className="truncate">{t.firstName}</span>
                              <RoleBadge role={t.role} />
                            </span>
                            {t.unread > 0 && (
                              <span className="shrink-0 rounded-full bg-rose px-2 py-0.5 text-[10px] font-bold text-white">
                                {t.unread}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-warm-muted">{t.lastMessage}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-warm-muted">
                            <Calendar className="h-3 w-3" />
                            {new Date(t.lastAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <div className="border-t border-rose/10 bg-cream/30 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-warm">
                  <Users className="h-4 w-4 text-plum" />
                  Nouveau message
                </h2>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-warm-muted" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un membre ou un collègue…"
                    className="w-full rounded-xl border border-rose/20 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                  />
                </div>
                {!search.trim() && teamUsers.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-warm-muted">Équipe</p>
                    <ul className="space-y-1">
                      {teamUsers.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => openThread(u)}
                            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white ${
                              activeUser?.id === u.id ? "bg-white ring-1 ring-plum/20" : ""
                            }`}
                          >
                            <span>
                              <span className="font-medium text-warm">{u.firstName}</span>
                              <span className="block truncate text-xs text-warm-muted">{u.email}</span>
                            </span>
                            <RoleBadge role={u.role} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-warm-muted">
                  {search.trim() ? "Résultats" : "Membres"}
                </p>
                <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto">
                  {users
                    .filter((u) => search.trim() || !isStaff(u.role))
                    .slice(0, 25)
                    .map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => openThread(u)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white ${
                          activeUser?.id === u.id ? "bg-white ring-1 ring-rose/20" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="font-medium text-warm">{u.firstName}</span>
                          <span className="block truncate text-xs text-warm-muted">{u.email}</span>
                        </span>
                        <RoleBadge role={u.role} />
                      </button>
                    </li>
                  ))}
                  {users.filter((u) => search.trim() || !isStaff(u.role)).length === 0 && (
                    <li className="py-4 text-center text-xs text-warm-muted">Aucun contact trouvé</li>
                  )}
                </ul>
              </div>
            </aside>

            <section
              className={`chat-mobile-full flex-col ${mobileChatOpen ? "flex" : "hidden lg:flex"}`}
            >
              {activeUser ? (
                <>
                  <div className="flex items-center gap-3 border-b border-rose/10 bg-gradient-to-r from-plum/5 to-rose/5 px-4 py-4 md:px-6 md:py-5">
                    <button
                      type="button"
                      onClick={closeMobileChat}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose/15 text-warm-muted hover:bg-white lg:hidden"
                      aria-label="Retour aux conversations"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum to-rose font-serif text-base font-bold text-white md:h-12 md:w-12 md:text-lg">
                      {activeUser.firstName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-warm md:text-lg">{activeUser.firstName}</h2>
                        <RoleBadge role={activeUser.role} />
                      </div>
                      <p className="truncate text-xs text-warm-muted md:text-sm">{activeUser.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-cream/20 px-4 py-4 md:px-6 md:py-6" style={{ minHeight: 200 }}>
                    {loadingThread ? (
                      <p className="text-center text-sm text-warm-muted">Chargement des messages…</p>
                    ) : messages.length === 0 ? (
                      <p className="flex h-full flex-col items-center justify-center gap-2 text-warm-muted">
                        <Mail className="h-8 w-8 text-rose/30" />
                        <span className="text-sm">Démarrez la conversation avec {activeUser.firstName}</span>
                      </p>
                    ) : (
                      messages.map((m) => (
                        <ChatMessageBubble
                          key={m.id}
                          message={m}
                          isMe={m.fromUserId === session?.user?.id}
                          myUserId={session?.user?.id}
                          apiBase="/api/staff-messages"
                          variant="staff"
                          onUpdated={() => activeUser && openThread(activeUser)}
                          headerExtra={
                            m.fromUserId !== session?.user?.id ? (
                              <span className="flex items-center gap-1">
                                {isStaff(m.fromUser.role) && <Shield className="h-3 w-3" />}
                                {m.fromUser.firstName}
                                {isStaff(m.fromUser.role) && (
                                  <span className="opacity-70">· {roleLabel(m.fromUser.role)}</span>
                                )}
                              </span>
                            ) : undefined
                          }
                        />
                      ))
                    )}
                  </div>

                  <MessageComposer
                    value={newMessage}
                    onChange={setNewMessage}
                    onSubmit={sendMessage}
                    sending={sending}
                    placeholder={`Écrire à ${activeUser.firstName}…`}
                  />
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-cream/20 p-8 text-warm-muted md:p-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose/10">
                    <Mail className="h-8 w-8 text-rose/50" />
                  </div>
                  <p className="font-serif text-lg text-warm">Sélectionnez un contact</p>
                  <p className="max-w-sm text-center text-sm">
                    Choisissez une conversation existante ou recherchez un membre ou un collègue de l&apos;équipe.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
