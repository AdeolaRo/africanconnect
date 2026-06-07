"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import StaffPageNav from "@/components/StaffPageNav";
import { fetchJson } from "@/lib/fetch-json";
import { isModerator } from "@/lib/roles";
import { Mail, Search, Send, Shield, MessageSquare, Users, Calendar } from "lucide-react";

interface Thread {
  userId: string;
  firstName: string;
  email: string;
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
      fetchJson<{ users: UserOption[] }>(url).then(({ data }) => {
        if (data) setUsers(data.users);
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

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <StaffPageNav backHref="/moderation" backLabel="Retour modération" role={session?.user?.role} />

        <div className="mb-8 flex items-center gap-3">
          <BrandBadge size="lg" />
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-warm">
              <Mail className="h-6 w-6 text-plum" />
              Messagerie interne
            </h1>
            <p className="text-sm text-warm-muted">
              Contacter tout membre — {threads.length} conversation{threads.length > 1 ? "s" : ""}
              {totalUnread > 0 && ` · ${totalUnread} non lu${totalUnread > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-rose/15 bg-white/95 shadow-md shadow-rose/5">
          <div className="grid min-h-[600px] lg:grid-cols-[340px_1fr]">
            {/* Panneau gauche */}
            <aside className="flex flex-col border-b border-rose/10 lg:border-b-0 lg:border-r">
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

              <ul className="max-h-64 flex-1 overflow-y-auto lg:max-h-none">
                {filteredThreads.length === 0 ? (
                  <li className="px-5 py-8 text-center text-sm text-warm-muted">
                    Aucune conversation — recherchez un membre ci-dessous
                  </li>
                ) : (
                  filteredThreads.map((t) => (
                    <li key={t.userId}>
                      <button
                        type="button"
                        onClick={() => openThread({ id: t.userId, firstName: t.firstName, email: t.email, role: "USER" })}
                        className={`flex w-full items-start gap-3 border-b border-rose/8 px-5 py-4 text-left transition-colors hover:bg-rose/5 ${
                          activeUser?.id === t.userId ? "bg-rose/10" : ""
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum/20 to-rose/20 font-serif text-sm font-bold text-plum">
                          {t.firstName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-warm">{t.firstName}</span>
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
                    placeholder="Rechercher un membre…"
                    className="w-full rounded-xl border border-rose/20 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                  />
                </div>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                  {users.slice(0, 25).map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => openThread(u)}
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-white ${
                          activeUser?.id === u.id ? "bg-white ring-1 ring-rose/20" : ""
                        }`}
                      >
                        <span className="font-medium text-warm">{u.firstName}</span>
                        <span className="block truncate text-xs text-warm-muted">{u.email}</span>
                      </button>
                    </li>
                  ))}
                  {users.length === 0 && (
                    <li className="py-4 text-center text-xs text-warm-muted">Aucun membre trouvé</li>
                  )}
                </ul>
              </div>
            </aside>

            {/* Zone de conversation */}
            <section className="flex flex-col">
              {activeUser ? (
                <>
                  <div className="flex items-center gap-4 border-b border-rose/10 bg-gradient-to-r from-plum/5 to-rose/5 px-6 py-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-plum to-rose font-serif text-lg font-bold text-white">
                      {activeUser.firstName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-warm">{activeUser.firstName}</h2>
                      <p className="text-sm text-warm-muted">{activeUser.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-cream/20 px-6 py-6" style={{ minHeight: 360 }}>
                    {loadingThread ? (
                      <p className="text-center text-sm text-warm-muted">Chargement des messages…</p>
                    ) : messages.length === 0 ? (
                      <p className="flex h-full flex-col items-center justify-center gap-2 text-warm-muted">
                        <Mail className="h-8 w-8 text-rose/30" />
                        <span className="text-sm">Démarrez la conversation avec {activeUser.firstName}</span>
                      </p>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.fromUserId === session?.user?.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                isMe
                                  ? "bg-gradient-to-r from-plum to-rose text-white"
                                  : "border border-rose/10 bg-white text-warm"
                              }`}
                            >
                              {!isMe && (
                                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium opacity-80">
                                  <Shield className="h-3 w-3" />
                                  {m.fromUser.firstName}
                                </p>
                              )}
                              <p>{m.content}</p>
                              <p className={`mt-1.5 text-[10px] ${isMe ? "text-white/70" : "text-warm-muted"}`}>
                                {new Date(m.createdAt).toLocaleString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="flex gap-3 border-t border-rose/10 bg-white px-6 py-4">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Écrire à ${activeUser.firstName}…`}
                      className="flex-1 rounded-xl border border-rose/20 px-4 py-3 text-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/15"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="inline-flex items-center gap-2 rounded-full gradient-pulse px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Envoi…" : "Envoyer"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-cream/20 p-12 text-warm-muted">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose/10">
                    <Mail className="h-8 w-8 text-rose/50" />
                  </div>
                  <p className="font-serif text-lg text-warm">Sélectionnez un membre</p>
                  <p className="max-w-sm text-center text-sm">
                    Choisissez une conversation existante ou recherchez un membre pour lui envoyer un message.
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
